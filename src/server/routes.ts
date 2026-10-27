import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq, and, desc, sql, inArray, gte, lte } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  users,
  passwordResetTokens,
  services,
  appointments,
  appointmentItems,
  salonSettings,
  auditLogs,
} from '../db/schema.ts';
import {
  requireAuth,
  requireAdmin,
  generateToken,
  AuthRequest,
} from './authMiddleware.ts';

export const apiRouter = Router();

// Helper for audit logging
async function logAudit(admin: { id?: number; email: string }, action: string, details?: string, req?: Request) {
  try {
    const ipAddress = (req?.headers['x-forwarded-for'] as string) || req?.socket.remoteAddress || 'unknown';
    await db.insert(auditLogs).values({
      adminId: admin.id || null,
      adminEmail: admin.email,
      action,
      details: details || null,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.slice(0, 100) : null,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// -------------------------------------------------------------
// 1. PUBLIC SETTINGS
// -------------------------------------------------------------
apiRouter.get('/settings', async (_req: Request, res: Response) => {
  try {
    const allSettings = await db.select().from(salonSettings);
    const map: Record<string, string> = {};
    for (const s of allSettings) {
      map[s.settingKey] = s.settingValue;
    }
    return res.json({ settings: map });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Erro ao carregar configurações do salão.' });
  }
});

// -------------------------------------------------------------
// 2. AUTHENTICATION & USER MANAGEMENT
// -------------------------------------------------------------

// REGISTER
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'O nome completo é obrigatório.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'O e-mail é obrigatório.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Formato de e-mail inválido. Verifique e tente novamente.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter pelo menos 6 caracteres.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'A confirmação de senha não confere com a senha digitada.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const [existing] = await db.select().from(users).where(eq(users.email, cleanEmail));
    if (existing) {
      // Exactly required by prompt specification:
      return res.status(400).json({ error: 'Esta conta já está cadastrada. Acesse sua conta.' });
    }

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const uid = 'usr_' + crypto.randomUUID();

    // Force role 'client' for new registrations (never allow client to choose admin)
    await db.insert(users).values({
      uid,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      passwordHash,
      role: 'client',
      isActive: true,
    });

    // Do NOT automatically log in after registration (mandatory rule)
    return res.status(201).json({
      message: 'Cadastro realizado com sucesso! Faça login para continuar.',
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    // Handle concurrent duplicate constraint error from database
    if (error?.code === '23505' || error?.message?.includes('users_email_unique')) {
      return res.status(400).json({ error: 'Esta conta já está cadastrada. Acesse sua conta.' });
    }
    return res.status(500).json({ error: 'Erro ao processar cadastro. Tente novamente mais tarde.' });
  }
});

// LOGIN
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail));

    // Mandatory response when account not found
    if (!user) {
      return res.status(404).json({ error: 'Conta não encontrada. Faça seu cadastro primeiro.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Esta conta está temporariamente desativada. Entre em contato com a equipe Cris_Beauty.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'Esta conta foi associada ao login social (Google). Por favor, use o botão Entrar com Google.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    // Mandatory response when password incorrect
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha incorreta. Tente novamente.' });
    }

    const token = generateToken({
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Erro ao efetuar login. Tente novamente mais tarde.' });
  }
});

// FORGOT PASSWORD REQUEST
apiRouter.post('/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !name.trim() || !email || !email.trim()) {
      return res.status(400).json({ error: 'Informe seu nome completo e e-mail cadastrados.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim().toLowerCase();

    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail));

    if (!user || !user.name.toLowerCase().includes(cleanName.split(' ')[0])) {
      return res.status(404).json({
        error: 'Não foi possível localizar uma conta com as informações fornecidas. Verifique o nome e e-mail.',
      });
    }

    // Invalidate previous tokens
    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(and(eq(passwordResetTokens.userId, user.id), eq(passwordResetTokens.used, false)));

    // Generate random secure single-use token (valid for 1 hour)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: rawToken,
      expiresAt,
      used: false,
    });

    return res.json({
      success: true,
      message: 'Token de recuperação gerado com sucesso.',
      token: rawToken, // Provided directly for immediate password reset testing
      instructions: 'Para ambiente de produção com envio automatizado de e-mails, configure as credenciais SMTP no arquivo .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Erro ao iniciar recuperação de senha.' });
  }
});

// RESET PASSWORD
apiRouter.post('/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'A confirmação de senha não confere.' });
    }

    const [resetRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, token.trim()), eq(passwordResetTokens.used, false)));

    if (!resetRecord) {
      return res.status(400).json({ error: 'Token de recuperação inválido ou já utilizado.' });
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      return res.status(400).json({ error: 'Este token de recuperação expirou. Solicite um novo link.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, resetRecord.userId));

    // Invalidate the token (single use)
    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetRecord.id));

    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
});

// GET CURRENT USER
apiRouter.get('/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// UPDATE PROFILE
apiRouter.put('/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name && name.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Para alterar a senha, informe sua senha atual.' });
      }
      if (currentUser.passwordHash) {
        const isMatch = await bcrypt.compare(currentPassword, currentUser.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ error: 'Senha atual incorreta.' });
        }
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();

    return res.json({
      message: 'Perfil atualizado com sucesso.',
      user: {
        id: updated.id,
        uid: updated.uid,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar dados do perfil.' });
  }
});

// -------------------------------------------------------------
// 3. SERVICES & PRICES
// -------------------------------------------------------------

// GET SERVICES (Public - active only, or all if admin)
apiRouter.get('/services', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    let query = db.select().from(services);
    if (!includeInactive) {
      query = query.where(eq(services.isActive, true)) as any;
    }
    const list = await query.orderBy(services.category, services.name);
    return res.json({ services: list });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ error: 'Erro ao carregar catálogo de serviços.' });
  }
});

// CREATE SERVICE (Admin only)
apiRouter.post('/services', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, price, durationMinutes, imageUrl } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Nome, categoria e preço são obrigatórios.' });
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Preço deve ser um número positivo.' });
    }

    const [created] = await db.insert(services).values({
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      price: numPrice.toFixed(2),
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 45,
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    }).returning();

    await logAudit(req.user!, 'CRIAR_SERVICO', `Criou o serviço: ${created.name} (R$ ${created.price})`, req);

    return res.status(201).json({ message: 'Serviço cadastrado com sucesso.', service: created });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return res.status(500).json({ error: 'Erro ao salvar novo serviço.' });
  }
});

// UPDATE SERVICE (Admin only)
apiRouter.put('/services/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    const { name, category, description, price, durationMinutes, imageUrl, isActive } = req.body;

    const [existing] = await db.select().from(services).where(eq(services.id, serviceId));
    if (!existing) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    const updates: Partial<typeof services.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name) updates.name = name.trim();
    if (category) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: 'Preço deve ser válido e positivo.' });
      }
      updates.price = numPrice.toFixed(2);
    }
    if (durationMinutes !== undefined) updates.durationMinutes = parseInt(durationMinutes, 10);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const [updated] = await db.update(services).set(updates).where(eq(services.id, serviceId)).returning();

    await logAudit(
      req.user!,
      'EDITAR_SERVICO',
      `Atualizou serviço ID ${serviceId} (${updated.name}) - Preço: R$ ${updated.price}`,
      req
    );

    return res.json({ message: 'Serviço atualizado com sucesso.', service: updated });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return res.status(500).json({ error: 'Erro ao atualizar dados do serviço.' });
  }
});

// -------------------------------------------------------------
// 4. AVAILABILITY & SCHEDULING
// -------------------------------------------------------------

apiRouter.get('/availability', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Formato de data inválido. Use AAAA-MM-DD.' });
    }

    // Default business hours: 09:00 to 19:00 in 30-minute intervals
    const defaultSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30'
    ];

    // Find all active appointments on this date
    const bookedAppointments = await db
      .select({ timeSlot: appointments.timeSlot })
      .from(appointments)
      .where(and(
        eq(appointments.date, date),
        sql`${appointments.status} != 'cancelado'`
      ));

    const bookedTimes = new Set(bookedAppointments.map(a => a.timeSlot));

    const slots = defaultSlots.map(time => ({
      time,
      available: !bookedTimes.has(time),
    }));

    return res.json({ date, slots });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ error: 'Erro ao verificar horários disponíveis.' });
  }
});

// CREATE APPOINTMENT (Client or Admin)
apiRouter.post('/appointments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { serviceIds, date, timeSlot, paymentMethod, notes } = req.body;

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ error: 'Selecione pelo menos um serviço para agendar.' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Data de agendamento inválida.' });
    }
    if (!timeSlot || !timeSlot.trim()) {
      return res.status(400).json({ error: 'Selecione um horário para o atendimento.' });
    }

    // 1. Fetch real service records from DB to prevent client-side price tampering
    const numericIds = serviceIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const selectedServices = await db.select().from(services).where(inArray(services.id, numericIds));

    if (selectedServices.length === 0) {
      return res.status(400).json({ error: 'Nenhum dos serviços selecionados foi encontrado no sistema.' });
    }

    // Calculate real totals on server
    let calculatedTotal = 0;
    let calculatedDuration = 0;

    for (const s of selectedServices) {
      calculatedTotal += parseFloat(s.price);
      calculatedDuration += s.durationMinutes;
    }

    // 2. Strict Real Availability Verification
    const [existingBooking] = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.date, date),
        eq(appointments.timeSlot, timeSlot.trim()),
        sql`${appointments.status} != 'cancelado'`
      ));

    if (existingBooking) {
      return res.status(409).json({
        error: 'Este horário acabou de ser reservado ou não está mais disponível. Por favor, escolha outro horário.',
      });
    }

    // 3. Generate unique appointment code
    const uniqueSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const appointmentCode = `CB-2026-${uniqueSuffix}`;

    // 4. Insert Appointment
    const [newAppointment] = await db.insert(appointments).values({
      code: appointmentCode,
      userId: req.user!.id,
      date,
      timeSlot: timeSlot.trim(),
      status: 'agendado',
      totalPrice: calculatedTotal.toFixed(2),
      totalDuration: calculatedDuration,
      paymentMethod: paymentMethod || 'PIX',
      paymentStatus: 'pendente',
      notes: notes ? notes.trim() : null,
    }).returning();

    // 5. Insert Appointment Items with price snapshots
    const itemsToInsert = selectedServices.map(service => ({
      appointmentId: newAppointment.id,
      serviceId: service.id,
      serviceName: service.name,
      unitPrice: service.price,
      durationMinutes: service.durationMinutes,
    }));

    await db.insert(appointmentItems).values(itemsToInsert);

    return res.status(201).json({
      message: 'Agendamento confirmado com sucesso!',
      appointment: {
        ...newAppointment,
        items: itemsToInsert,
      },
    });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ error: 'Erro ao processar agendamento. Tente novamente.' });
  }
});

// GET MY APPOINTMENTS (Client)
apiRouter.get('/appointments/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, req.user!.id))
      .orderBy(desc(appointments.date), desc(appointments.timeSlot));

    // Fetch items for each appointment
    const results = await Promise.all(
      userAppointments.map(async (apt) => {
        const items = await db
          .select()
          .from(appointmentItems)
          .where(eq(appointmentItems.appointmentId, apt.id));
        return { ...apt, items };
      })
    );

    return res.json({ appointments: results });
  } catch (error: any) {
    console.error('Error fetching client appointments:', error);
    return res.status(500).json({ error: 'Erro ao carregar histórico de agendamentos.' });
  }
});

// CANCEL APPOINTMENT
apiRouter.put('/appointments/:id/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id, 10);
    const [apt] = await db.select().from(appointments).where(eq(appointments.id, appointmentId));

    if (!apt) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    // Permission check: only the owner or an admin can cancel
    if (apt.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para cancelar este agendamento.' });
    }

    if (apt.status === 'cancelado') {
      return res.status(400).json({ error: 'Este agendamento já se encontra cancelado.' });
    }

    const [updated] = await db
      .update(appointments)
      .set({ status: 'cancelado', updatedAt: new Date() })
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (req.user!.role === 'admin') {
      await logAudit(req.user!, 'CANCELAR_AGENDAMENTO', `Cancelou agendamento cód: ${apt.code}`, req);
    }

    return res.json({ message: 'Agendamento cancelado com sucesso.', appointment: updated });
  } catch (error: any) {
    console.error('Error canceling appointment:', error);
    return res.status(500).json({ error: 'Erro ao cancelar agendamento.' });
  }
});

// -------------------------------------------------------------
// 5. ADMINISTRATIVE PANEL & REPORTS
// -------------------------------------------------------------

// OVERVIEW METRICS
apiRouter.get('/admin/overview', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    // 1. Total registered clients
    const [clientsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'client'));
    const totalClients = Number(clientsRes?.count || 0);

    // 2. Today's date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const todayAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(eq(appointments.date, today), sql`${appointments.status} != 'cancelado'`));
    const countToday = Number(todayAppointments[0]?.count || 0);

    // 3. Status breakdown
    const allAppointments = await db.select().from(appointments);
    let completedCount = 0;
    let cancelledCount = 0;
    let upcomingCount = 0;
    let confirmedRevenue = 0;

    for (const a of allAppointments) {
      if (a.status === 'concluido') completedCount++;
      if (a.status === 'cancelado') cancelledCount++;
      if (a.status === 'agendado' || a.status === 'confirmado') upcomingCount++;
      
      // Revenue strictly computed from CONFIRMED payments
      if (a.paymentStatus === 'confirmado') {
        confirmedRevenue += parseFloat(a.totalPrice);
      }
    }

    // 4. Most popular services
    const topServices = await db
      .select({
        serviceName: appointmentItems.serviceName,
        totalBookings: sql<number>`count(*)`,
        totalRevenue: sql<string>`sum(unit_price)`,
      })
      .from(appointmentItems)
      .groupBy(appointmentItems.serviceName)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return res.json({
      metrics: {
        totalClients,
        todayAppointments: countToday,
        upcomingAppointments: upcomingCount,
        completedAppointments: completedCount,
        cancelledAppointments: cancelledCount,
        confirmedRevenue: confirmedRevenue.toFixed(2),
        totalAppointmentsRecorded: allAppointments.length,
      },
      topServices,
    });
  } catch (error: any) {
    console.error('Error fetching admin overview:', error);
    return res.status(500).json({ error: 'Erro ao calcular indicadores administrativos.' });
  }
});

// ALL APPOINTMENTS (Admin)
apiRouter.get('/admin/appointments', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, paymentStatus, search } = req.query;

    let query = db
      .select({
        appointment: appointments,
        clientName: users.name,
        clientEmail: users.email,
        clientPhone: users.phone,
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.userId, users.id));

    const conditions = [];

    if (date && typeof date === 'string') {
      conditions.push(eq(appointments.date, date));
    }
    if (status && typeof status === 'string' && status !== 'todos') {
      conditions.push(eq(appointments.status, status));
    }
    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'todos') {
      conditions.push(eq(appointments.paymentStatus, paymentStatus));
    }

    let finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
    const rawList = await finalQuery.orderBy(desc(appointments.date), desc(appointments.timeSlot));

    // Attach items
    const list = await Promise.all(
      rawList.map(async (row) => {
        const items = await db
          .select()
          .from(appointmentItems)
          .where(eq(appointmentItems.appointmentId, row.appointment.id));
        return {
          ...row.appointment,
          client: {
            name: row.clientName,
            email: row.clientEmail,
            phone: row.clientPhone,
          },
          items,
        };
      })
    );

    return res.json({ appointments: list });
  } catch (error: any) {
    console.error('Error fetching admin appointments:', error);
    return res.status(500).json({ error: 'Erro ao carregar lista geral de agendamentos.' });
  }
});

// UPDATE APPOINTMENT STATUS & PAYMENT (Admin)
apiRouter.put('/admin/appointments/:id/status', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id, 10);
    const { status, paymentStatus } = req.body;

    const [apt] = await db.select().from(appointments).where(eq(appointments.id, appointmentId));
    if (!apt) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const updates: Partial<typeof appointments.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const [updated] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, appointmentId))
      .returning();

    await logAudit(
      req.user!,
      'ALTERAR_STATUS_AGENDAMENTO',
      `Agendamento ${apt.code}: Status -> ${status || apt.status}, Pagamento -> ${paymentStatus || apt.paymentStatus}`,
      req
    );

    return res.json({ message: 'Status do agendamento atualizado com sucesso.', appointment: updated });
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status do agendamento.' });
  }
});

// CLIENTS LIST (Admin)
apiRouter.get('/admin/clients', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const clients = await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'client'))
      .orderBy(desc(users.createdAt));

    // Get count of bookings for each client
    const enriched = await Promise.all(
      clients.map(async (c) => {
        const [countRes] = await db
          .select({ count: sql<number>`count(*)` })
          .from(appointments)
          .where(eq(appointments.userId, c.id));
        return {
          ...c,
          totalAppointments: Number(countRes?.count || 0),
        };
      })
    );

    return res.json({ clients: enriched });
  } catch (error: any) {
    console.error('Error fetching clients list:', error);
    return res.status(500).json({ error: 'Erro ao buscar lista de clientes.' });
  }
});

// TOGGLE CLIENT STATUS / EDIT CLIENT (Admin)
apiRouter.put('/admin/clients/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const { name, phone, isActive } = req.body;

    const [client] = await db.select().from(users).where(eq(users.id, clientId));
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const [updated] = await db.update(users).set(updates).where(eq(users.id, clientId)).returning();

    await logAudit(
      req.user!,
      'GERENCIAR_CLIENTE',
      `Atualizou dados do cliente ID ${clientId} (${updated.email}). Ativo: ${updated.isActive}`,
      req
    );

    return res.json({ message: 'Cliente atualizado com sucesso.', client: updated });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return res.status(500).json({ error: 'Erro ao atualizar dados do cliente.' });
  }
});

// AUDIT LOGS (Admin)
apiRouter.get('/admin/audit-logs', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    return res.json({ auditLogs: logs });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ error: 'Erro ao carregar registros de auditoria.' });
  }
});

// UPDATE SALON SETTINGS (Admin)
apiRouter.put('/admin/settings', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body; // Key-value object
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Objeto de configurações inválido.' });
    }

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string') {
        await db
          .insert(salonSettings)
          .values({
            settingKey: key,
            settingValue: value,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: salonSettings.settingKey,
            set: {
              settingValue: value,
              updatedAt: new Date(),
            },
          });
      }
    }

    await logAudit(req.user!, 'ATUALIZAR_CONFIGURACOES', 'Atualizou configurações gerais do salão', req);

    return res.json({ message: 'Configurações atualizadas com sucesso.' });
  } catch (error: any) {
    console.error('Error updating salon settings:', error);
    return res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
});

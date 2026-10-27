import { db } from './index.ts';
import { services, salonSettings, users } from './schema.ts';
import { eq, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const initialServices = [
  {
    name: 'Corte feminino',
    category: 'Cabelo',
    description: 'Corte personalizado moderno com visagismo, lavagem relaxante e finalização.',
    price: '60.00',
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Escova',
    category: 'Cabelo',
    description: 'Lavagem com produtos profissionais, escovação modelada e finalizador anti-frizz.',
    price: '45.00',
    durationMinutes: 40,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Hidratação capilar',
    category: 'Cabelo',
    description: 'Tratamento intensivo de reposição hídrica, maciez profunda e brilho acetinado.',
    price: '70.00',
    durationMinutes: 50,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Coloração',
    category: 'Cabelo',
    description: 'Aplicação de tintura profissional com proteção capilar e cobertura total de fios.',
    price: '150.00',
    durationMinutes: 120,
    imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Manicure',
    category: 'Unhas',
    description: 'Cutilagem delicada, lixamento anatômico, esmaltação impecável e hidratação das mãos.',
    price: '30.00',
    durationMinutes: 35,
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Pedicure',
    category: 'Unhas',
    description: 'Cuidado completo dos pés, esfoliação suave, cutilagem e esmaltação duradoura.',
    price: '35.00',
    durationMinutes: 40,
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Manicure e pedicure',
    category: 'Unhas',
    description: 'Combo completo de beleza e bem-estar para mãos e pés com atendimento harmonioso.',
    price: '60.00',
    durationMinutes: 70,
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Maquiagem',
    category: 'Maquiagem & Sobrancelhas',
    description: 'Maquiagem social ou festa com preparação de pele blindada, contorno e fixação 24h.',
    price: '120.00',
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Design de sobrancelhas',
    category: 'Maquiagem & Sobrancelhas',
    description: 'Mapeamento facial personalizado, simetria anatômica e alinhamento de fios.',
    price: '35.00',
    durationMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Limpeza de pele',
    category: 'Estética & Pele',
    description: 'Higienização profunda, extração indolor, vapor de ozônio, máscara calmante e LED.',
    price: '100.00',
    durationMinutes: 75,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Penteado',
    category: 'Cabelo',
    description: 'Penteados clássicos, tranças, coques estruturados ou semipresos para ocasiões especiais.',
    price: '90.00',
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Tratamento capilar',
    category: 'Cabelo',
    description: 'Cronograma capilar intensivo (nutrição, reconstrução e selagem de cutículas).',
    price: '110.00',
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
];

export const initialSettings = [
  { settingKey: 'salon_name', settingValue: 'Cris_Beauty' },
  { settingKey: 'salon_tagline', settingValue: 'Realçando sua beleza natural com sofisticação e excelência' },
  { settingKey: 'phone', settingValue: '(11) 98765-4321' },
  { settingKey: 'whatsapp', settingValue: '5511987654321' },
  { settingKey: 'email', settingValue: 'contato@crisbeauty.com.br' },
  { settingKey: 'address', settingValue: 'Alameda das Flores, 450 - Jardins, São Paulo - SP' },
  { settingKey: 'opening_hours', settingValue: 'Terça a Sábado: 09:00 às 19:00 | Domingo e Segunda: Fechado' },
  { settingKey: 'instagram', settingValue: '@crisbeauty.oficial' },
  { settingKey: 'cancellation_policy', settingValue: 'Cancelamentos e alterações permitidos com até 4 horas de antecedência.' },
  { settingKey: 'time_slot_interval', settingValue: '30' }, // 30 minutes slots
  { settingKey: 'business_start_hour', settingValue: '09:00' },
  { settingKey: 'business_end_hour', settingValue: '19:00' },
];

export async function seedDatabase() {
  try {
    // 1. Seed Services if empty
    const existingServices = await db.select({ value: count() }).from(services);
    const serviceCount = Number(existingServices[0]?.value || 0);

    if (serviceCount === 0) {
      console.log('Seeding default services for Cris_Beauty...');
      await db.insert(services).values(initialServices);
      console.log('Services seeded successfully.');
    }

    // 2. Seed Salon Settings if empty
    const existingSettings = await db.select({ value: count() }).from(salonSettings);
    const settingsCount = Number(existingSettings[0]?.value || 0);

    if (settingsCount === 0) {
      console.log('Seeding salon settings...');
      await db.insert(salonSettings).values(initialSettings);
      console.log('Salon settings seeded successfully.');
    }

    // 3. Ensure initial admin if configured in environment
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crisbeauty.com.br';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'CrisBeauty2026!Admin';

    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail.toLowerCase().trim()));
    if (existingAdmin.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      const uid = 'admin_' + crypto.randomUUID();

      await db.insert(users).values({
        uid,
        name: 'Administrador Cris_Beauty',
        email: adminEmail.toLowerCase().trim(),
        phone: '(11) 99999-8888',
        passwordHash,
        role: 'admin',
        isActive: true,
      });
      console.log(`Initial admin created with email: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error during database seed:', error);
  }
}

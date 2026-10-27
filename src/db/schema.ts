import { boolean, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (clients & administrators)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or local UUID
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  passwordHash: text('password_hash'), // bcrypt hash (null if Google auth only)
  role: text('role').notNull().default('client'), // 'client' | 'admin'
  isActive: boolean('is_active').notNull().default(true),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Password reset tokens (secure, single-use, with expiration)
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Services & Prices catalog
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'Cabelo' | 'Unhas' | 'Maquiagem & Sobrancelhas' | 'Estética & Pele'
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(45),
  imageUrl: text('image_url').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. 'CB-2026-ABCD'
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  timeSlot: text('time_slot').notNull(), // Format: '09:00', '10:30', etc.
  status: text('status').notNull().default('agendado'), // 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  totalDuration: integer('total_duration').notNull(), // in minutes
  paymentMethod: text('payment_method').notNull().default('PIX'), // 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'
  paymentStatus: text('payment_status').notNull().default('pendente'), // 'pendente' | 'confirmado' | 'recusado' | 'reembolsado'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Appointment Items (preserves historical pricing at time of booking)
export const appointmentItems = pgTable('appointment_items', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id')
    .references(() => appointments.id, { onDelete: 'cascade' })
    .notNull(),
  serviceId: integer('service_id')
    .references(() => services.id, { onDelete: 'restrict' })
    .notNull(),
  serviceName: text('service_name').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
});

// Salon Settings (editable address, whatsapp, opening hours, policies)
export const salonSettings = pgTable('salon_settings', {
  id: serial('id').primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: text('setting_value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Audit Logs (records key administrative actions without logging secrets)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => users.id, { onDelete: 'set null' }),
  adminEmail: text('admin_email').notNull(),
  action: text('action').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  resetTokens: many(passwordResetTokens),
  auditLogs: many(auditLogs),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  items: many(appointmentItems),
}));

export const appointmentItemsRelations = relations(appointmentItems, ({ one }) => ({
  appointment: one(appointments, {
    fields: [appointmentItems.appointmentId],
    references: [appointments.id],
  }),
  service: one(services, {
    fields: [appointmentItems.serviceId],
    references: [services.id],
  }),
}));

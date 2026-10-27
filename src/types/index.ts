export interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'client' | 'admin';
  isActive?: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
  totalAppointments?: number;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  durationMinutes: number;
  imageUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentItem {
  id: number;
  appointmentId: number;
  serviceId: number;
  serviceName: string;
  unitPrice: string;
  durationMinutes: number;
}

export interface Appointment {
  id: number;
  code: string;
  userId: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "14:30"
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  totalPrice: string;
  totalDuration: number;
  paymentMethod: string;
  paymentStatus: 'pendente' | 'confirmado' | 'recusado' | 'reembolsado';
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  items?: AppointmentItem[];
  client?: {
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface SalonSettings {
  salon_name?: string;
  salon_tagline?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  opening_hours?: string;
  instagram?: string;
  cancellation_policy?: string;
  time_slot_interval?: string;
  business_start_hour?: string;
  business_end_hour?: string;
  [key: string]: string | undefined;
}

export interface AuditLog {
  id: number;
  adminId: number | null;
  adminEmail: string;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AdminOverviewMetrics {
  totalClients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  confirmedRevenue: string;
  totalAppointmentsRecorded: number;
}

export interface TopServiceMetric {
  serviceName: string;
  totalBookings: number;
  totalRevenue: string;
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'cris-beauty-secret-key-2026-secure-session';

export interface AuthenticatedUser {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'client' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado. Faça login para continuar.' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // 1. Try local JWT verification first
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.id) {
      // Check user in database
      const [dbUser] = await db.select().from(users).where(eq(users.id, decoded.id));
      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ error: 'Usuário inválido ou conta desativada.' });
      }
      req.user = {
        id: dbUser.id,
        uid: dbUser.uid,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role as 'client' | 'admin',
      };
      return next();
    }
  } catch (jwtErr) {
    // If not local JWT, attempt Firebase ID Token verification
  }

  // 2. Try Firebase ID Token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
      // Find or synchronize user in PostgreSQL database
      let [dbUser] = await db.select().from(users).where(eq(users.uid, decodedToken.uid));
      
      if (!dbUser) {
        // Upsert by email or uid
        const [existingByEmail] = await db.select().from(users).where(eq(users.email, decodedToken.email?.toLowerCase() || ''));
        if (existingByEmail) {
          await db.update(users).set({ uid: decodedToken.uid }).where(eq(users.id, existingByEmail.id));
          dbUser = existingByEmail;
        } else {
          const [newUser] = await db.insert(users).values({
            uid: decodedToken.uid,
            name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Cliente',
            email: (decodedToken.email || `${decodedToken.uid}@crisbeauty.com`).toLowerCase(),
            role: 'client',
            isActive: true,
          }).returning();
          dbUser = newUser;
        }
      }

      if (!dbUser.isActive) {
        return res.status(401).json({ error: 'Esta conta está desativada. Entre em contato com a administração.' });
      }

      req.user = {
        id: dbUser.id,
        uid: dbUser.uid,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role as 'client' | 'admin',
      };
      return next();
    }
  } catch (firebaseErr) {
    console.error('Auth verification failed:', firebaseErr);
    return res.status(401).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
  }

  return res.status(401).json({ error: 'Token de autenticação inválido.' });
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores autorizados podem acessar este recurso.' });
  }
  next();
}

export function generateToken(user: { id: number; uid: string; name: string; email: string; role: string }) {
  return jwt.sign(
    {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

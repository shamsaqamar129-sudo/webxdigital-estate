import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import {
  SEED_AGENTS,
  SEED_APPOINTMENTS,
  SEED_INQUIRIES,
  SEED_PROPERTIES,
  SEED_TESTIMONIALS,
  SEED_USERS,
} from './src/data/seedData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'wxd-estate-dev-hmac-secret-change-in-prod';
// Initial demonstration code evaluated strictly on server (never exposed in frontend source)
const OFF_MARKET_ACCESS_CODE =
  process.env.OFF_MARKET_ACCESS_CODE || 'SOVEREIGN2024';

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'estate-db.json');

interface ServerDatabase {
  properties: typeof SEED_PROPERTIES;
  agents: typeof SEED_AGENTS;
  appointments: typeof SEED_APPOINTMENTS;
  inquiries: typeof SEED_INQUIRIES;
  testimonials: typeof SEED_TESTIMONIALS;
  users: (typeof SEED_USERS[number] & { passwordHash?: string })[];
  settings: {
    whatsappBusinessNumber: string;
    cryptoEscrowProvider: string;
    cryptoSettlementVerified: boolean;
    acceptedAssets: ('BTC' | 'ETH' | 'USDT')[];
  };
}

function hashPassword(password: string): string {
  return crypto
    .scryptSync(password, 'wxd-estate-salt', 32)
    .toString('hex');
}

function createSignedToken(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySignedToken(token?: string): Record<string, unknown> | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (typeof parsed.exp === 'number' && Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function buildInitialDb(): ServerDatabase {
  const adminDemoPassword =
    process.env.ADMIN_DEMO_PASSWORD || 'AdminSovereign2026!';
  return {
    properties: structuredClone(SEED_PROPERTIES),
    agents: structuredClone(SEED_AGENTS),
    appointments: structuredClone(SEED_APPOINTMENTS),
    inquiries: structuredClone(SEED_INQUIRIES),
    testimonials: structuredClone(SEED_TESTIMONIALS),
    users: SEED_USERS.map((u) => ({
      ...u,
      passwordHash:
        u.id === 'user-admin-demo'
          ? hashPassword(adminDemoPassword)
          : hashPassword('ClientPreview2026!'),
    })),
    settings: {
      whatsappBusinessNumber: process.env.VITE_WHATSAPP_BUSINESS_NUMBER || '',
      cryptoEscrowProvider: process.env.VITE_CRYPTO_ESCROW_PROVIDER || '',
      cryptoSettlementVerified: Boolean(
        process.env.VITE_CRYPTO_ESCROW_PROVIDER
      ),
      acceptedAssets: ['BTC', 'ETH', 'USDT'],
    },
  };
}

function loadDb(): ServerDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const initial = buildInitialDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as ServerDatabase;
    if (!parsed.properties || !parsed.testimonials) {
      const fresh = buildInitialDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2), 'utf8');
      return fresh;
    }
    return parsed;
  } catch {
    return buildInitialDb();
  }
}

function saveDb(db: ServerDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch {
    // Ephemeral filesystem fallback keeps in-memory state active
  }
}

let db = loadDb();

// Live Exchange Rate Cache (30-minute TTL)
interface CachedFx {
  rates: Record<string, number>;
  lastUpdated: string;
  fetchedAtMs: number;
  providerName: string;
}
let fxCache: CachedFx | null = null;
const FX_CACHE_TTL_MS = 30 * 60 * 1000;

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7).trim();
}

function sanitizeUser(u: ServerDatabase['users'][number]) {
  const { passwordHash: _ignored, ...safe } = u;
  return safe;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const payload = verifySignedToken(extractBearerToken(req));
  if (!payload || typeof payload.userId !== 'string') {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  (req as Request & { authUser?: Record<string, unknown> }).authUser = payload;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const payload = verifySignedToken(extractBearerToken(req));
  if (!payload || typeof payload.userId !== 'string') {
    res.status(401).json({ error: 'Server-side authentication required.' });
    return;
  }
  const userRecord = db.users.find((u) => u.id === payload.userId);
  if (!userRecord || userRecord.role !== 'Executive Admin') {
    res.status(403).json({
      error: 'Forbidden: Executive Admin role authorization required.',
    });
    return;
  }
  (req as Request & { authUser?: Record<string, unknown> }).authUser = payload;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // 1. Health & Backend Configuration Transparency
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      backendType: 'express-persistent-repository',
      firebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID),
      supabaseConfigured: Boolean(
        process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
      ),
      offMarketServerProtected: true,
      adminRbacProtected: true,
    });
  });

  // 2. Live Exchange Rate Endpoint (USD -> EUR, GBP, AED, SAR)
  app.get('/api/fx-rates', async (_req, res) => {
    const now = Date.now();
    if (fxCache && now - fxCache.fetchedAtMs < FX_CACHE_TTL_MS) {
      res.json({
        isLive: true,
        cached: true,
        base: 'USD',
        rates: fxCache.rates,
        lastUpdated: fxCache.lastUpdated,
        providerName: fxCache.providerName,
      });
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Upstream FX status ${response.status}`);
      }
      const data = (await response.json()) as {
        result?: string;
        time_last_update_utc?: string;
        rates?: Record<string, number>;
      };

      if (!data.rates || typeof data.rates.EUR !== 'number') {
        throw new Error('Malformed exchange rate payload');
      }

      const selectedRates = {
        USD: 1,
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        AED: data.rates.AED,
        SAR: data.rates.SAR,
      };

      const updatedIso = data.time_last_update_utc
        ? new Date(data.time_last_update_utc).toISOString()
        : new Date().toISOString();

      fxCache = {
        rates: selectedRates,
        lastUpdated: updatedIso,
        fetchedAtMs: now,
        providerName: 'ExchangeRate-API (Live Market Feed)',
      };

      res.json({
        isLive: true,
        cached: false,
        base: 'USD',
        rates: selectedRates,
        lastUpdated: updatedIso,
        providerName: fxCache.providerName,
      });
    } catch {
      // Never disguise static values as live rates! Return explicit fallback notice.
      if (fxCache) {
        res.json({
          isLive: true,
          cached: true,
          stale: true,
          base: 'USD',
          rates: fxCache.rates,
          lastUpdated: fxCache.lastUpdated,
          providerName: `${fxCache.providerName} (Cached)`,
        });
        return;
      }

      res.status(503).json({
        isLive: false,
        base: 'USD',
        rates: { USD: 1 },
        lastUpdated: null,
        providerName: 'Unavailable',
        error:
          'Live foreign exchange feed is temporarily unreachable. Displaying base USD valuations rather than unverified fixed rates.',
      });
    }
  });

  // 3. Public Bootstrap Data (Strips Off-Market Listings & PII!)
  app.get('/api/bootstrap', (req, res) => {
    const authPayload = verifySignedToken(extractBearerToken(req));
    const currentUser = authPayload?.userId
      ? db.users.find((u) => u.id === authPayload.userId)
      : null;
    const isAdmin = currentUser?.role === 'Executive Admin';

    const publicProperties = db.properties.filter((p) => !p.isOffMarket);
    const bookedSlots = db.appointments
      .filter((a) => a.status !== 'Cancelled')
      .map((a) => ({
        propertyId: a.propertyId,
        preferredDate: a.preferredDate,
        preferredTime: a.preferredTime,
      }));

    res.json({
      properties: isAdmin ? db.properties : publicProperties,
      agents: db.agents,
      testimonials: db.testimonials,
      bookedSlots,
      settings: db.settings,
      currentUser: currentUser ? sanitizeUser(currentUser) : null,
      myAppointments: currentUser
        ? isAdmin
          ? db.appointments
          : db.appointments.filter(
              (a) =>
                a.userId === currentUser.id ||
                a.clientEmail.toLowerCase() === currentUser.email.toLowerCase()
            )
        : [],
      myInquiries: currentUser
        ? isAdmin
          ? db.inquiries
          : db.inquiries
              .filter(
                (i) =>
                  i.userId === currentUser.id ||
                  i.clientEmail.toLowerCase() === currentUser.email.toLowerCase()
              )
              .map(({ internalNotes: _redacted, ...rest }) => ({
                ...rest,
                internalNotes: '',
              }))
        : [],
      adminData: isAdmin
        ? {
            users: db.users.map(sanitizeUser),
            inquiries: db.inquiries,
            appointments: db.appointments,
          }
        : null,
    });
  });

  // 4. Server-Side Off-Market Vault Verification
  app.post('/api/off-market/unlock', (req, res) => {
    const submittedCode = String(req.body?.accessCode || '').trim();
    if (!submittedCode) {
      res.status(400).json({ error: 'Please enter an off-market access code.' });
      return;
    }

    if (submittedCode !== OFF_MARKET_ACCESS_CODE) {
      res.status(401).json({
        error: 'Invalid Sovereign Vault code. Access denied by server gate.',
      });
      return;
    }

    const clearanceToken = createSignedToken({
      scope: 'off-market-read',
      exp: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
    });

    const offMarketListings = db.properties.filter((p) => p.isOffMarket);
    res.json({
      clearanceToken,
      properties: offMarketListings,
    });
  });

  app.get('/api/off-market/properties', (req, res) => {
    const token = extractBearerToken(req);
    const verified = verifySignedToken(token);
    if (!verified || verified.scope !== 'off-market-read') {
      res
        .status(403)
        .json({ error: 'Valid off-market clearance token required.' });
      return;
    }
    res.json({
      properties: db.properties.filter((p) => p.isOffMarket),
    });
  });

  // 5. Server-Side Authentication & Role Session Issuing
  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({
        error: 'Invalid credentials. Verify your email/password or use a Demo Preview session.',
      });
      return;
    }

    const token = createSignedToken({
      userId: user.id,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: sanitizeUser(user),
    });
  });

  app.post('/api/auth/demo', (req, res) => {
    const role = req.body?.role === 'admin' ? 'admin' : 'client';
    const targetId = role === 'admin' ? 'user-admin-demo' : 'user-client-demo';
    const user = db.users.find((u) => u.id === targetId) || db.users[0];

    const token = createSignedToken({
      userId: user.id,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: sanitizeUser(user),
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const fullName = String(req.body?.fullName || '').trim();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const phone = String(req.body?.phone || '').trim();
    const location = String(req.body?.location || 'International').trim();
    const password = String(req.body?.password || '');
    const requestedRole =
      req.body?.role === 'Family Office Investor'
        ? 'Family Office Investor'
        : 'VIP Client';

    if (fullName.length < 2 || !email.includes('@') || password.length < 6) {
      res.status(400).json({
        error: 'Please provide a valid full name, email, and 6+ character password.',
      });
      return;
    }

    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({
        error: 'An account with this email is already registered.',
      });
      return;
    }

    const newUser = {
      id: `user-${Date.now().toString().slice(-6)}`,
      fullName,
      email,
      phone,
      // Self-registration can never escalate to Executive Admin
      role: requestedRole as (typeof SEED_USERS)[number]['role'],
      location,
      preferredCurrency: 'USD' as (typeof SEED_USERS)[number]['preferredCurrency'],
      status: 'Active' as const,
      joinedAt: new Date().toISOString().split('T')[0],
      savedPropertyIds: Array.isArray(req.body?.savedPropertyIds)
        ? req.body.savedPropertyIds.slice(0, 25)
        : [],
      passwordHash: hashPassword(password),
    };

    db.users.unshift(newUser);
    saveDb(db);

    const token = createSignedToken({
      userId: newUser.id,
      role: newUser.role,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      user: sanitizeUser(newUser),
    });
  });

  app.put('/api/user/profile', requireAuth, (req, res) => {
    const authUser = (req as Request & { authUser: { userId: string } }).authUser;
    const target = db.users.find((u) => u.id === authUser.userId);
    if (!target) {
      res.status(404).json({ error: 'Account not found.' });
      return;
    }

    if (typeof req.body?.fullName === 'string' && req.body.fullName.trim()) {
      target.fullName = req.body.fullName.trim().slice(0, 100);
    }
    if (typeof req.body?.phone === 'string') {
      target.phone = req.body.phone.trim().slice(0, 40);
    }
    if (typeof req.body?.location === 'string') {
      target.location = req.body.location.trim().slice(0, 100);
    }
    if (typeof req.body?.preferredCurrency === 'string') {
      target.preferredCurrency = req.body.preferredCurrency;
    }
    if (Array.isArray(req.body?.savedPropertyIds)) {
      target.savedPropertyIds = req.body.savedPropertyIds.slice(0, 50);
    }

    saveDb(db);
    res.json({ user: sanitizeUser(target) });
  });

  // 6. Private Viewing Appointment Booking (Prevents Double-Booked Slots!)
  app.post('/api/appointments', (req, res) => {
    const {
      propertyId,
      propertyTitle,
      propertyReference,
      clientName,
      clientEmail,
      clientPhone,
      preferredDate,
      preferredTime,
      guests,
      message,
    } = req.body || {};

    if (
      !propertyId ||
      !clientName ||
      !String(clientEmail || '').includes('@') ||
      !clientPhone ||
      !preferredDate ||
      !preferredTime
    ) {
      res.status(400).json({
        error: 'Please complete all required private viewing fields.',
      });
      return;
    }

    const slotTaken = db.appointments.some(
      (apt) =>
        apt.propertyId === propertyId &&
        apt.preferredDate === preferredDate &&
        apt.preferredTime === preferredTime &&
        apt.status !== 'Cancelled'
    );

    if (slotTaken) {
      res.status(409).json({
        error: `The ${preferredTime} viewing slot on ${preferredDate} is already reserved. Please select an alternative time.`,
      });
      return;
    }

    const authPayload = verifySignedToken(extractBearerToken(req));
    const newAppointment = {
      id: `apt-${Date.now().toString().slice(-6)}`,
      propertyId: String(propertyId),
      propertyTitle: String(propertyTitle || 'Luxury Residence'),
      propertyReference: String(propertyReference || 'WXD'),
      userId:
        typeof authPayload?.userId === 'string' ? authPayload.userId : undefined,
      clientName: String(clientName).trim().slice(0, 100),
      clientEmail: String(clientEmail).trim().slice(0, 120),
      clientPhone: String(clientPhone).trim().slice(0, 40),
      preferredDate: String(preferredDate),
      preferredTime: String(preferredTime),
      guests: Math.min(10, Math.max(1, Number(guests) || 1)),
      message: String(message || '').trim().slice(0, 1000),
      status: 'Confirmed' as (typeof SEED_APPOINTMENTS)[number]['status'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    db.appointments.unshift(newAppointment);
    saveDb(db);
    res.status(201).json({ appointment: newAppointment });
  });

  // 7. Validated Lead & Contact Inquiries
  app.post('/api/inquiries', (req, res) => {
    const {
      type,
      propertyId,
      propertyTitle,
      propertyReference,
      agentId,
      agentName,
      clientName,
      clientEmail,
      clientPhone,
      preferredDate,
      message,
    } = req.body || {};

    if (
      !clientName ||
      !String(clientEmail || '').includes('@') ||
      !clientPhone ||
      !message
    ) {
      res.status(400).json({
        error: 'Valid name, email, telephone, and message are required.',
      });
      return;
    }

    const authPayload = verifySignedToken(extractBearerToken(req));
    const nextInquiry = {
      id: `inq-${Date.now().toString().slice(-6)}`,
      type: type || 'GENERAL_CONTACT',
      propertyId,
      propertyTitle,
      propertyReference,
      agentId,
      agentName,
      userId:
        typeof authPayload?.userId === 'string' ? authPayload.userId : undefined,
      clientName: String(clientName).trim().slice(0, 100),
      clientEmail: String(clientEmail).trim().slice(0, 120),
      clientPhone: String(clientPhone).trim().slice(0, 40),
      preferredDate: preferredDate ? String(preferredDate) : undefined,
      message: String(message).trim().slice(0, 1500),
      status: 'New' as (typeof SEED_INQUIRIES)[number]['status'],
      internalNotes: '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    db.inquiries.unshift(nextInquiry);
    saveDb(db);
    res.status(201).json({ inquiry: nextInquiry });
  });

  // 8. Client Seller Mandate Submission
  app.post('/api/properties/submit', (req, res) => {
    const prop = req.body?.property;
    if (!prop || !prop.title || !prop.priceUsd || !prop.city) {
      res.status(400).json({ error: 'Invalid property mandate payload.' });
      return;
    }

    const authPayload = verifySignedToken(extractBearerToken(req));
    const sanitized = {
      ...prop,
      id: `prop-${Date.now().toString().slice(-7)}`,
      isOffMarket: Boolean(prop.isOffMarket),
      submittedByUserId:
        typeof authPayload?.userId === 'string'
          ? authPayload.userId
          : prop.submittedByUserId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    db.properties.unshift(sanitized);
    saveDb(db);
    res.status(201).json({ property: sanitized });
  });

  // =========================================================================
  // 9. ADMIN-PROTECTED ROUTES (Server-Side Auth + Executive Admin RBAC)
  // =========================================================================
  app.post('/api/admin/properties', requireAdmin, (req, res) => {
    const prop = req.body?.property;
    if (!prop || !prop.title || !prop.priceUsd) {
      res.status(400).json({ error: 'Title and valuation are required.' });
      return;
    }
    const created = {
      ...prop,
      id: prop.id || `prop-${Date.now().toString().slice(-7)}`,
      createdAt: prop.createdAt || new Date().toISOString().split('T')[0],
    };
    db.properties.unshift(created);
    saveDb(db);
    res.status(201).json({ property: created });
  });

  app.put('/api/admin/properties/:id', requireAdmin, (req, res) => {
    const idx = db.properties.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Property not found.' });
      return;
    }
    db.properties[idx] = {
      ...db.properties[idx],
      ...req.body,
      id: db.properties[idx].id,
    };
    saveDb(db);
    res.json({ property: db.properties[idx] });
  });

  app.delete('/api/admin/properties/:id', requireAdmin, (req, res) => {
    db.properties = db.properties.filter((p) => p.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  app.put('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
    const target = db.inquiries.find((i) => i.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    if (typeof req.body?.status === 'string') {
      target.status = req.body.status;
    }
    if (typeof req.body?.internalNotes === 'string') {
      target.internalNotes = req.body.internalNotes.slice(0, 2000);
    }
    saveDb(db);
    res.json({ inquiry: target });
  });

  app.put('/api/admin/appointments/:id', requireAdmin, (req, res) => {
    const target = db.appointments.find((a) => a.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }
    if (typeof req.body?.status === 'string') {
      target.status = req.body.status;
    }
    saveDb(db);
    res.json({ appointment: target });
  });

  app.post('/api/admin/agents', requireAdmin, (req, res) => {
    const agent = req.body?.agent;
    if (!agent || !agent.name || !agent.email) {
      res.status(400).json({ error: 'Advisor name and email are required.' });
      return;
    }
    const created = {
      ...agent,
      id: `agent-${Date.now().toString().slice(-6)}`,
    };
    db.agents.push(created);
    saveDb(db);
    res.status(201).json({ agent: created });
  });

  app.delete('/api/admin/agents/:id', requireAdmin, (req, res) => {
    db.agents = db.agents.filter((a) => a.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
    const target = db.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (typeof req.body?.role === 'string') {
      target.role = req.body.role;
    }
    if (typeof req.body?.status === 'string') {
      target.status = req.body.status;
    }
    saveDb(db);
    res.json({ user: sanitizeUser(target) });
  });

  app.post('/api/admin/testimonials', requireAdmin, (req, res) => {
    const item = req.body?.testimonial;
    if (!item || !item.clientName || !item.quote) {
      res.status(400).json({ error: 'Client name and review quote required.' });
      return;
    }
    const created = {
      ...item,
      id: `test-${Date.now().toString().slice(-6)}`,
    };
    db.testimonials.unshift(created);
    saveDb(db);
    res.status(201).json({ testimonial: created });
  });

  app.delete('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
    db.testimonials = db.testimonials.filter((t) => t.id !== req.params.id);
    saveDb(db);
    res.json({ ok: true });
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    if (typeof req.body?.whatsappBusinessNumber === 'string') {
      db.settings.whatsappBusinessNumber = req.body.whatsappBusinessNumber
        .replace(/[^0-9]/g, '')
        .slice(0, 20);
    }
    if (typeof req.body?.cryptoEscrowProvider === 'string') {
      db.settings.cryptoEscrowProvider = req.body.cryptoEscrowProvider
        .trim()
        .slice(0, 120);
      db.settings.cryptoSettlementVerified = Boolean(
        db.settings.cryptoEscrowProvider
      );
    }
    saveDb(db);
    res.json({ settings: db.settings });
  });

  app.post('/api/admin/reset', requireAdmin, (_req, res) => {
    db = buildInitialDb();
    saveDb(db);
    res.json({ ok: true });
  });

  // Vite Middleware in Development / Static Dist in Production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WEBXDIGITAL ESTATE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

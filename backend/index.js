import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from "./config/db.js";
import Tenant from "./models/Tenant.js";
import User from "./models/User.js";
import Note from "./models/Note.js";
import noteRoutes from './routes/noteRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import authRoutes from './routes/authRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/notes', noteRoutes);

connectDB().then(() => {
  app.listen(PORT, async () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);

    // Seed tenants & users (only first time)
    const acme = await Tenant.findOneAndUpdate(
      { slug: 'acme' },
      { slug: 'acme', name: 'Acme Corporation' },
      { upsert: true, new: true }
    );
    const globex = await Tenant.findOneAndUpdate(
      { slug: 'globex' },
      { slug: 'globex', name: 'Globex Corporation' },
      { upsert: true, new: true }
    );

    const passwordHash = await bcrypt.hash('password', 10);


    await User.findOneAndUpdate(
      { email: 'admin@acme.test' },
      { email: 'admin@acme.test', password_hash: passwordHash, role: 'admin', tenant_id: acme._id },
      { upsert: true }
    );
    await User.findOneAndUpdate(
      { email: 'user@acme.test' },
      { email: 'user@acme.test', password_hash: passwordHash, role: 'member', tenant_id: acme._id },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { email: 'admin@globex.test' },
      { email: 'admin@globex.test', password_hash: passwordHash, role: 'admin', tenant_id: globex._id },
      { upsert: true }
    );
    await User.findOneAndUpdate(
      { email: 'user@globex.test' },
      { email: 'user@globex.test', password_hash: passwordHash, role: 'member', tenant_id: globex._id },
      { upsert: true }
    );

    console.log('\n✅ Test accounts created:');
    console.log('- admin@acme.test (password: password)');
    console.log('- user@acme.test (password: password)');
    console.log('- admin@globex.test (password: password)');
    console.log('- user@globex.test (password: password)');
  });
});
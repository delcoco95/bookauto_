/**
 * Script de seed — crée le compte admin en production (MongoDB Atlas)
 * Usage: MONGODB_URI="mongodb+srv://..." node seed-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI manquant');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'client' },
  isActive: { type: Boolean, default: true },
  isExempt: { type: Boolean, default: false },
  subscriptionStatus: { type: String, default: 'inactive' },
}, { timestamps: true, strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const email = 'admin@bookauto.fr';
  const existing = await User.findOne({ email });

  if (existing) {
    // Update to ensure admin role
    const hash = await bcrypt.hash('Admin@Bookauto2024!', 12);
    await User.findOneAndUpdate({ email }, {
      role: 'admin',
      isActive: true,
      isExempt: true,
      password: hash,
    });
    console.log('✅ Compte admin mis à jour');
  } else {
    const hash = await bcrypt.hash('Admin@Bookauto2024!', 12);
    await User.create({
      firstName: 'Admin',
      lastName: 'BookAuto',
      email,
      password: hash,
      role: 'admin',
      isActive: true,
      isExempt: true,
      subscriptionStatus: 'exempt',
    });
    console.log('✅ Compte admin créé');
  }

  // Create test pro account (exempt)
  const proEmail = 'pro.test@bookauto.fr';
  const existingPro = await User.findOne({ email: proEmail });
  if (!existingPro) {
    const hash = await bcrypt.hash('ProTest@123!', 12);
    await User.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: proEmail,
      password: hash,
      role: 'pro',
      isActive: true,
      isExempt: true,
      subscriptionStatus: 'exempt',
      companyName: 'Garage du Centre',
      siret: '12345678901234',
      categories: ['automobile'],
      phone: '0601020304',
    });
    console.log('✅ Compte pro test créé');
  } else {
    await User.findOneAndUpdate({ email: proEmail }, {
      isExempt: true,
      isActive: true,
      subscriptionStatus: 'exempt',
    });
    console.log('✅ Compte pro test mis à jour (exempt)');
  }

  console.log('\n📋 Identifiants :');
  console.log('  Admin  : admin@bookauto.fr / Admin@Bookauto2024!');
  console.log('  Pro    : pro.test@bookauto.fr / ProTest@123!');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });

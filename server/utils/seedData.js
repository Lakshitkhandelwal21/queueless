require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Organization = require('../models/Organization');
const Service = require('../models/Service');
const Counter = require('../models/Counter');
const Staff = require('../models/Staff');
const Queue = require('../models/Queue');
const QueueSession = require('../models/QueueSession');
const QueueEntry = require('../models/QueueEntry');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Organization.deleteMany();
    await Service.deleteMany();
    await Counter.deleteMany();
    await Staff.deleteMany();
    await Queue.deleteMany();
    await QueueSession.deleteMany();
    await QueueEntry.deleteMany();

    console.log('Creating default users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@queueless.com',
      phone: '1234567890',
      passwordHash: 'admin123',
      role: 'admin',
    });

    const staffUser = await User.create({
      name: 'Sarah Connor (Staff)',
      email: 'staff@queueless.com',
      phone: '0987654321',
      passwordHash: 'staff123',
      role: 'staff',
    });

    const customerUser = await User.create({
      name: 'John Doe (Customer)',
      email: 'customer@queueless.com',
      phone: '5551234567',
      passwordHash: 'customer123',
      role: 'customer',
    });

    console.log('Creating sample Organization...');
    const org = await Organization.create({
      name: 'Metro City General Hospital & Civic Services',
      description: 'Primary public service and health center',
      address: '100 Main Civic Center Boulevard',
      phone: '+1 (555) 019-2831',
      email: 'info@metrocity.org',
    });

    console.log('Creating Services...');
    const generalService = await Service.create({
      organizationId: org._id,
      name: 'General Consultation',
      description: 'Standard outpatient checkup and consultation',
      averageServiceTime: 8,
      priorityEnabled: true,
    });

    const billingService = await Service.create({
      organizationId: org._id,
      name: 'Billing & Payments',
      description: 'Cashier and insurance payment counters',
      averageServiceTime: 5,
      priorityEnabled: false,
    });

    console.log('Creating Counters...');
    const counter1 = await Counter.create({
      organizationId: org._id,
      name: 'Consultation Counter 1',
      counterNumber: 1,
      status: 'open',
    });

    const counter2 = await Counter.create({
      organizationId: org._id,
      name: 'Billing Counter 2',
      counterNumber: 2,
      status: 'open',
    });

    console.log('Assigning Staff to Counter...');
    await Staff.create({
      userId: staffUser._id,
      organizationId: org._id,
      counterId: counter1._id,
      status: 'active',
    });

    console.log('Creating Queues...');
    const queueA = await Queue.create({
      organizationId: org._id,
      serviceId: generalService._id,
      name: 'Consultation Queue A',
      prefix: 'A',
      status: 'open',
    });

    const queueB = await Queue.create({
      organizationId: org._id,
      serviceId: billingService._id,
      name: 'Express Billing Queue B',
      prefix: 'B',
      status: 'open',
    });

    console.log('Creating active QueueSession for today...');
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionA = await QueueSession.create({
      queueId: queueA._id,
      date: todayStr,
      sequenceNumber: 105,
      status: 'active',
    });

    console.log('Creating sample Queue Entries...');
    await QueueEntry.create({
      sessionId: sessionA._id,
      queueId: queueA._id,
      customerId: customerUser._id,
      tokenNumber: 104,
      tokenLabel: 'A-104',
      status: 'serving',
      counterId: counter1._id,
      calledBy: staffUser._id,
      joinedAt: new Date(Date.now() - 20 * 60000),
      calledAt: new Date(Date.now() - 5 * 60000),
      servedAt: new Date(Date.now() - 3 * 60000),
    });

    await QueueEntry.create({
      sessionId: sessionA._id,
      queueId: queueA._id,
      customerId: customerUser._id,
      tokenNumber: 105,
      tokenLabel: 'A-105',
      status: 'waiting',
      priority: 0,
      joinedAt: new Date(Date.now() - 10 * 60000),
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

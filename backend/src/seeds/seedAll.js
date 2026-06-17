/**
 * Full Database Seed Script — Tiffo Platform
 * ─────────────────────────────────────────
 * Run:  node src/seeds/seedAll.js
 * Use:  node src/seeds/seedAll.js --fresh   (drops existing data first)
 *
 * Creates:
 *   • 1 Admin  + 5 Customers + 3 Partners (Users)
 *   • 3 Partner business records
 *   • 9 Tiffin listings  (3 per partner)
 *   • 5 Subscriptions
 *   • 8 Reviews
 *   • 4 Blog posts
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Partner = require('../models/Partner');
const Tiffin = require('../models/Tiffin');
const Subscription = require('../models/Subscription');
const Review = require('../models/Review');
const Blog = require('../models/Blog');

const FRESH = process.argv.includes('--fresh');

// ─── Helpers ────────────────────────────────────────────────────────────────
const days = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt;
};

// ─── Users ──────────────────────────────────────────────────────────────────
const USERS = [
  {
    name: 'Admin User',
    email: 'admin@tiffo.com',
    password: process.env.SEED_ADMIN_PASSWORD,
    phone: '+91 99999 99999',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: process.env.SEED_USER_PASSWORD,
    phone: '+91 90000 00001',
    role: 'user',
    isVerified: true,
    address: { street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan@example.com',
    password: process.env.SEED_USER_PASSWORD,
    phone: '+91 90000 00002',
    role: 'user',
    isVerified: true,
    address: { street: '34 Linking Rd', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
  },
  {
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    password: process.env.SEED_USER_PASSWORD,
    phone: '+91 90000 00003',
    role: 'user',
    isVerified: true,
    address: { street: '56 Baner Rd', city: 'Pune', state: 'Maharashtra', pincode: '411045' },
  },
  {
    name: 'Vikram Patel',
    email: 'vikram@example.com',
    password: process.env.SEED_USER_PASSWORD,
    phone: '+91 90000 00004',
    role: 'user',
    isVerified: true,
    address: { street: '78 HSR Layout', city: 'Bangalore', state: 'Karnataka', pincode: '560102' },
  },
  {
    name: 'Neha Gupta',
    email: 'neha@example.com',
    password: process.env.SEED_USER_PASSWORD,
    phone: '+91 90000 00005',
    role: 'user',
    isVerified: true,
    address: { street: '90 Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
  },
  {
    name: 'Suresh Iyer',
    email: 'partner1@tiffo.com',
    password: process.env.SEED_PARTNER_PASSWORD,
    phone: '+91 77777 77771',
    role: 'partner',
    isVerified: true,
  },
  {
    name: 'Meena Shetty',
    email: 'partner2@tiffo.com',
    password: process.env.SEED_PARTNER_PASSWORD,
    phone: '+91 77777 77772',
    role: 'partner',
    isVerified: true,
  },
  {
    name: 'Rajesh Nair',
    email: 'partner3@tiffo.com',
    password: process.env.SEED_PARTNER_PASSWORD,
    phone: '+91 77777 77773',
    role: 'partner',
    isVerified: true,
  },
];

// ─── Partner Businesses ─────────────────────────────────────────────────────
const PARTNER_BUSINESSES = [
  {
    emailKey: 'partner1@tiffo.com',
    businessName: 'Desi Kitchen',
    description:
      'Authentic home-style Indian tiffin with fresh, healthy meals cooked daily by experienced home chefs. No preservatives, just love.',
    address: {
      street: '456 FC Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      coordinates: { lat: 18.5204, lng: 73.8567 },
    },
    contact: { phone: '+91 77777 77771', whatsapp: '+91 77777 77771', email: 'partner1@tiffo.com' },
    businessHours: {
      open: '07:00',
      close: '21:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    deliveryRadius: 10,
    rating: { average: 4.6, count: 42 },
    verified: true,
    isActive: true,
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Suresh Iyer',
    },
  },
  {
    emailKey: 'partner2@tiffo.com',
    businessName: "Meena's Tiffin Corner",
    description:
      'South Indian specials and wholesome North-South fusion tiffins. Known for our sambar, rasam and thali combos.',
    address: {
      street: '789 Koramangala 5th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560095',
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    contact: { phone: '+91 77777 77772', whatsapp: '+91 77777 77772', email: 'partner2@tiffo.com' },
    businessHours: {
      open: '08:00',
      close: '20:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    deliveryRadius: 8,
    rating: { average: 4.8, count: 67 },
    verified: true,
    isActive: true,
    bankDetails: {
      accountNumber: '0987654321',
      ifscCode: 'ICIC0005678',
      accountHolderName: 'Meena Shetty',
    },
  },
  {
    emailKey: 'partner3@tiffo.com',
    businessName: 'Rajesh Bhojanalaya',
    description:
      'Traditional Gujarati and Rajasthani thali service. Unlimited refills on weekends. Serving Mumbai since 2015.',
    address: {
      street: '101 Dadar West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400028',
      coordinates: { lat: 19.0178, lng: 72.8478 },
    },
    contact: { phone: '+91 77777 77773', whatsapp: '+91 77777 77773', email: 'partner3@tiffo.com' },
    businessHours: {
      open: '09:00',
      close: '22:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    deliveryRadius: 12,
    rating: { average: 4.3, count: 38 },
    verified: true,
    isActive: true,
    bankDetails: {
      accountNumber: '1122334455',
      ifscCode: 'SBIN0009876',
      accountHolderName: 'Rajesh Nair',
    },
  },
];

// ─── Tiffins ─────────────────────────────────────────────────────────────────
const TIFFINS = (partnerMap) => [
  // Desi Kitchen
  {
    partnerKey: 'partner1@tiffo.com',
    title: 'Punjabi Lunch Thali',
    description:
      'Dal makhani, paneer butter masala, 4 rotis, jeera rice, salad and pickle. A hearty North Indian meal.',
    price: { daily: 130, weekly: 840, monthly: 3200 },
    mealType: 'lunch',
    cuisine: 'North Indian',
    dietary: ['vegetarian'],
    ingredients: ['Paneer', 'Dal', 'Wheat Flour', 'Rice', 'Tomato', 'Onion', 'Spices'],
    nutritionInfo: { calories: 650, protein: 22, carbs: 85, fat: 18 },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxOrders: 60,
    },
    rating: { average: 4.7, count: 35 },
    isActive: true,
  },
  {
    partnerKey: 'partner1@tiffo.com',
    title: 'Healthy Breakfast Box',
    description:
      'Poha or upma with coconut chutney, boiled eggs (optional), seasonal fruit, and green tea.',
    price: { daily: 70, weekly: 450, monthly: 1700 },
    mealType: 'breakfast',
    cuisine: 'North Indian',
    dietary: ['vegetarian'],
    ingredients: ['Poha', 'Upma', 'Coconut', 'Seasonal Fruit'],
    nutritionInfo: { calories: 350, protein: 10, carbs: 55, fat: 8 },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxOrders: 80,
    },
    rating: { average: 4.4, count: 20 },
    isActive: true,
  },
  {
    partnerKey: 'partner1@tiffo.com',
    title: 'Chicken Dinner Special',
    description:
      'Chicken curry, dal tadka, 2 chapatis, steamed rice, raita and dessert (gulab jamun).',
    price: { daily: 160, weekly: 1000, monthly: 3800 },
    mealType: 'dinner',
    cuisine: 'North Indian',
    dietary: ['non-vegetarian'],
    ingredients: ['Chicken', 'Dal', 'Wheat Flour', 'Rice', 'Yogurt', 'Spices'],
    nutritionInfo: { calories: 720, protein: 40, carbs: 70, fat: 22 },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxOrders: 50,
    },
    rating: { average: 4.8, count: 28 },
    isActive: true,
  },

  // Meena's Tiffin Corner
  {
    partnerKey: 'partner2@tiffo.com',
    title: 'South Indian Lunch Combo',
    description:
      'Sambar rice, rasam, 2 vegetable curries, papad, pickle and curd. Authentic Udupi flavours.',
    price: { daily: 120, weekly: 780, monthly: 2900 },
    mealType: 'lunch',
    cuisine: 'South Indian',
    dietary: ['vegetarian'],
    ingredients: ['Rice', 'Lentils', 'Tamarind', 'Coconut', 'Mixed Vegetables'],
    nutritionInfo: { calories: 590, protein: 18, carbs: 90, fat: 12 },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      maxOrders: 100,
    },
    rating: { average: 4.9, count: 55 },
    isActive: true,
  },
  {
    partnerKey: 'partner2@tiffo.com',
    title: 'Idli & Dosa Breakfast',
    description: '4 soft idlis or 2 masala dosas with coconut chutney, tomato chutney and sambar.',
    price: { daily: 80, weekly: 520, monthly: 1900 },
    mealType: 'breakfast',
    cuisine: 'South Indian',
    dietary: ['vegetarian'],
    ingredients: ['Rice', 'Urad Dal', 'Fenugreek', 'Potato', 'Coconut'],
    nutritionInfo: { calories: 380, protein: 12, carbs: 65, fat: 7 },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      maxOrders: 120,
    },
    rating: { average: 4.8, count: 72 },
    isActive: true,
  },
  {
    partnerKey: 'partner2@tiffo.com',
    title: 'Vegan Dinner Bowl',
    description:
      'Millet khichdi, stir-fried greens, mixed salad, moong soup. 100% plant-based and gluten-free.',
    price: { daily: 140, weekly: 900, monthly: 3400 },
    mealType: 'dinner',
    cuisine: 'South Indian',
    dietary: ['vegan', 'gluten-free'],
    ingredients: ['Millet', 'Moong', 'Mixed Greens', 'Seasonal Vegetables'],
    nutritionInfo: { calories: 420, protein: 16, carbs: 60, fat: 9 },
    availability: { days: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'], maxOrders: 40 },
    rating: { average: 4.6, count: 18 },
    isActive: true,
  },

  // Rajesh Bhojanalaya
  {
    partnerKey: 'partner3@tiffo.com',
    title: 'Gujarati Thali',
    description:
      'Dal, 2 sabzis, kadhi, khichdi, 3 rotis, rice, papad, pickle, sweet (shrikhand). Unlimited on weekends.',
    price: { daily: 150, weekly: 950, monthly: 3600 },
    mealType: 'lunch',
    cuisine: 'Gujarati',
    dietary: ['vegetarian'],
    ingredients: ['Toor Dal', 'Seasonal Vegetables', 'Kadhi', 'Rice', 'Wheat Flour', 'Yogurt'],
    nutritionInfo: { calories: 700, protein: 20, carbs: 100, fat: 16 },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      maxOrders: 75,
    },
    rating: { average: 4.5, count: 30 },
    isActive: true,
  },
  {
    partnerKey: 'partner3@tiffo.com',
    title: 'Rajasthani Dal-Baati',
    description:
      'Classic dal-baati-churma with 5 batis, panchmel dal, churma ladoo and lehsun chutney.',
    price: { daily: 170, weekly: 1100, monthly: 4000 },
    mealType: 'dinner',
    cuisine: 'Rajasthani',
    dietary: ['vegetarian'],
    ingredients: ['Wheat Flour', 'Panchmel Dal', 'Ghee', 'Jaggery', 'Garlic'],
    nutritionInfo: { calories: 780, protein: 25, carbs: 95, fat: 28 },
    availability: { days: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'], maxOrders: 45 },
    rating: { average: 4.7, count: 22 },
    isActive: true,
  },
  {
    partnerKey: 'partner3@tiffo.com',
    title: 'Jain Lunch Box',
    description:
      'No root vegetables. Chana masala, mix sabzi (no onion/garlic), 4 rotis, steamed rice and fruit.',
    price: { daily: 135, weekly: 870, monthly: 3300 },
    mealType: 'lunch',
    cuisine: 'Gujarati',
    dietary: ['vegetarian', 'jain'],
    ingredients: ['Chickpeas', 'No-Onion-Garlic Spices', 'Wheat Flour', 'Rice', 'Seasonal Fruit'],
    nutritionInfo: { calories: 580, protein: 18, carbs: 88, fat: 10 },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxOrders: 35,
    },
    rating: { average: 4.2, count: 12 },
    isActive: true,
  },
];

// ─── Blog Posts ───────────────────────────────────────────────────────────────
const BLOGS = (adminId) => [
  {
    title: '5 Reasons Why Home-Cooked Tiffins Are Better Than Restaurant Food',
    excerpt:
      'From nutrition to cost savings, discover why subscribing to a home tiffin service is the smartest food decision you can make.',
    content: `## Why Tiffin > Restaurant Every Time\n\nIn a world of Swiggy notifications and Zomato deals, the humble tiffin is making a serious comeback — and for good reason.\n\n### 1. Freshness You Can Taste\nHome chefs cook in small batches, meaning your food reaches you within an hour of cooking. No reheating, no cold food sitting in a cloud kitchen.\n\n### 2. Balanced Nutrition\nA typical tiffin subscription includes dal, sabzi, roti, rice and salad — covering all your macros without you having to think about it.\n\n### 3. Saves 40% Compared to Restaurants\nA restaurant meal in Mumbai or Bangalore averages ₹250–400. A quality tiffin subscription brings that down to ₹100–160 per meal.\n\n### 4. Zero Decision Fatigue\nMenu is curated for you. No scrolling through 300 items at 1pm trying to decide what to eat.\n\n### 5. Supports Local Cooks\nEvery tiffin subscription directly empowers a home chef in your city — not a faceless corporation.\n\nReady to make the switch? Browse tiffin options near you on Tiffo.`,
    author: adminId,
    category: 'Food Tips',
    tags: ['tiffin', 'healthy eating', 'meal planning', 'home food'],
    status: 'published',
    isFeatured: true,
    views: 842,
    likes: 134,
    seo: {
      metaTitle: '5 Reasons Home Tiffins Beat Restaurant Food | Tiffo',
      metaDescription:
        'Discover why subscribing to a home tiffin service beats restaurant food on nutrition, cost, and freshness.',
      keywords: ['tiffin service', 'home food', 'healthy lunch'],
    },
  },
  {
    title: 'The Science Behind a Balanced Indian Thali',
    excerpt:
      'A traditional Indian thali is not just delicious — it is a nutritionally complete meal designed by centuries of culinary wisdom.',
    content: `## The Perfect Plate: Indian Thali Decoded\n\nThe Indian thali is one of the world's most nutritionally balanced meals. Here's the science behind each component.\n\n### Dal — Protein Powerhouse\nToor, moong, masoor — whatever the dal, it delivers 6–9g of plant protein per serving along with folate and iron.\n\n### Sabzi — Micronutrient Marvel\nSeasonal vegetables provide vitamins A, C, K and fibre. The variety of sabzis across Indian cuisine ensures you never miss a nutrient.\n\n### Roti — Slow Energy Release\nWhole wheat roti has a lower glycaemic index than white rice, providing sustained energy without the blood sugar spike.\n\n### Rice — Quick Fuel\nRice complements dal perfectly — together they form a complete protein containing all essential amino acids.\n\n### Pickle & Papad — Probiotic & Digestive\nTraditional achaar is fermented, providing gut-healthy probiotics. Papad aids digestion.\n\n### Conclusion\nNo fad diet comes close to the balanced perfection of a well-made thali. Tiffo partners are trained to maintain this balance in every meal.`,
    author: adminId,
    category: 'Health & Nutrition',
    tags: ['nutrition', 'thali', 'indian food', 'health'],
    status: 'published',
    isFeatured: false,
    views: 523,
    likes: 89,
    seo: {
      metaTitle: 'The Science of a Balanced Indian Thali | Tiffo Blog',
      metaDescription:
        'Learn the nutritional science behind the traditional Indian thali — protein, carbs, fibre and probiotics in one plate.',
      keywords: ['indian thali', 'balanced diet', 'nutrition'],
    },
  },
  {
    title: "From Home Kitchen to ₹50,000/month: Meena's Tiffin Story",
    excerpt:
      'How a Bangalore home cook turned her passion for South Indian food into a thriving tiffin business serving 80+ customers daily.',
    content: `## A Kitchen, A Dream, and Tiffo\n\nMeena Shetty never planned to run a business. But when her neighbours started requesting her rasam and sambar regularly, she realised she had something special.\n\n> "My mother taught me that food is love. When I cook, I cook like I'm feeding family."\n\n### The Beginning\nMeena started with just 10 customers in HSR Layout, Bangalore in 2022. Each morning she'd wake at 5am, cook, pack, and deliver herself.\n\n### Joining Tiffo\nWhen she registered on Tiffo, everything changed. Within 3 months she had 45 regular subscribers. Within 6 months she'd hired two assistants and crossed ₹35,000/month revenue.\n\n### Today\nMeena now serves 80+ customers daily, runs a 5-star rated business on Tiffo, and her daughter has joined the kitchen. She earns ₹52,000/month on average.\n\n### Her Advice for Aspiring Partners\n- Start small. 10 consistent customers beat 100 one-time orders.\n- Consistency in taste is everything. People subscribe because they trust you.\n- Use Tiffo's dashboard to track orders and payments — it saved her hours every week.\n\nWant to start your own tiffin business? [Register as a Tiffo Partner today.](/partner/register)`,
    author: adminId,
    category: 'Partner Stories',
    tags: ['partner story', 'entrepreneur', 'bangalore', 'success'],
    status: 'published',
    isFeatured: true,
    views: 1204,
    likes: 241,
    seo: {
      metaTitle: "Meena's Tiffin Success Story | Tiffo Partner",
      metaDescription:
        'How Meena Shetty grew from 10 to 80+ tiffin customers with Tiffo, earning ₹50,000/month from her home kitchen.',
      keywords: ['tiffin business', 'home chef', 'bangalore', 'tiffo partner'],
    },
  },
  {
    title: 'Tiffo Platform Update: Real-Time Order Tracking Is Here',
    excerpt:
      'We are excited to announce live order tracking, in-app notifications, and a redesigned partner dashboard — all rolling out this week.',
    content: `## What's New at Tiffo\n\nWe've been heads-down building features based on your feedback. Here's everything launching this week.\n\n### 🚀 Real-Time Order Tracking\nCustomers can now track their tiffin delivery in real time. You'll see when the partner has packed your order, when it has been dispatched, and get a notification when it arrives.\n\n### 🔔 In-App Notifications\nNo more refreshing the page. Subscription renewals, delivery updates, and payment confirmations all appear instantly in the app — powered by WebSockets.\n\n### 📊 Partner Analytics Dashboard\nPartners now have access to daily/weekly/monthly revenue charts, customer retention metrics, and tiffin popularity rankings — all in one place.\n\n### 🎯 Geospatial Tiffin Discovery\nThe "Nearby Tiffins" search now uses precise GPS-based matching, showing you partners within your exact delivery radius rather than just the same city.\n\n### Coming Next\n- Pause & resume subscription anytime\n- In-app messaging between customer and partner\n- Multi-tiffin subscriptions (breakfast + lunch from different partners)\n\nThank you for being part of the Tiffo community. 🙏`,
    author: adminId,
    category: 'Platform Updates',
    tags: ['product update', 'features', 'real-time', 'tracking'],
    status: 'published',
    isFeatured: false,
    views: 318,
    likes: 57,
    seo: {
      metaTitle: 'Real-Time Tracking & Analytics Now Live | Tiffo',
      metaDescription:
        'Tiffo launches real-time order tracking, in-app notifications, and a new partner analytics dashboard.',
      keywords: ['tiffo update', 'order tracking', 'platform features'],
    },
  },
];

// ─── Main Seed ────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    // Validate required environment variables
    const required = [
      'SEED_ADMIN_PASSWORD',
      'SEED_USER_PASSWORD',
      'SEED_PARTNER_PASSWORD',
      'MONGODB_URI',
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing.join(', '));
      console.log('   Set them in your .env file before running this script.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (FRESH) {
      console.log('🗑️  --fresh flag detected. Dropping existing data…');
      await Promise.all([
        User.deleteMany({}),
        Partner.deleteMany({}),
        Tiffin.deleteMany({}),
        Subscription.deleteMany({}),
        Review.deleteMany({}),
        Blog.deleteMany({}),
      ]);
      console.log('   Cleared: Users, Partners, Tiffins, Subscriptions, Reviews, Blogs\n');
    }

    // ── 1. Users ──────────────────────────────────────────────────────────────
    console.log('👤 Seeding Users…');
    const userMap = {};
    for (const u of USERS) {
      let user = await User.findOne({ email: u.email });
      if (user) {
        console.log(`   ⚠️  Exists: ${u.email}`);
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          await user.save();
        }
      } else {
        const { password, ...rest } = u;
        user = await User.create({ ...rest, password, isEmailVerified: true });
        console.log(`   ✅ Created (${u.role}): ${u.email}`);
      }
      userMap[u.email] = user;
    }

    // ── 2. Partners ───────────────────────────────────────────────────────────
    console.log('\n🏪 Seeding Partner businesses…');
    const partnerMap = {};
    for (const pb of PARTNER_BUSINESSES) {
      const userDoc = userMap[pb.emailKey];
      let partner = await Partner.findOne({ user: userDoc._id });
      if (partner) {
        console.log(`   ⚠️  Exists: ${pb.businessName}`);
      } else {
        const { emailKey, ...rest } = pb;
        partner = await Partner.create({ ...rest, user: userDoc._id });
        console.log(`   ✅ Created: ${pb.businessName}`);
      }
      partnerMap[pb.emailKey] = partner;
    }

    // ── 3. Tiffins ────────────────────────────────────────────────────────────
    console.log('\n🍱 Seeding Tiffins…');
    const tiffinMap = {}; // key: title → tiffin doc
    for (const t of TIFFINS(partnerMap)) {
      const partner = partnerMap[t.partnerKey];
      let tiffin = await Tiffin.findOne({ title: t.title, partner: partner._id });
      if (tiffin) {
        console.log(`   ⚠️  Exists: ${t.title}`);
      } else {
        const { partnerKey, ...rest } = t;
        tiffin = await Tiffin.create({ ...rest, partner: partner._id });
        console.log(`   ✅ Created: ${t.title}`);
      }
      tiffinMap[t.title] = tiffin;
    }

    // ── 4. Subscriptions ──────────────────────────────────────────────────────
    console.log('\n📋 Seeding Subscriptions…');
    const SUB_DATA = [
      {
        userEmail: 'priya@example.com',
        partnerEmail: 'partner2@tiffo.com',
        tiffinTitle: 'South Indian Lunch Combo',
        plan: 'monthly',
        deliveryTime: '13:00',
        amount: 2900,
        city: 'Bangalore',
        street: '56 HSR Layout',
        pincode: '560102',
      },
      {
        userEmail: 'rohan@example.com',
        partnerEmail: 'partner1@tiffo.com',
        tiffinTitle: 'Punjabi Lunch Thali',
        plan: 'weekly',
        deliveryTime: '13:00',
        amount: 840,
        city: 'Mumbai',
        street: '34 Linking Rd',
        pincode: '400050',
      },
      {
        userEmail: 'aisha@example.com',
        partnerEmail: 'partner2@tiffo.com',
        tiffinTitle: 'Idli & Dosa Breakfast',
        plan: 'monthly',
        deliveryTime: '08:30',
        amount: 1900,
        city: 'Pune',
        street: '56 Baner Rd',
        pincode: '411045',
      },
      {
        userEmail: 'vikram@example.com',
        partnerEmail: 'partner3@tiffo.com',
        tiffinTitle: 'Gujarati Thali',
        plan: 'monthly',
        deliveryTime: '13:30',
        amount: 3600,
        city: 'Bangalore',
        street: '78 HSR Layout',
        pincode: '560102',
      },
      {
        userEmail: 'neha@example.com',
        partnerEmail: 'partner2@tiffo.com',
        tiffinTitle: 'Vegan Dinner Bowl',
        plan: 'weekly',
        deliveryTime: '20:00',
        amount: 900,
        city: 'Bangalore',
        street: '90 Koramangala',
        pincode: '560034',
      },
    ];

    const createdSubs = [];
    for (const s of SUB_DATA) {
      const user = userMap[s.userEmail];
      const partner = partnerMap[s.partnerEmail];
      const tiffin = tiffinMap[s.tiffinTitle];

      const existing = await Subscription.findOne({
        user: user._id,
        tiffin: tiffin._id,
        status: 'active',
      });
      if (existing) {
        console.log(`   ⚠️  Exists: ${s.userEmail} → ${s.tiffinTitle}`);
        createdSubs.push(existing);
        continue;
      }

      const commission = Math.round(s.amount * 0.1);
      const sub = await Subscription.create({
        user: user._id,
        partner: partner._id,
        tiffin: tiffin._id,
        plan: s.plan,
        startDate: new Date(),
        endDate: days(s.plan === 'monthly' ? 30 : 7),
        deliveryAddress: { street: s.street, city: s.city, state: 'India', pincode: s.pincode },
        deliveryTime: s.deliveryTime,
        status: 'active',
        totalAmount: s.amount,
        paidAmount: s.amount,
        paymentStatus: 'paid',
        platformCommission: commission,
        providerAmount: s.amount - commission,
        paidAt: new Date(),
      });
      console.log(`   ✅ Subscribed: ${s.userEmail} → ${s.tiffinTitle} (${s.plan})`);
      createdSubs.push(sub);
    }

    // ── 5. Reviews ────────────────────────────────────────────────────────────
    console.log('\n⭐ Seeding Reviews…');
    const REVIEW_DATA = [
      {
        userEmail: 'priya@example.com',
        subIdx: 0,
        tiffinTitle: 'South Indian Lunch Combo',
        rating: 5,
        comment:
          'Best sambar I have had outside home! The consistency is amazing — same great taste every single day.',
        categories: { taste: 5, quality: 5, delivery: 5, packaging: 4 },
      },
      {
        userEmail: 'priya@example.com',
        subIdx: 0,
        tiffinTitle: 'Idli & Dosa Breakfast',
        rating: 5,
        comment:
          'Soft idlis and crispy dosa every morning — exactly what I needed. Never misses delivery.',
        categories: { taste: 5, quality: 5, delivery: 5, packaging: 5 },
      },
      {
        userEmail: 'rohan@example.com',
        subIdx: 1,
        tiffinTitle: 'Punjabi Lunch Thali',
        rating: 4,
        comment:
          'Solid North Indian food. Dal makhani is restaurant quality. Wish the paneer portions were bigger.',
        categories: { taste: 4, quality: 4, delivery: 5, packaging: 4 },
      },
      {
        userEmail: 'aisha@example.com',
        subIdx: 2,
        tiffinTitle: 'Idli & Dosa Breakfast',
        rating: 5,
        comment:
          'Completely changed my mornings. Fresh, hot, and always on time. The tomato chutney is 🔥',
        categories: { taste: 5, quality: 5, delivery: 4, packaging: 4 },
      },
      {
        userEmail: 'vikram@example.com',
        subIdx: 3,
        tiffinTitle: 'Gujarati Thali',
        rating: 4,
        comment:
          'Authentic Gujarati flavours, very reminiscent of my hometown. The kathodi and shrikhand are highlights.',
        categories: { taste: 5, quality: 4, delivery: 4, packaging: 3 },
      },
      {
        userEmail: 'neha@example.com',
        subIdx: 4,
        tiffinTitle: 'Vegan Dinner Bowl',
        rating: 5,
        comment:
          'Finally a tiffin service that takes vegan food seriously. The millet khichdi is filling and delicious.',
        categories: { taste: 5, quality: 5, delivery: 5, packaging: 5 },
      },
      {
        userEmail: 'rohan@example.com',
        subIdx: 1,
        tiffinTitle: 'Chicken Dinner Special',
        rating: 5,
        comment:
          'Ordered the chicken dinner add-on and it was incredible. Will subscribe to this separately.',
        categories: { taste: 5, quality: 5, delivery: 5, packaging: 4 },
      },
      {
        userEmail: 'priya@example.com',
        subIdx: 0,
        tiffinTitle: 'Vegan Dinner Bowl',
        rating: 4,
        comment:
          'Love the plant-based options. Portions could be slightly larger but the quality is excellent.',
        categories: { taste: 4, quality: 5, delivery: 5, packaging: 4 },
      },
    ];

    for (const r of REVIEW_DATA) {
      const user = userMap[r.userEmail];
      const tiffin = tiffinMap[r.tiffinTitle];
      const sub = createdSubs[r.subIdx];
      const partner = await Partner.findById(tiffin.partner);

      const existing = await Review.findOne({ user: user._id, tiffin: tiffin._id });
      if (existing) {
        console.log(`   ⚠️  Exists: ${r.userEmail} → ${r.tiffinTitle}`);
        continue;
      }

      await Review.create({
        user: user._id,
        partner: partner._id,
        tiffin: tiffin._id,
        subscription: sub._id,
        rating: r.rating,
        comment: r.comment,
        categories: r.categories,
        isVerified: true,
        helpfulVotes: Math.floor(Math.random() * 20),
      });
      console.log(`   ✅ Review: ${r.userEmail} → ${r.tiffinTitle} (${r.rating}★)`);
    }

    // ── 6. Blogs ──────────────────────────────────────────────────────────────
    console.log('\n📝 Seeding Blog posts…');
    const adminUser = userMap['admin@tiffo.com'];
    for (const b of BLOGS(adminUser._id)) {
      const existing = await Blog.findOne({ title: b.title });
      if (existing) {
        console.log(`   ⚠️  Exists: "${b.title}"`);
        continue;
      }
      await Blog.create(b);
      console.log(`   ✅ Blog: "${b.title}"`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    console.log('🎉  SEED COMPLETE');
    console.log('═'.repeat(55));
    console.log(`\n📦 DATABASE SUMMARY:`);
    console.log(`   Users:         ${await User.countDocuments()}`);
    console.log(`   Partners:      ${await Partner.countDocuments()}`);
    console.log(`   Tiffins:       ${await Tiffin.countDocuments()}`);
    console.log(`   Subscriptions: ${await Subscription.countDocuments()}`);
    console.log(`   Reviews:       ${await Review.countDocuments()}`);
    console.log(`   Blogs:         ${await Blog.countDocuments()}`);

    console.log(`\n🔑 LOGIN CREDENTIALS:`);
    console.log(`   Admin:    admin@tiffo.com`);
    console.log(`   Customer: priya@example.com`);
    console.log(`   Customer: rohan@example.com`);
    console.log(`   Partner:  partner1@tiffo.com  (Desi Kitchen)`);
    console.log(`   Partner:  partner2@tiffo.com  (Meena's Tiffin Corner)`);
    console.log(`   Partner:  partner3@tiffo.com  (Rajesh Bhojanalaya)`);
    console.log(`\n   Use the passwords set in your .env file to login.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();

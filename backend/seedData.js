const mongoose = require('mongoose');
const User = require('./src/models/User');
const Partner = require('./src/models/Partner');
const Tiffin = require('./src/models/Tiffin');
require('dotenv').config();

const sampleData = {
    // Sample users and partners with real coordinates from different cities
    partners: [
        {
            user: {
                name: 'Rajesh Kumar',
                email: 'rajesh@delhitiffin.com',
                password: 'password123',
                phone: '+91-9876543210',
                role: 'partner'
            },
            partner: {
                businessName: 'Delhi Home Kitchen',
                description: 'Authentic North Indian home-cooked meals',
                address: {
                    street: '123 Connaught Place',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                    coordinates: {
                        lat: 28.6139,
                        lng: 77.2090
                    }
                },
                contact: {
                    phone: '+91-9876543210',
                    whatsapp: '+91-9876543210',
                    email: 'rajesh@delhitiffin.com'
                },
                businessHours: {
                    open: '08:00',
                    close: '20:00',
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                },
                deliveryRadius: 10,
                verified: true
            },
            tiffins: [
                {
                    title: 'North Indian Thali',
                    description: 'Complete meal with roti, dal, sabzi, rice, and pickle',
                    price: { daily: 120, weekly: 800, monthly: 3000 },
                    mealType: 'lunch',
                    cuisine: 'North Indian',
                    dietary: ['vegetarian'],
                    ingredients: ['wheat flour', 'lentils', 'vegetables', 'rice', 'spices'],
                    isActive: true
                },
                {
                    title: 'Punjabi Breakfast Box',
                    description: 'Paratha with curd, pickle, and chai',
                    price: { daily: 80, weekly: 500, monthly: 1800 },
                    mealType: 'breakfast',
                    cuisine: 'Punjabi',
                    dietary: ['vegetarian'],
                    ingredients: ['wheat flour', 'potato', 'curd', 'tea'],
                    isActive: true
                }
            ]
        },
        {
            user: {
                name: 'Priya Sharma',
                email: 'priya@southdelhi.com',
                password: 'password123',
                phone: '+91-9876543211',
                role: 'partner'
            },
            partner: {
                businessName: 'South Delhi Tiffin Service',
                description: 'Healthy and hygienic home food',
                address: {
                    street: '45 Hauz Khas Village',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110016',
                    coordinates: {
                        lat: 28.5494,
                        lng: 77.2001
                    }
                },
                contact: {
                    phone: '+91-9876543211',
                    whatsapp: '+91-9876543211',
                    email: 'priya@southdelhi.com'
                },
                businessHours: {
                    open: '07:00',
                    close: '21:00',
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                },
                deliveryRadius: 8,
                verified: true
            },
            tiffins: [
                {
                    title: 'Gujarati Thali',
                    description: 'Traditional Gujarati meal with dhokla, kadhi, and roti',
                    price: { daily: 100, weekly: 650, monthly: 2500 },
                    mealType: 'lunch',
                    cuisine: 'Gujarati',
                    dietary: ['vegetarian', 'jain'],
                    ingredients: ['gram flour', 'curd', 'vegetables', 'wheat'],
                    isActive: true
                }
            ]
        },
        {
            user: {
                name: 'Amit Patel',
                email: 'amit@mumbaitiffin.com',
                password: 'password123',
                phone: '+91-9876543212',
                role: 'partner'
            },
            partner: {
                businessName: 'Mumbai Dabba Service',
                description: 'Fresh Mumbai-style tiffin delivered daily',
                address: {
                    street: '78 Andheri West',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400058',
                    coordinates: {
                        lat: 19.1136,
                        lng: 72.8697
                    }
                },
                contact: {
                    phone: '+91-9876543212',
                    whatsapp: '+91-9876543212',
                    email: 'amit@mumbaitiffin.com'
                },
                businessHours: {
                    open: '06:00',
                    close: '22:00',
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                },
                deliveryRadius: 12,
                verified: true
            },
            tiffins: [
                {
                    title: 'Mumbai Special Lunch',
                    description: 'Authentic Mumbai-style meal with bhaji, roti, and rice',
                    price: { daily: 110, weekly: 700, monthly: 2700 },
                    mealType: 'lunch',
                    cuisine: 'North Indian',
                    dietary: ['vegetarian'],
                    ingredients: ['vegetables', 'wheat', 'rice', 'spices'],
                    isActive: true
                }
            ]
        },
        {
            user: {
                name: 'Lakshmi Rao',
                email: 'lakshmi@bangaloretiffin.com',
                password: 'password123',
                phone: '+91-9876543213',
                role: 'partner'
            },
            partner: {
                businessName: 'Bangalore South Indian Kitchen',
                description: 'Authentic South Indian home food',
                address: {
                    street: '12 Koramangala',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    pincode: '560034',
                    coordinates: {
                        lat: 12.9352,
                        lng: 77.6245
                    }
                },
                contact: {
                    phone: '+91-9876543213',
                    whatsapp: '+91-9876543213',
                    email: 'lakshmi@bangaloretiffin.com'
                },
                businessHours: {
                    open: '06:30',
                    close: '21:00',
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                },
                deliveryRadius: 15,
                verified: true
            },
            tiffins: [
                {
                    title: 'South Indian Breakfast',
                    description: 'Idli, vada, sambar, and chutney',
                    price: { daily: 70, weekly: 450, monthly: 1700 },
                    mealType: 'breakfast',
                    cuisine: 'South Indian',
                    dietary: ['vegetarian', 'vegan'],
                    ingredients: ['rice', 'lentils', 'coconut', 'spices'],
                    isActive: true
                },
                {
                    title: 'Karnataka Meals',
                    description: 'Traditional Karnataka-style rice meals',
                    price: { daily: 90, weekly: 600, monthly: 2300 },
                    mealType: 'lunch',
                    cuisine: 'South Indian',
                    dietary: ['vegetarian'],
                    ingredients: ['rice', 'sambar', 'rasam', 'vegetables'],
                    isActive: true
                }
            ]
        },
        {
            user: {
                name: 'Vikram Singh',
                email: 'vikram@dwarkatiffin.com',
                password: 'password123',
                phone: '+91-9876543214',
                role: 'partner'
            },
            partner: {
                businessName: 'Dwarka Homemade Tiffin',
                description: 'Hygienic homemade food with love',
                address: {
                    street: '56 Dwarka Sector 10',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110075',
                    coordinates: {
                        lat: 28.5921,
                        lng: 77.0460
                    }
                },
                contact: {
                    phone: '+91-9876543214',
                    whatsapp: '+91-9876543214',
                    email: 'vikram@dwarkatiffin.com'
                },
                businessHours: {
                    open: '07:00',
                    close: '20:00',
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                },
                deliveryRadius: 7,
                verified: true
            },
            tiffins: [
                {
                    title: 'Dinner Special',
                    description: 'Light dinner with dal, roti, and sabzi',
                    price: { daily: 95, weekly: 630, monthly: 2400 },
                    mealType: 'dinner',
                    cuisine: 'North Indian',
                    dietary: ['vegetarian'],
                    ingredients: ['lentils', 'wheat', 'vegetables', 'spices'],
                    isActive: true
                }
            ]
        }
    ]
};

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tiffo', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({ email: { $in: sampleData.partners.map(p => p.user.email) } });
        await Partner.deleteMany({});
        await Tiffin.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create users, partners, and tiffins
        console.log('👥 Creating sample data...');

        for (const partnerData of sampleData.partners) {
            // Create user
            const user = await User.create(partnerData.user);
            console.log(`✅ Created user: ${user.name}`);

            // Create partner
            const partner = await Partner.create({
                ...partnerData.partner,
                user: user._id
            });
            console.log(`✅ Created partner: ${partner.businessName} at (${partner.address.coordinates.lat}, ${partner.address.coordinates.lng})`);

            // Create tiffins
            for (const tiffinData of partnerData.tiffins) {
                const tiffin = await Tiffin.create({
                    ...tiffinData,
                    partner: partner._id
                });
                console.log(`  ✅ Created tiffin: ${tiffin.title} - ₹${tiffin.price.daily}/day`);
            }
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📍 Sample Partner Locations:');
        console.log('  • Delhi Home Kitchen - Connaught Place (28.6139, 77.2090)');
        console.log('  • South Delhi Tiffin - Hauz Khas (28.5494, 77.2001)');
        console.log('  • Mumbai Dabba Service - Andheri (19.1136, 72.8697)');
        console.log('  • Bangalore South Kitchen - Koramangala (12.9352, 77.6245)');
        console.log('  • Dwarka Homemade Tiffin - Dwarka (28.5921, 77.0460)');
        console.log('\n💡 Test the nearby feature by setting your location to Delhi (28.6139, 77.2090)');
        console.log('   You should see 3 tiffin providers within 10km radius!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
};

// Run the seed function
seedDatabase();

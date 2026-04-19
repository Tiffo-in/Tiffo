require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = require('./src/models/User');

        // Find admin user
        const admin = await User.findOne({ email: 'admin@tiffo.com' }).select('+password');

        if (!admin) {
            console.log('Admin not found!');
            process.exit(1);
        }

        console.log('Admin found:', admin.email, 'Role:', admin.role);
        console.log('Has password:', !!admin.password);

        // Test password comparison
        const testPassword = 'admin123';
        const match = await bcrypt.compare(testPassword, admin.password);
        console.log('Password match for admin123:', match);

        // If password doesn't match, reset it
        if (!match) {
            console.log('Resetting admin password...');
            const newHash = await bcrypt.hash('admin123', 12);
            await User.updateOne({ email: 'admin@tiffo.com' }, { password: newHash });
            console.log('Password reset successfully!');
        }

        await mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();

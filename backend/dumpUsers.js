const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(`MONGODB_URI is undefined. __dirname is ${__dirname}`);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({});
    console.log('Users:');
    users.forEach((u) => {
      console.log({
        id: u._id,
        name: u.get('name'),
        email: u.get('email'),
        role: u.get('role'),
        isActive: u.get('isActive'),
        isEmailVerified: u.get('isEmailVerified'),
      });
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

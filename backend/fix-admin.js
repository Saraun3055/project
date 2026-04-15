import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

await mongoose.connect('mongodb://localhost:27017/nexus_marketplace');

const user = await mongoose.connection.collection('users').findOne({ email: 'sarauntp2@gmail.com' });

if (user) {
  console.log('User found:', user.email, user.username);
  console.log('Password hash:', user.password);
  
  const isMatch = await bcrypt.compare('Saraun@3055', user.password);
  console.log('Password match:', isMatch);
  
  if (!isMatch) {
    const newHash = await bcrypt.hash('Saraun@3055', 10);
    await mongoose.connection.collection('users').updateOne(
      { email: 'sarauntp2@gmail.com' },
      { $set: { password: newHash } }
    );
    console.log('Password updated');
  }
} else {
  console.log('User not found');
}

await mongoose.disconnect();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('Request:', req.method, req.url);
  console.log('Body:', req.body);
  next();
});

app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email, password);
    
    await mongoose.connect('mongodb://localhost:27017/nexus_marketplace');
    
    const user = await mongoose.connection.collection('users').findOne({ email });
    console.log('DB user:', user ? user.email : 'not found');
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      res.json({ success: isMatch, user: user.email });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5001, () => console.log('Test server on 5001'));
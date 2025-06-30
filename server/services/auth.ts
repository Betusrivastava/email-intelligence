import { User, userSchema } from '../models/User';
import { mongoService } from './mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authService = {
  async register(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    const { email, password, name } = userSchema.parse(userData);
    
    // Check if user already exists
    const existingUser = await mongoService.getDb().collection('users').findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await mongoService.getDb().collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate JWT
    const token = jwt.sign({ userId: result.insertedId.toString() }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { token, userId: result.insertedId };
  },

  async login(email: string, password: string) {
    const user = await mongoService.getDb().collection('users').findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { token, userId: user._id };
  },

  async getUser(userId: string) {
    try {
      console.log('Fetching user with ID:', userId);
      const db = mongoService.getDb();
      
      if (!ObjectId.isValid(userId)) {
        console.error('Invalid user ID format:', userId);
        return null;
      }
      
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { 
          projection: { 
            password: 0,  // Exclude password
            __v: 0       // Exclude version key if using Mongoose
          } 
        }
      );
      
      if (user) {
        // Convert ObjectId to string for the frontend
        return {
          ...user,
          _id: user._id.toString(),
          createdAt: user.createdAt?.toISOString(),
          updatedAt: user.updatedAt?.toISOString()
        };
      }
      
      console.log('User not found');
      return null;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  },
};

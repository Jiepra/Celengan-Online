import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import firebaseAuth from '../middleware/firebaseAuth';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const jwtSecret = process.env.JWT_SECRET;

// Pastikan JWT_SECRET ada
if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET tidak ditemukan di file .env');
  process.exit(1);
}

// @route   POST /api/firebase-auth/login
// @desc    Login atau register dengan Firebase dan dapatkan token JWT
// @access  Public
router.post('/login', firebaseAuth, async (req: Request, res: Response) => {
  try {
    // firebaseUser sudah diverifikasi oleh middleware firebaseAuth
    const { uid, email, name, picture } = req.firebaseUser!;
    
    // Cari user berdasarkan firebaseUid
    let user = await User.findOne({ firebaseUid: uid });
    
    // Jika user belum ada, cari berdasarkan email
    if (!user) {
      user = await User.findOne({ email });
      
      // Jika user dengan email yang sama ditemukan, update firebaseUid-nya
      if (user) {
        user.firebaseUid = uid;
        user.displayName = name || user.displayName;
        user.photoURL = picture || user.photoURL;
        await user.save();
      } else {
        // Jika user benar-benar baru, buat user baru
        // Generate username unik dari email
        const baseUsername = email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        
        // Pastikan username unik
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
        
        user = new User({
          username,
          email,
          firebaseUid: uid,
          displayName: name,
          photoURL: picture
        });
        
        await user.save();
      }
    }
    
    // Buat token JWT
    const payload = {
      user: {
        id: user._id
      }
    };
    
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '7d' }, // Token berlaku 7 hari
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user!._id,
            username: user!.username,
            email: user!.email,
            displayName: user!.displayName,
            photoURL: user!.photoURL
          }
        });
      }
    );
  } catch (error: any) {
    console.error('Error in Firebase login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/firebase-auth/me
// @desc    Dapatkan data user yang sedang login
// @access  Private
router.get('/me', firebaseAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Cari user berdasarkan firebaseUid
    const user = await User.findOne({ firebaseUid: req.firebaseUser!.uid }).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }
    
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
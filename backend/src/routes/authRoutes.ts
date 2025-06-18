import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';
import firebaseAuth from '../middleware/firebaseAuth';

// Definisikan interface untuk body request Register
interface RegisterRequestBody {
  username?: string;
  email?: string;
  password?: string;
}

// Definisikan interface untuk body request Login
interface LoginRequestBody {
  email?: string;
  password?: string;
}

dotenv.config(); // Pastikan variabel lingkungan dimuat

const router = Router();
const jwtSecret = process.env.JWT_SECRET;

// Pastikan JWT_SECRET ada
if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET tidak ditemukan di file .env');
  process.exit(1);
}

// @route   POST /api/auth/register
// @desc    Mendaftarkan pengguna baru
// @access  Public
const registerHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body as RegisterRequestBody;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Mohon lengkapi semua field.' });
    return;
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: 'Email sudah terdaftar.' });
      return;
    }

    user = await User.findOne({ username });
    if (user) {
      res.status(400).json({ message: 'Nama pengguna sudah digunakan.' });
      return;
    }

    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, message: 'Pendaftaran berhasil!' });
      }
    );
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

const loginHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginRequestBody;

  if (!email || !password) {
    res.status(400).json({ message: 'Mohon lengkapi email dan kata sandi.' });
    return;
  }

  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Kredensial tidak valid.' });
      return;
    }

    const isMatch = await user.comparePassword(password as string);
    if (!isMatch) {
      res.status(400).json({ message: 'Kredensial tidak valid.' });
      return;
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: 'Login berhasil!' });
      }
    );
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

router.post('/register', registerHandler);
router.post('/login', loginHandler);

// @route   POST /api/auth/firebase-login
// @desc    Login atau daftar pengguna menggunakan Firebase UID
// @access  Public (dengan verifikasi token Firebase)
router.post('/firebase-login', firebaseAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser) {
      res.status(401).json({ message: 'Token Firebase tidak valid atau tidak ada.' });
      return;
    }

    let user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      // Jika pengguna belum terdaftar, buat pengguna baru
      user = new User({
        username: firebaseUser.email?.split('@')[0] || 'user' + Date.now(), // Gunakan bagian email sebelum @ sebagai username default
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        // Password tidak diperlukan karena otentikasi melalui Firebase
      });
      await user.save();
    } else {
      // Jika pengguna sudah ada, perbarui informasi jika diperlukan (misal: email)
      user.email = firebaseUser.email;
      await user.save();
    }

    // Buat payload untuk JWT kita sendiri
    const payload = {
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
      },
    };

    // Buat JWT kita sendiri
    jwt.sign(
      payload,
      jwtSecret as string,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: 'Login Firebase berhasil!', user: user });
      }
    );

  } catch (error: any) {
    console.error('Error in Firebase login:', error.message);
    res.status(500).send('Kesalahan Server Internal saat login Firebase.');
  }
});

export default router;
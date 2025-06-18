import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

// Pastikan JWT_SECRET ada
if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET tidak ditemukan di file .env');
  process.exit(1);
}

// Perluasan (Augmentasi) tipe Request untuk menambahkan properti user
// Ini memungkinkan TypeScript tahu bahwa req.user akan ada setelah middleware ini berjalan
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const auth = (req: Request, res: Response, next: NextFunction): void => {
  // Dapatkan token dari header
  const token = req.header('x-auth-token'); // Umumnya token dikirim di header ini

  // Periksa jika tidak ada token
  if (!token) {
    res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
    return;
  }

  try {
    // Verifikasi token
    const decoded: any = jwt.verify(token, jwtSecret);

    // Tambahkan user dari payload token ke objek request
    // Sehingga rute yang terlindungi bisa mengakses req.user.id
    req.user = decoded.user;
    next(); // Lanjutkan ke middleware/rute berikutnya
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};

export default auth;
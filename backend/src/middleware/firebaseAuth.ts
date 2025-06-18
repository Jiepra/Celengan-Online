import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

// Perluasan tipe Request untuk menambahkan properti firebaseUser
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

/**
 * Middleware untuk memverifikasi token Firebase
 * Token harus disediakan di header Authorization: Bearer <token>
 */
const firebaseAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Dapatkan token dari header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Tidak ada token Firebase, otorisasi ditolak.' });
    return;
  }

  // Ekstrak token dari header (format: 'Bearer <token>')
  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verifikasi token Firebase
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Tambahkan informasi pengguna Firebase ke objek request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name,
      picture: decodedToken.picture
    };
    
    next(); // Lanjutkan ke middleware/rute berikutnya
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ message: 'Token Firebase tidak valid.' });
  }
};

export default firebaseAuth;
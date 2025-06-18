import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import firebaseAuthRoutes from './routes/firebaseAuthRoutes';
import piggyBankRoutes from './routes/piggyBankRoutes';
import transactionRoutes from './routes/transactionRoutes'; 

// Muat variabel lingkungan dari file .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // Gunakan port dari .env atau default 5000
const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// Pastikan MONGO_URI ada
if (!mongoURI) {
  console.error('ERROR: MONGO_URI tidak ditemukan di file .env');
  process.exit(1); // Keluar dari aplikasi jika URI tidak ada
}
if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET tidak ditemukan di file .env');
  process.exit(1);
}

// Middleware
app.use(express.json()); // Untuk mengurai body permintaan JSON
app.use(cors()); // Mengaktifkan CORS untuk semua permintaan

// Fungsi untuk menghubungkan ke MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Terhubung ke MongoDB Atlas!');
  } catch (error) {
    console.error('Koneksi MongoDB Gagal:', error);
    process.exit(1); // Keluar jika koneksi gagal
  }
};

// Panggil fungsi koneksi database saat aplikasi dimulai
connectDB();

// Rute dasar
app.get('/', (req, res) => {
  res.send('Selamat datang di API Celengan Online!');
});

app.use('/api/auth', authRoutes); // Semua rute dari authRoutes akan diawali dengan /api/auth
app.use('/api/firebase-auth', firebaseAuthRoutes); // Rute untuk autentikasi Firebase
app.use('/api/piggybanks', piggyBankRoutes);
app.use('/api/transactions', transactionRoutes);

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
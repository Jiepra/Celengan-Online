"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const firebaseAuthRoutes_1 = __importDefault(require("./routes/firebaseAuthRoutes"));
const piggyBankRoutes_1 = __importDefault(require("./routes/piggyBankRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
// Muat variabel lingkungan dari file .env
dotenv_1.default.config();
const app = (0, express_1.default)();
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
app.use(express_1.default.json()); // Untuk mengurai body permintaan JSON
app.use((0, cors_1.default)()); // Mengaktifkan CORS untuk semua permintaan
// Fungsi untuk menghubungkan ke MongoDB
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(mongoURI);
        console.log('Terhubung ke MongoDB Atlas!');
    }
    catch (error) {
        console.error('Koneksi MongoDB Gagal:', error);
        process.exit(1); // Keluar jika koneksi gagal
    }
});
// Panggil fungsi koneksi database saat aplikasi dimulai
connectDB();
// Rute dasar
app.get('/', (req, res) => {
    res.send('Selamat datang di API Celengan Online!');
});
app.use('/api/auth', authRoutes_1.default); // Semua rute dari authRoutes akan diawali dengan /api/auth
app.use('/api/firebase-auth', firebaseAuthRoutes_1.default); // Rute untuk autentikasi Firebase
app.use('/api/piggybanks', piggyBankRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

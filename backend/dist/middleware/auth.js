"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtSecret = process.env.JWT_SECRET;
// Pastikan JWT_SECRET ada
if (!jwtSecret) {
    console.error('ERROR: JWT_SECRET tidak ditemukan di file .env');
    process.exit(1);
}
const auth = (req, res, next) => {
    // Dapatkan token dari header
    const token = req.header('x-auth-token'); // Umumnya token dikirim di header ini
    // Periksa jika tidak ada token
    if (!token) {
        res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak.' });
        return;
    }
    try {
        // Verifikasi token
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Tambahkan user dari payload token ke objek request
        // Sehingga rute yang terlindungi bisa mengakses req.user.id
        req.user = decoded.user;
        next(); // Lanjutkan ke middleware/rute berikutnya
    }
    catch (error) {
        res.status(401).json({ message: 'Token tidak valid.' });
    }
};
exports.default = auth;

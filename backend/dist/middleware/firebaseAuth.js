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
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
/**
 * Middleware untuk memverifikasi token Firebase
 * Token harus disediakan di header Authorization: Bearer <token>
 */
const firebaseAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decodedToken = yield firebase_1.auth.verifyIdToken(idToken);
        // Tambahkan informasi pengguna Firebase ke objek request
        req.firebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            name: decodedToken.name,
            picture: decodedToken.picture
        };
        next(); // Lanjutkan ke middleware/rute berikutnya
    }
    catch (error) {
        console.error('Error verifying Firebase token:', error);
        res.status(401).json({ message: 'Token Firebase tidak valid.' });
    }
});
exports.default = firebaseAuth;

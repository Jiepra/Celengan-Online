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
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const firebaseAuth_1 = __importDefault(require("../middleware/firebaseAuth"));
dotenv_1.default.config(); // Pastikan variabel lingkungan dimuat
const router = (0, express_1.Router)();
const jwtSecret = process.env.JWT_SECRET;
// Pastikan JWT_SECRET ada
if (!jwtSecret) {
    console.error('ERROR: JWT_SECRET tidak ditemukan di file .env');
    process.exit(1);
}
// @route   POST /api/auth/register
// @desc    Mendaftarkan pengguna baru
// @access  Public
const registerHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: 'Mohon lengkapi semua field.' });
        return;
    }
    try {
        let user = yield User_1.default.findOne({ email });
        if (user) {
            res.status(400).json({ message: 'Email sudah terdaftar.' });
            return;
        }
        user = yield User_1.default.findOne({ username });
        if (user) {
            res.status(400).json({ message: 'Nama pengguna sudah digunakan.' });
            return;
        }
        user = new User_1.default({
            username,
            email,
            password,
        });
        yield user.save();
        const payload = {
            user: {
                id: user.id,
            },
        };
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
            if (err)
                throw err;
            res.status(201).json({ token, message: 'Pendaftaran berhasil!' });
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Mohon lengkapi email dan kata sandi.' });
        return;
    }
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Kredensial tidak valid.' });
            return;
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Kredensial tidak valid.' });
            return;
        }
        const payload = {
            user: {
                id: user.id,
            },
        };
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token, message: 'Login berhasil!' });
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
router.post('/register', registerHandler);
router.post('/login', loginHandler);
// @route   POST /api/auth/firebase-login
// @desc    Login atau daftar pengguna menggunakan Firebase UID
// @access  Public (dengan verifikasi token Firebase)
router.post('/firebase-login', firebaseAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const firebaseUser = req.firebaseUser;
        if (!firebaseUser) {
            res.status(401).json({ message: 'Token Firebase tidak valid atau tidak ada.' });
            return;
        }
        let user = yield User_1.default.findOne({ firebaseUid: firebaseUser.uid });
        if (!user) {
            // Jika pengguna belum terdaftar, buat pengguna baru
            user = new User_1.default({
                username: ((_a = firebaseUser.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'user' + Date.now(), // Gunakan bagian email sebelum @ sebagai username default
                email: firebaseUser.email,
                firebaseUid: firebaseUser.uid,
                // Password tidak diperlukan karena otentikasi melalui Firebase
            });
            yield user.save();
        }
        else {
            // Jika pengguna sudah ada, perbarui informasi jika diperlukan (misal: email)
            user.email = firebaseUser.email;
            yield user.save();
        }
        // Buat payload untuk JWT kita sendiri
        const payload = {
            user: {
                id: user.id,
                firebaseUid: user.firebaseUid,
            },
        };
        // Buat JWT kita sendiri
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token, message: 'Login Firebase berhasil!', user: user });
        });
    }
    catch (error) {
        console.error('Error in Firebase login:', error.message);
        res.status(500).send('Kesalahan Server Internal saat login Firebase.');
    }
}));
exports.default = router;

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
const User_1 = __importDefault(require("../models/User"));
const firebaseAuth_1 = __importDefault(require("../middleware/firebaseAuth"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const jwtSecret = process.env.JWT_SECRET;
// Pastikan JWT_SECRET ada
if (!jwtSecret) {
    console.error('ERROR: JWT_SECRET tidak ditemukan di file .env');
    process.exit(1);
}
// @route   POST /api/firebase-auth/login
// @desc    Login atau register dengan Firebase dan dapatkan token JWT
// @access  Public
router.post('/login', firebaseAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // firebaseUser sudah diverifikasi oleh middleware firebaseAuth
        const { uid, email, name, picture } = req.firebaseUser;
        // Cari user berdasarkan firebaseUid
        let user = yield User_1.default.findOne({ firebaseUid: uid });
        // Jika user belum ada, cari berdasarkan email
        if (!user) {
            user = yield User_1.default.findOne({ email });
            // Jika user dengan email yang sama ditemukan, update firebaseUid-nya
            if (user) {
                user.firebaseUid = uid;
                user.displayName = name || user.displayName;
                user.photoURL = picture || user.photoURL;
                yield user.save();
            }
            else {
                // Jika user benar-benar baru, buat user baru
                // Generate username unik dari email
                const baseUsername = email.split('@')[0];
                let username = baseUsername;
                let counter = 1;
                // Pastikan username unik
                while (yield User_1.default.findOne({ username })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }
                user = new User_1.default({
                    username,
                    email,
                    firebaseUid: uid,
                    displayName: name,
                    photoURL: picture
                });
                yield user.save();
            }
        }
        // Buat token JWT
        const payload = {
            user: {
                id: user._id
            }
        };
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '7d' }, // Token berlaku 7 hari
        (err, token) => {
            if (err)
                throw err;
            res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            });
        });
    }
    catch (error) {
        console.error('Error in Firebase login:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}));
// @route   GET /api/firebase-auth/me
// @desc    Dapatkan data user yang sedang login
// @access  Private
router.get('/me', firebaseAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Cari user berdasarkan firebaseUid
        const user = yield User_1.default.findOne({ firebaseUid: req.firebaseUser.uid }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User tidak ditemukan' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;

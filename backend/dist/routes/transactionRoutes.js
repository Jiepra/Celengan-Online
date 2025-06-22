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
const firebaseAuth_1 = __importDefault(require("../middleware/firebaseAuth"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const PiggyBank_1 = __importDefault(require("../models/PiggyBank"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// @route   POST /api/transactions
// @desc    Melakukan transaksi (deposit atau withdrawal) ke celengan
// @access  Private
const createTransactionHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { piggyBankId, amount, type, description } = req.body;
    console.log('Received transaction data:', { piggyBankId, amount, type, description });
    console.log('Request body raw:', req.body);
    console.log('Request headers:', req.headers);
    // Mendapatkan userId dari token Firebase
    const firebaseUid = (_a = req.firebaseUser) === null || _a === void 0 ? void 0 : _a.uid;
    console.log('Firebase UID from token:', firebaseUid);
    if (!firebaseUid) {
        console.log('No Firebase UID in token');
        res.status(401).json({ message: 'Tidak ada ID Firebase di token.' });
        return;
    }
    // Mencari user berdasarkan firebaseUid
    const user = yield User_1.default.findOne({ firebaseUid });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
        console.log('User not found for firebaseUid:', firebaseUid);
        res.status(404).json({ message: 'User tidak ditemukan.' });
        return;
    }
    const userId = user._id;
    console.log('User ID:', userId);
    if (!userId) {
        console.log('No user ID');
        res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
        return;
    }
    if (!piggyBankId || !amount || !type) {
        console.log('Missing required fields:', { piggyBankId, amount, type });
        res.status(400).json({ message: 'Piggy Bank ID, jumlah, dan tipe transaksi wajib diisi.' });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(piggyBankId)) {
        res.status(400).json({ message: 'ID celengan tidak valid.' });
        return;
    }
    if (amount <= 0) {
        res.status(400).json({ message: 'Jumlah transaksi harus lebih dari 0.' });
        return;
    }
    try {
        // 1. Temukan celengan dan pastikan itu milik pengguna
        const piggyBank = yield PiggyBank_1.default.findOne({ _id: piggyBankId, userId });
        if (!piggyBank) {
            res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
            return;
        }
        // 2. Lakukan update saldo celengan
        let newCurrentAmount = piggyBank.currentAmount;
        if (type === 'deposit') {
            newCurrentAmount += amount;
        }
        else if (type === 'withdrawal') {
            if (piggyBank.currentAmount < amount) {
                res.status(400).json({ message: 'Saldo tidak mencukupi untuk penarikan ini.' });
                return;
            }
            newCurrentAmount -= amount;
        }
        else {
            res.status(400).json({ message: 'Tipe transaksi tidak valid. Harus "deposit" atau "withdrawal".' });
            return;
        }
        piggyBank.currentAmount = newCurrentAmount;
        yield piggyBank.save(); // Simpan perubahan saldo di celengan
        // 3. Buat catatan transaksi
        const newTransaction = new Transaction_1.default({
            userId,
            piggyBankId,
            amount,
            type,
            description,
        });
        yield newTransaction.save();
        // 4. Hitung total saldo dari semua celengan milik pengguna
        const allPiggyBanks = yield PiggyBank_1.default.find({ userId });
        const totalBalance = allPiggyBanks.reduce((sum, pb) => sum + pb.currentAmount, 0);
        // 5. Kirim respons dengan transaksi, celengan yang diperbarui, dan saldo total baru
        res.status(201).json({
            message: 'Transaksi berhasil!',
            transaction: newTransaction,
            updatedPiggyBank: piggyBank,
            newBalance: totalBalance // Tambahkan saldo total baru ke respons
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
// @route   GET /api/transactions/:piggyBankId
// @desc    Mendapatkan semua transaksi untuk celengan tertentu
// @access  Private
const getTransactionsByPiggyBankIdHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Mendapatkan userId dari token Firebase
    const firebaseUid = (_a = req.firebaseUser) === null || _a === void 0 ? void 0 : _a.uid;
    if (!firebaseUid) {
        res.status(401).json({ message: 'Tidak ada ID Firebase di token.' });
        return;
    }
    // Mencari user berdasarkan firebaseUid
    const user = yield User_1.default.findOne({ firebaseUid });
    if (!user) {
        res.status(404).json({ message: 'User tidak ditemukan.' });
        return;
    }
    const userId = user._id;
    const { piggyBankId } = req.params; // Ambil ID celengan dari parameter URL
    if (!userId) {
        res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(piggyBankId)) {
        res.status(400).json({ message: 'ID celengan tidak valid.' });
        return;
    }
    try {
        // Pastikan celengan ada dan milik pengguna yang sedang login
        const piggyBank = yield PiggyBank_1.default.findOne({ _id: piggyBankId, userId });
        if (!piggyBank) {
            res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
            return;
        }
        // Dapatkan transaksi yang terkait dengan celengan ini dan milik pengguna ini
        const transactions = yield Transaction_1.default.find({ piggyBankId, userId }).sort({ createdAt: -1 });
        res.json(transactions);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
// @route   GET /api/transactions
// @desc    Mendapatkan semua transaksi untuk pengguna yang sedang login
// @access  Private
const getAllTransactionsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Mendapatkan userId dari token Firebase
    const firebaseUid = (_a = req.firebaseUser) === null || _a === void 0 ? void 0 : _a.uid;
    if (!firebaseUid) {
        res.status(401).json({ message: 'Tidak ada ID Firebase di token.' });
        return;
    }
    // Mencari user berdasarkan firebaseUid
    const user = yield User_1.default.findOne({ firebaseUid });
    if (!user) {
        res.status(404).json({ message: 'User tidak ditemukan.' });
        return;
    }
    const userId = user._id;
    try {
        // Dapatkan semua transaksi milik pengguna ini
        const transactions = yield Transaction_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json({ transactions });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
// Asosiasikan Handler dengan Rute
router.post('/', firebaseAuth_1.default, createTransactionHandler);
router.get('/', firebaseAuth_1.default, getAllTransactionsHandler);
router.get('/:piggyBankId', firebaseAuth_1.default, getTransactionsByPiggyBankIdHandler); // Perhatikan parameter :piggyBankId
exports.default = router;

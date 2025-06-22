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
const firebaseAuth_1 = __importDefault(require("../middleware/firebaseAuth")); // Impor middleware autentikasi Firebase
const PiggyBank_1 = __importDefault(require("../models/PiggyBank"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose")); // Untuk ObjectId
const router = (0, express_1.Router)();
// @route   POST /api/piggybanks
// @desc    Membuat celengan baru
// @access  Private (membutuhkan token autentikasi Firebase)
const createPiggyBankHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, goalAmount, description } = req.body;
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
    const userId = user._id; // Menggunakan MongoDB ObjectId dari user
    if (!userId) {
        res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
        return;
    }
    if (!name) {
        res.status(400).json({ message: 'Nama celengan wajib diisi.' });
        return;
    }
    try {
        const newPiggyBank = new PiggyBank_1.default({
            userId,
            name,
            goalAmount: goalAmount || 0,
            description,
            currentAmount: 0,
        });
        yield newPiggyBank.save();
        res.status(201).json({
            message: 'Celengan berhasil dibuat!',
            piggyBank: newPiggyBank,
        });
    }
    catch (error) {
        console.error(error.message);
        if (error.code === 11000) {
            res.status(400).json({ message: 'Nama celengan sudah ada.' });
            return;
        }
        res.status(500).send('Kesalahan Server');
    }
});
// GET /api/piggybanks
const getAllPiggyBanksHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (!userId) {
        res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
        return;
    }
    try {
        const piggyBanks = yield PiggyBank_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json(piggyBanks);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
// GET /api/piggybanks/:id
const getPiggyBankByIdHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const piggyBankId = req.params.id;
    if (!userId) {
        res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(piggyBankId)) {
        res.status(400).json({ message: 'ID celengan tidak valid.' });
        return;
    }
    try {
        const piggyBank = yield PiggyBank_1.default.findOne({ _id: piggyBankId, userId });
        if (!piggyBank) {
            res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
            return;
        }
        res.json(piggyBank);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
// PUT /api/piggybanks/:id
const updatePiggyBankHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, goalAmount, description } = req.body;
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
    const piggyBankId = req.params.id;
    if (!userId) {
        res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(piggyBankId)) {
        res.status(400).json({ message: 'ID celengan tidak valid.' });
        return;
    }
    try {
        const updatedPiggyBank = yield PiggyBank_1.default.findOneAndUpdate({ _id: piggyBankId, userId }, { $set: { name, goalAmount, description } }, { new: true, runValidators: true });
        if (!updatedPiggyBank) {
            res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
            return;
        }
        res.json({ message: 'Celengan berhasil diperbarui!', piggyBank: updatedPiggyBank });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
// DELETE /api/piggybanks/:id
const deletePiggyBankHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const piggyBankId = req.params.id;
    if (!userId) {
        res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(piggyBankId)) {
        res.status(400).json({ message: 'ID celengan tidak valid.' });
        return;
    }
    try {
        const deletedPiggyBank = yield PiggyBank_1.default.findOneAndDelete({ _id: piggyBankId, userId });
        if (!deletedPiggyBank) {
            res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
            return;
        }
        res.json({ message: 'Celengan berhasil dihapus!' });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Kesalahan Server');
    }
});
// Terapkan middleware firebaseAuth ke semua route
router.post('/', firebaseAuth_1.default, createPiggyBankHandler);
router.get('/', firebaseAuth_1.default, getAllPiggyBanksHandler);
router.get('/:id', firebaseAuth_1.default, getPiggyBankByIdHandler);
router.put('/:id', firebaseAuth_1.default, updatePiggyBankHandler);
router.delete('/:id', firebaseAuth_1.default, deletePiggyBankHandler);
exports.default = router;

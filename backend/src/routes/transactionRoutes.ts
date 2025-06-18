import { Router, Request, Response } from 'express';
import auth from '../middleware/auth';
import firebaseAuth from '../middleware/firebaseAuth';
import Transaction, { ITransaction } from '../models/Transaction';
import PiggyBank, { IPiggyBank } from '../models/PiggyBank';
import User from '../models/User';
import mongoose from 'mongoose';

const router = Router();

// Definisi Interface untuk body request
interface TransactionBody {
  piggyBankId?: string;
  amount?: number;
  type?: 'deposit' | 'withdrawal';
  description?: string;
}

// @route   POST /api/transactions
// @desc    Melakukan transaksi (deposit atau withdrawal) ke celengan
// @access  Private
const createTransactionHandler = async (req: Request, res: Response): Promise<void> => {
  const { piggyBankId, amount, type, description } = req.body as TransactionBody;
  
  console.log('Received transaction data:', { piggyBankId, amount, type, description });
  console.log('Request body raw:', req.body);
  console.log('Request headers:', req.headers);

  // Mendapatkan userId dari token Firebase
  const firebaseUid = req.firebaseUser?.uid;
  console.log('Firebase UID from token:', firebaseUid);
  
  if (!firebaseUid) {
    console.log('No Firebase UID in token');
    res.status(401).json({ message: 'Tidak ada ID Firebase di token.' });
    return;
  }
  
  // Mencari user berdasarkan firebaseUid
  const user = await User.findOne({ firebaseUid });
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

  if (!mongoose.Types.ObjectId.isValid(piggyBankId)) {
    res.status(400).json({ message: 'ID celengan tidak valid.' });
    return;
  }

  if (amount <= 0) {
    res.status(400).json({ message: 'Jumlah transaksi harus lebih dari 0.' });
    return;
  }

  try {
    // 1. Temukan celengan dan pastikan itu milik pengguna
    const piggyBank: IPiggyBank | null = await PiggyBank.findOne({ _id: piggyBankId, userId });

    if (!piggyBank) {
      res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
      return;
    }

    // 2. Lakukan update saldo celengan
    let newCurrentAmount = piggyBank.currentAmount;
    if (type === 'deposit') {
      newCurrentAmount += amount;
    } else if (type === 'withdrawal') {
      if (piggyBank.currentAmount < amount) {
        res.status(400).json({ message: 'Saldo tidak mencukupi untuk penarikan ini.' });
        return;
      }
      newCurrentAmount -= amount;
    } else {
      res.status(400).json({ message: 'Tipe transaksi tidak valid. Harus "deposit" atau "withdrawal".' });
      return;
    }

    piggyBank.currentAmount = newCurrentAmount;
    await piggyBank.save(); // Simpan perubahan saldo di celengan

    // 3. Buat catatan transaksi
    const newTransaction: ITransaction = new Transaction({
      userId,
      piggyBankId,
      amount,
      type,
      description,
    });

    await newTransaction.save();

    // 4. Hitung total saldo dari semua celengan milik pengguna
    const allPiggyBanks = await PiggyBank.find({ userId });
    const totalBalance = allPiggyBanks.reduce((sum, pb) => sum + pb.currentAmount, 0);

    // 5. Kirim respons dengan transaksi, celengan yang diperbarui, dan saldo total baru
    res.status(201).json({
      message: 'Transaksi berhasil!',
      transaction: newTransaction,
      updatedPiggyBank: piggyBank,
      newBalance: totalBalance // Tambahkan saldo total baru ke respons
    });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

// @route   GET /api/transactions/:piggyBankId
// @desc    Mendapatkan semua transaksi untuk celengan tertentu
// @access  Private
const getTransactionsByPiggyBankIdHandler = async (req: Request, res: Response): Promise<void> => {
  // Mendapatkan userId dari token Firebase
  const firebaseUid = req.firebaseUser?.uid;
  if (!firebaseUid) {
    res.status(401).json({ message: 'Tidak ada ID Firebase di token.' });
    return;
  }
  
  // Mencari user berdasarkan firebaseUid
  const user = await User.findOne({ firebaseUid });
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

  if (!mongoose.Types.ObjectId.isValid(piggyBankId)) {
    res.status(400).json({ message: 'ID celengan tidak valid.' });
    return;
  }

  try {
    // Pastikan celengan ada dan milik pengguna yang sedang login
    const piggyBank = await PiggyBank.findOne({ _id: piggyBankId, userId });
    if (!piggyBank) {
      res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
      return;
    }

    // Dapatkan transaksi yang terkait dengan celengan ini dan milik pengguna ini
    const transactions: ITransaction[] = await Transaction.find({ piggyBankId, userId }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

// @route   GET /api/transactions
// @desc    Mendapatkan semua transaksi untuk pengguna yang sedang login
// @access  Private
const getAllTransactionsHandler = async (req: Request, res: Response): Promise<void> => {
  // Mendapatkan userId dari token Firebase
  const firebaseUid = req.firebaseUser?.uid;
  if (!firebaseUid) {
    res.status(401).json({ message: 'Tidak ada ID Firebase di token.' });
    return;
  }
  
  // Mencari user berdasarkan firebaseUid
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    res.status(404).json({ message: 'User tidak ditemukan.' });
    return;
  }
  
  const userId = user._id;

  try {
    // Dapatkan semua transaksi milik pengguna ini
    const transactions: ITransaction[] = await Transaction.find({ userId }).sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

// Asosiasikan Handler dengan Rute
router.post('/', firebaseAuth, createTransactionHandler);
router.get('/', firebaseAuth, getAllTransactionsHandler);
router.get('/:piggyBankId', firebaseAuth, getTransactionsByPiggyBankIdHandler); // Perhatikan parameter :piggyBankId

export default router;
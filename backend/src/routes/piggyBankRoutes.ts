import { Router, Request, Response } from 'express';
import auth from '../middleware/auth'; // Impor middleware autentikasi
import firebaseAuth from '../middleware/firebaseAuth'; // Impor middleware autentikasi Firebase
import PiggyBank, { IPiggyBank } from '../models/PiggyBank';
import User from '../models/User';
import mongoose from 'mongoose'; // Untuk ObjectId

const router = Router(); 

// Definisikan interface untuk body request
interface CreatePiggyBankBody {
  name?: string;
  goalAmount?: number;
  description?: string;
}

interface UpdatePiggyBankBody {
  name?: string;
  goalAmount?: number;
  description?: string;
}

// @route   POST /api/piggybanks
// @desc    Membuat celengan baru
// @access  Private (membutuhkan token autentikasi Firebase)
const createPiggyBankHandler = async (req: Request, res: Response): Promise<void> => {
  const { name, goalAmount, description } = req.body as CreatePiggyBankBody;
  
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
    const newPiggyBank: IPiggyBank = new PiggyBank({
      userId,
      name,
      goalAmount: goalAmount || 0,
      description,
      currentAmount: 0,
    });

    await newPiggyBank.save();
    res.status(201).json({
      message: 'Celengan berhasil dibuat!',
      piggyBank: newPiggyBank,
    });
  } catch (error: any) {
    console.error(error.message);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Nama celengan sudah ada.' });
      return;
    }
    res.status(500).send('Kesalahan Server');
  }
};

// GET /api/piggybanks
const getAllPiggyBanksHandler = async (req: Request, res: Response): Promise<void> => {
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

  if (!userId) {
    res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
    return;
  }

  try {
    const piggyBanks: IPiggyBank[] = await PiggyBank.find({ userId }).sort({ createdAt: -1 });
    res.json(piggyBanks);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

// GET /api/piggybanks/:id
const getPiggyBankByIdHandler = async (req: Request, res: Response): Promise<void> => {
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
  const piggyBankId = req.params.id;

  if (!userId) {
    res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(piggyBankId)) {
    res.status(400).json({ message: 'ID celengan tidak valid.' });
    return;
  }

  try {
    const piggyBank: IPiggyBank | null = await PiggyBank.findOne({ _id: piggyBankId, userId });

    if (!piggyBank) {
      res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
      return;
    }

    res.json(piggyBank);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

// PUT /api/piggybanks/:id
const updatePiggyBankHandler = async (req: Request, res: Response): Promise<void> => {
  const { name, goalAmount, description } = req.body as UpdatePiggyBankBody;
  
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
  const piggyBankId = req.params.id;

  if (!userId) {
    res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(piggyBankId)) {
    res.status(400).json({ message: 'ID celengan tidak valid.' });
    return;
  }

  try {
    const updatedPiggyBank = await PiggyBank.findOneAndUpdate(
      { _id: piggyBankId, userId },
      { $set: { name, goalAmount, description } },
      { new: true, runValidators: true }
    );

    if (!updatedPiggyBank) {
      res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
      return;
    }

    res.json({ message: 'Celengan berhasil diperbarui!', piggyBank: updatedPiggyBank });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

// DELETE /api/piggybanks/:id
const deletePiggyBankHandler = async (req: Request, res: Response): Promise<void> => {
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
  const piggyBankId = req.params.id;

  if (!userId) {
    res.status(401).json({ message: 'Tidak ada ID pengguna di token.' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(piggyBankId)) {
    res.status(400).json({ message: 'ID celengan tidak valid.' });
    return;
  }

  try {
    const deletedPiggyBank = await PiggyBank.findOneAndDelete({ _id: piggyBankId, userId });

    if (!deletedPiggyBank) {
      res.status(404).json({ message: 'Celengan tidak ditemukan atau bukan milik Anda.' });
      return;
    }

    res.json({ message: 'Celengan berhasil dihapus!' });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

// Terapkan middleware firebaseAuth ke semua route
router.post('/', firebaseAuth, createPiggyBankHandler);
router.get('/', firebaseAuth, getAllPiggyBanksHandler);
router.get('/:id', firebaseAuth, getPiggyBankByIdHandler);
router.put('/:id', firebaseAuth, updatePiggyBankHandler);
router.delete('/:id', firebaseAuth, deletePiggyBankHandler);

export default router;
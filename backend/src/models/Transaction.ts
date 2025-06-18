import mongoose, { Schema, Document } from 'mongoose';

// Definisikan antarmuka (interface) untuk dokumen Transaction
export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId; // Pengguna yang melakukan transaksi
  piggyBankId: mongoose.Types.ObjectId; // Celengan yang terpengaruh
  amount: number; // Jumlah transaksi
  type: 'deposit' | 'withdrawal'; // Tipe transaksi: 'deposit' (pemasukan) atau 'withdrawal' (pengeluaran)
  description?: string; // Deskripsi transaksi (opsional)
  createdAt: Date;
}

// Definisikan Schema untuk Transaction
const TransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    piggyBankId: {
      type: Schema.Types.ObjectId,
      ref: 'PiggyBank',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Jumlah transaksi wajib diisi'],
      min: 0.01, // Minimal jumlah transaksi adalah 0.01
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'], // Hanya boleh 'deposit' atau 'withdrawal'
      required: [true, 'Tipe transaksi wajib diisi'],
    },
    description: {
      type: String,
      trim: true,
      required: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Hanya createdAt
  }
);

// Buat dan ekspor Model Transaction
const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
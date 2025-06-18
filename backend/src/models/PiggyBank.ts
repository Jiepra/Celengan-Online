import mongoose, { Schema, Document } from 'mongoose';

// Definisikan antarmuka (interface) untuk dokumen PiggyBank
export interface IPiggyBank extends Document {
  userId: mongoose.Types.ObjectId; // ID pengguna yang memiliki celengan ini
  name: string;
  goalAmount: number; // Jumlah target (opsional, bisa 0 jika tidak ada target)
  currentAmount: number; // Jumlah uang saat ini di celengan
  description?: string; // Deskripsi celengan (opsional)
  createdAt: Date;
  updatedAt: Date;
}

// Definisikan Schema untuk PiggyBank
const PiggyBankSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, // Tipe ObjectId dari MongoDB
      ref: 'User', // Referensi ke model 'User'
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nama celengan wajib diisi'],
      trim: true,
      minlength: 3,
    },
    goalAmount: {
      type: Number,
      required: false, // Tidak wajib ada target
      default: 0, // Default 0 jika tidak ada target
      min: 0,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0, // Celengan dimulai dengan 0
      min: 0,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

// Buat dan ekspor Model PiggyBank
const PiggyBank = mongoose.model<IPiggyBank>('PiggyBank', PiggyBankSchema);

export default PiggyBank;
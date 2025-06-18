import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Definisikan antarmuka (interface) untuk dokumen User
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Kata sandi mungkin tidak ada saat query, tapi ada saat pembuatan
  firebaseUid?: string; // UID dari Firebase Authentication
  displayName?: string; // Nama tampilan dari Firebase
  photoURL?: string; // URL foto profil dari Firebase
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

// Definisikan Schema untuk User
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Nama pengguna wajib diisi'],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Email tidak valid'], // Regex untuk validasi email
    },
    password: {
      type: String,
      required: false, // Password tidak wajib jika menggunakan Firebase Auth
      minlength: 6,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Memungkinkan nilai null/undefined dan tetap menjaga keunikan
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

// Middleware Mongoose: Hash kata sandi sebelum menyimpan
UserSchema.pre<IUser>('save', async function (next) {
  // Hanya hash password jika ada dan dimodifikasi
  if (this.password && this.isModified('password')) {
    const salt = await bcrypt.genSalt(10); // Menghasilkan "salt" untuk hashing
    this.password = await bcrypt.hash(this.password as string, salt); // Hash kata sandi
  }
  next();
});

// Metode di schema untuk membandingkan kata sandi
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // Jika tidak ada password (user Firebase), selalu kembalikan false
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password as string);
};

// Buat dan ekspor Model User
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
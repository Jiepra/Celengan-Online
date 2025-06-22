"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Definisikan Schema untuk User
const UserSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
});
// Middleware Mongoose: Hash kata sandi sebelum menyimpan
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Hanya hash password jika ada dan dimodifikasi
        if (this.password && this.isModified('password')) {
            const salt = yield bcryptjs_1.default.genSalt(10); // Menghasilkan "salt" untuk hashing
            this.password = yield bcryptjs_1.default.hash(this.password, salt); // Hash kata sandi
        }
        next();
    });
});
// Metode di schema untuk membandingkan kata sandi
UserSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        // Jika tidak ada password (user Firebase), selalu kembalikan false
        if (!this.password)
            return false;
        return bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
// Buat dan ekspor Model User
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;

import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Pastikan variabel lingkungan yang diperlukan tersedia
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!serviceAccountKey) {
  console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY tidak ditemukan di file .env');
  process.exit(1);
}

if (!projectId) {
  console.error('ERROR: FIREBASE_PROJECT_ID tidak ditemukan di file .env');
  process.exit(1);
}

// Inisialisasi Firebase Admin SDK
try {
  // Cek apakah Firebase Admin sudah diinisialisasi
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf8'))),
      projectId: projectId
    });
    console.log('Firebase Admin SDK berhasil diinisialisasi');
  }
} catch (error) {
  console.error('Gagal menginisialisasi Firebase Admin SDK:', error);
  process.exit(1);
}

export const auth = admin.auth();
export default admin;
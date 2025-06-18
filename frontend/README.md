# Celengan Online - Aplikasi Tabungan Online

Aplikasi Celengan Online adalah platform tabungan digital yang memungkinkan pengguna untuk mengelola tabungan mereka secara online. Aplikasi ini dibangun dengan React, TypeScript, dan Firebase.

## Fitur

- Autentikasi dengan Google
- Melihat saldo tabungan
- Menambah dan menarik saldo
- Menetapkan target tabungan
- Melihat riwayat transaksi

## Teknologi yang Digunakan

- React dengan TypeScript
- Tailwind CSS untuk styling
- Firebase Authentication untuk autentikasi
- Context API untuk state management

## Cara Menjalankan Aplikasi Secara Lokal

1. Clone repositori ini
2. Instal dependensi dengan menjalankan `npm install`
3. Buat project Firebase di [Firebase Console](https://console.firebase.google.com/)
4. Aktifkan autentikasi Google di Firebase Console
5. Salin konfigurasi Firebase ke file `.env` (lihat contoh di bawah)
6. Jalankan aplikasi dengan `npm start`

## Konfigurasi Firebase

Untuk mengonfigurasi Firebase, Anda perlu membuat file `.env` di root project dengan variabel-variabel berikut:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Ganti nilai-nilai tersebut dengan konfigurasi Firebase Anda.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Deployment ke Vercel

Untuk men-deploy aplikasi ke Vercel, ikuti langkah-langkah berikut:

1. Buat akun di [Vercel](https://vercel.com/) jika belum memilikinya
2. Instal Vercel CLI dengan menjalankan `npm i -g vercel`
3. Login ke Vercel dengan menjalankan `vercel login`
4. Deploy aplikasi dengan menjalankan `vercel` di root project
5. Ikuti instruksi yang muncul

Atau, Anda dapat men-deploy langsung dari GitHub:

1. Push kode Anda ke repositori GitHub
2. Masuk ke dashboard Vercel
3. Klik "New Project"
4. Impor repositori GitHub Anda
5. Konfigurasikan variabel lingkungan (environment variables) sesuai dengan file `.env` Anda
6. Klik "Deploy"

## Variabel Lingkungan di Vercel

Jangan lupa untuk menambahkan variabel lingkungan Firebase di dashboard Vercel:

1. Buka project Anda di dashboard Vercel
2. Klik "Settings" > "Environment Variables"
3. Tambahkan semua variabel dari file `.env` Anda

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# 💰 Project Celengan

Selamat datang di Project Celengan! Aplikasi ini dirancang untuk membantu Anda mengelola keuangan pribadi dengan mudah dan efektif. Dengan fitur-fitur seperti pencatatan transaksi, pengelolaan tabungan, dan visualisasi data, Project Celengan akan membantu Anda mencapai tujuan finansial Anda.

## ✨ Fitur Utama

-   **Pencatatan Transaksi:** Catat setiap pemasukan dan pengeluaran dengan detail.
-   **Pengelolaan Tabungan:** Buat dan pantau tujuan tabungan Anda.
-   **Visualisasi Data:** Lihat ringkasan keuangan Anda dalam bentuk grafik yang mudah dipahami.
-   **Autentikasi Aman:** Login dengan Google atau email/password.

## 🚀 Teknologi yang Digunakan

Project ini dibangun dengan teknologi modern untuk memastikan kinerja dan skalabilitas yang optimal.

### Frontend

-   **React:** ⚛️ Sebuah library JavaScript untuk membangun antarmuka pengguna.
    ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
-   **TypeScript:** 🟦 Superset JavaScript yang menambahkan tipe statis.
    ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
-   **Tailwind CSS:** 🌬️ Framework CSS utility-first untuk desain yang cepat dan responsif.
    ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend

-   **Node.js:** 🟢 Runtime JavaScript untuk membangun aplikasi sisi server.
    ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
-   **Express.js:** 🌐 Framework web minimalis dan fleksibel untuk Node.js.
    ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
-   **TypeScript:** 🟦 Superset JavaScript yang menambahkan tipe statis.
    ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### Database & Autentikasi

-   **Firebase:** 🔥 Platform pengembangan aplikasi yang menyediakan layanan backend seperti autentikasi dan database real-time.
    ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

## ⚙️ Instalasi

Ikuti langkah-langkah berikut untuk menjalankan Project Celengan di lingkungan lokal Anda.

1.  **Clone repositori:**

    ```bash
    git clone https://github.com/your-username/project-celengan.git
    cd project-celengan
    ```

2.  **Instal dependensi frontend:**

    ```bash
    cd frontend
    npm install
    ```

3.  **Instal dependensi backend:**

    ```bash
    cd ../backend
    npm install
    ```

4.  **Konfigurasi Firebase:**

    -   Buat proyek baru di [Firebase Console](https://console.firebase.google.com/).
    -   Aktifkan autentikasi Email/Password dan Google Sign-in.
    -   Buat file `.env` di direktori `frontend` dan `backend` berdasarkan `.env.example` dan isi dengan kredensial Firebase Anda.

5.  **Jalankan aplikasi:**

    ```bash
    # Di direktori backend
    npm start

    # Di direktori frontend (buka terminal baru)
    cd ../frontend
    npm start
    ```

    Aplikasi frontend akan berjalan di `http://localhost:3000` dan backend di `http://localhost:5000` (atau port yang Anda konfigurasi).

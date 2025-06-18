import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BalanceCard from '../components/BalanceCard';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import { useApp } from '../contexts/AppContext';
import { usePiggyBanks } from '../hooks/usePiggyBanks';
import { SavingsGoal } from '../types';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const { createPiggyBank, deletePiggyBank } = usePiggyBanks();
  const [modalType, setModalType] = useState<'deposit' | 'withdrawal' | null>(null);
  const [showCreatePiggyBankModal, setShowCreatePiggyBankModal] = useState(false);
  const [newPiggyBankName, setNewPiggyBankName] = useState('');
  const [newPiggyBankGoal, setNewPiggyBankGoal] = useState('');
  const [newPiggyBankDescription, setNewPiggyBankDescription] = useState('');
  const [selectedPiggyBankId, setSelectedPiggyBankId] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [piggyBankToDelete, setPiggyBankToDelete] = useState<string>('');

  // Cek apakah ada celengan yang sudah mencapai target
  useEffect(() => {
    state.savingsGoals.forEach(goal => {
      if (goal.currentAmount >= goal.targetAmount) {
        toast.success(`Selamat! Celengan "${goal.title}" telah mencapai target!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    });
  }, [state.savingsGoals]);

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedPiggyBankId('');
  };

  const handleCloseCreateModal = () => setShowCreatePiggyBankModal(false);

  const handleCreatePiggyBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goalAmount = parseInt(newPiggyBankGoal.replace(/[^0-9]/g, ''), 10);
      if (newPiggyBankName && goalAmount > 0) {
        await createPiggyBank(newPiggyBankName, goalAmount, newPiggyBankDescription);
        setNewPiggyBankName('');
        setNewPiggyBankGoal('');
        setNewPiggyBankDescription('');
        setShowCreatePiggyBankModal(false);
        toast.success('Celengan berhasil dibuat!');
      }
    } catch (error) {
      console.error('Error creating piggy bank:', error);
      toast.error('Gagal membuat celengan. Silakan coba lagi.');
    }
  };

  const handleGoalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const numValue = parseInt(value, 10);
      setNewPiggyBankGoal(new Intl.NumberFormat('id-ID').format(numValue));
    } else {
      setNewPiggyBankGoal('');
    }
  };

  // Handler untuk memilih celengan saat akan melakukan transaksi
  const handleTransactionClick = (type: 'deposit' | 'withdrawal') => {
    if (state.savingsGoals.length === 1) {
      // Jika hanya ada 1 celengan, langsung pilih celengan tersebut
      setSelectedPiggyBankId(state.savingsGoals[0].id);
      setModalType(type);
    } else if (state.savingsGoals.length > 1) {
      // Jika ada lebih dari 1 celengan, tampilkan modal untuk memilih celengan
      setSelectedPiggyBankId('');
      setModalType(type);
    }
  };

  // Handler untuk menghapus celengan
  const handleDeleteClick = (id: string) => {
    setPiggyBankToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePiggyBank(piggyBankToDelete);
      toast.success('Celengan berhasil dihapus!');
      setShowDeleteConfirmation(false);
      setPiggyBankToDelete('');
    } catch (error) {
      console.error('Error deleting piggy bank:', error);
      toast.error('Gagal menghapus celengan. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <button 
            onClick={() => setShowCreatePiggyBankModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            + Buat Celengan Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <BalanceCard 
            title="Total Saldo"
            balance={state.user?.balance || 0}
          />
        </div>

        {/* Daftar Celengan */}
        <h3 className="text-xl font-semibold mb-4">Daftar Celengan</h3>
        {state.savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {state.savingsGoals.map((goal: SavingsGoal) => (
              <div key={goal.id} className="bg-white rounded-lg shadow-md p-6 relative">
                {/* Delete button */}
                <button 
                  onClick={() => handleDeleteClick(goal.id)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Hapus celengan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                
                <h4 className="text-lg font-semibold mb-2">{goal.title}</h4>
                {goal.description && (
                  <p className="text-gray-600 mb-4 text-sm">{goal.description}</p>
                )}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Saldo Saat Ini</p>
                    <p className="font-semibold">Rp {new Intl.NumberFormat('id-ID').format(goal.currentAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="font-semibold">Rp {new Intl.NumberFormat('id-ID').format(goal.targetAmount)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPiggyBankId(goal.id);
                      setModalType('deposit');
                    }}
                    className="flex-1 bg-primary text-white text-sm py-2 rounded hover:bg-blue-800 transition-colors"
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPiggyBankId(goal.id);
                      setModalType('withdrawal');
                    }}
                    className="flex-1 bg-accent text-white text-sm py-2 rounded hover:bg-amber-600 transition-colors"
                  >
                    Tarik
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <p className="text-center text-gray-500">Anda belum memiliki celengan. Silakan buat celengan baru.</p>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => setShowCreatePiggyBankModal(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Buat Celengan
              </button>
            </div>
          </div>
        )}

        {/* Daftar Transaksi */}
        <h3 className="text-xl font-semibold mb-4">Riwayat Transaksi</h3>
        <div className="bg-white rounded-lg shadow-md p-6">
          <TransactionList 
            transactions={state.transactions}
          />
        </div>
      </main>

      {/* Modal Transaksi */}
      {modalType && selectedPiggyBankId && (
        <TransactionModal
          isOpen={true}
          onClose={handleCloseModal}
          type={modalType}
          piggyBankId={selectedPiggyBankId}
        />
      )}
      
      {/* Modal Pilih Celengan */}
      {modalType && !selectedPiggyBankId && state.savingsGoals.length > 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Pilih Celengan</h2>
            <p className="mb-4">Pilih celengan untuk {modalType === 'deposit' ? 'menambah tabungan' : 'menarik saldo'}:</p>
            <div className="max-h-60 overflow-y-auto mb-4">
              {state.savingsGoals.map((goal) => (
                <div 
                  key={goal.id} 
                  onClick={() => {
                    setSelectedPiggyBankId(goal.id);
                  }}
                  className="p-3 border rounded mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="font-semibold">{goal.title}</div>
                  {goal.description && <div className="text-sm text-gray-600">{goal.description}</div>}
                  <div className="text-sm mt-1">
                    <span className="text-gray-500">Saldo: </span>
                    <span>Rp {new Intl.NumberFormat('id-ID').format(goal.currentAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 p-2 border rounded hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Celengan Baru */}
      {showCreatePiggyBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Buat Celengan Baru</h2>
            <form onSubmit={handleCreatePiggyBank}>
              <div className="mb-4">
                <label htmlFor="piggyBankName" className="block text-gray-700 text-sm font-bold mb-2">Nama Celengan</label>
                <input
                  type="text"
                  id="piggyBankName"
                  value={newPiggyBankName}
                  onChange={(e) => setNewPiggyBankName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Contoh: Tabungan Liburan"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="piggyBankGoal" className="block text-gray-700 text-sm font-bold mb-2">Target Jumlah (Rp)</label>
                <input
                  type="text"
                  id="piggyBankGoal"
                  value={newPiggyBankGoal}
                  onChange={handleGoalAmountChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Contoh: 1.000.000"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="piggyBankDescription" className="block text-gray-700 text-sm font-bold mb-2">Deskripsi (Opsional)</label>
                <textarea
                  id="piggyBankDescription"
                  value={newPiggyBankDescription}
                  onChange={(e) => setNewPiggyBankDescription(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Contoh: Untuk liburan ke Bali tahun depan"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="flex-1 p-2 border rounded hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white p-2 rounded hover:bg-blue-800 transition-colors"
                >
                  Buat Celengan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="mb-6">Apakah Anda yakin ingin menghapus celengan ini? Semua data transaksi terkait juga akan dihapus.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 p-2 border rounded hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
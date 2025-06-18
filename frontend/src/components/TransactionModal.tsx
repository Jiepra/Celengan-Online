import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdrawal';
  piggyBankId: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, type, piggyBankId }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { addTransaction, isLoading, error } = useTransactions();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
      
      // Validasi piggyBankId
      if (!piggyBankId) {
        console.error('Error: piggyBankId is empty');
        return;
      }
      
      console.log('Submitting transaction with piggyBankId:', piggyBankId);
      
      if (numAmount > 0) {
        await addTransaction(type, numAmount, piggyBankId, description); // Pass description here
        setAmount('');
        setDescription('');
        onClose();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      // Error akan ditampilkan melalui state error dari useTransactions
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const numValue = parseInt(value, 10);
      setAmount(new Intl.NumberFormat('id-ID').format(numValue));
    } else {
      setAmount('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {type === 'deposit' ? 'Tambah Tabungan' : 'Tarik Saldo'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 mb-2">
              Jumlah
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                className="w-full p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={type === 'deposit' ? 'Sumber dana (contoh: Gaji, Bonus, dll)' : 'Tujuan penarikan (contoh: Bayar Kuliah, Belanja, dll)'}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-2 border rounded hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`flex-1 p-2 text-white rounded transition-colors ${
                type === 'deposit' 
                  ? 'bg-primary hover:bg-blue-800' 
                  : 'bg-accent hover:bg-amber-600'
              }`}
              disabled={isLoading || !amount}
            >
              {isLoading ? 'Memproses...' : 'Konfirmasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
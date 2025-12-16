import React, { useState, useEffect } from 'react';
import type { Seller } from '../types/types';
import { getSellers, createSeller } from '../services/api';

interface SellerSelectorProps {
  onSelectSeller: (seller: Seller) => void;
}

const SellerSelector: React.FC<SellerSelectorProps> = ({ onSelectSeller }) => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [initialEmeraldBalance, setInitialEmeraldBalance] = useState(0);

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      const data = await getSellers();
      setSellers(data);
    } catch (error) {
      setError('Failed to fetch sellers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSeller = await createSeller({ name, initialEmeraldBalance });
      setSellers([...sellers, newSeller]);
      setShowCreateForm(false);
      setName('');
      setInitialEmeraldBalance(0);
    } catch (error) {
      setError('Failed to create seller');
    }
  };

  if (isLoading) {
    return <div className="text-center p-12 text-slate-400">Loading sellers...</div>;
  }

  if (error) {
    return <div className="text-center p-12 text-red-400 bg-red-900/20 rounded-lg">{error}</div>;
  }

  return (
    <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-white">Select a Seller</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="group relative inline-flex items-center justify-center px-6 py-3 text-white font-bold overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg transition-all duration-300 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105"
        >
          <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
          <span className="relative">{showCreateForm ? 'Cancel' : 'Create Seller'}</span>
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateSeller} className="mb-8 p-8 bg-slate-800/60 rounded-xl shadow-inner border border-slate-700 animate-in fade-in duration-500">
          <h3 className="text-2xl font-bold mb-6 text-white">Create New Seller</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sellerName" className="block text-sm font-medium text-slate-300 mb-2">Seller Name</label>
              <input
                id="sellerName"
                type="text"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="initialBalance" className="block text-sm font-medium text-slate-300 mb-2">Initial Balance</label>
              <input
                id="initialBalance"
                type="number"
                placeholder="0.00"
                value={initialEmeraldBalance}
                onChange={(e) => setInitialEmeraldBalance(parseFloat(e.target.value))}
                className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 transition-colors"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <button type="submit" className="mt-8 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md transform hover:scale-105">
            Create Seller
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <div
            key={seller.id}
            className="group relative p-6 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/20 border border-slate-800 hover:border-slate-700"
            onClick={() => onSelectSeller(seller)}
          >
            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
            <div className="relative">
              <h3 className="font-bold text-2xl text-white truncate">{seller.name}</h3>
              <p className="text-emerald-400 mt-2 font-mono text-lg">{seller.emeraldBalance.toFixed(2)} Emeralds</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerSelector;

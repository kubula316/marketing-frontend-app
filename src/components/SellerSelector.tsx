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
    return <div className="text-center p-8">Loading sellers...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-400">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Select a Seller</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-teal-500 text-white font-bold px-5 py-2 rounded-lg hover:bg-teal-600 transition-colors shadow-md"
        >
          {showCreateForm ? 'Cancel' : 'Create Seller'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateSeller} className="mb-8 p-6 bg-gray-700 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-white">Create New Seller</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sellerName" className="block text-sm font-medium text-gray-300 mb-1">
                Seller Name
              </label>
              <input
                id="sellerName"
                type="text"
                placeholder="Enter seller name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-300 mb-1">
                Initial Balance (Emeralds)
              </label>
              <input
                id="initialBalance"
                type="number"
                placeholder="0.00"
                value={initialEmeraldBalance}
                onChange={(e) => setInitialEmeraldBalance(parseFloat(e.target.value))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-green-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-md">
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <div
            key={seller.id}
            className="p-6 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-transform transform hover:-translate-y-1 shadow-lg"
            onClick={() => onSelectSeller(seller)}
          >
            <h3 className="font-bold text-xl text-white">{seller.name}</h3>
            <p className="text-teal-400 mt-2">{seller.emeraldBalance.toFixed(2)} Emeralds</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerSelector;

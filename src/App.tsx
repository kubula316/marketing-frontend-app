import React, { useState } from 'react';
import SellerSelector from './components/SellerSelector';
import ProductList from './components/ProductList';
import CampaignManager from './components/CampaignManager';
import type { Seller, Product } from './types/types';
import { getSeller } from './services/api';

const App: React.FC = () => {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSelectSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToSellers = () => {
    setSelectedSeller(null);
    setSelectedProduct(null);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  // Function to refresh seller data
  const refreshSeller = async () => {
    if (selectedSeller) {
      try {
        const updatedSeller = await getSeller(selectedSeller.id);
        setSelectedSeller(updatedSeller);
      } catch (error) {
        console.error("Failed to refresh seller data:", error);
        // Optionally, show an error to the user
      }
    }
  };

  const renderSellerHeader = () => {
    if (!selectedSeller) return null;

    const balance = typeof selectedSeller.emeraldBalance === 'number'
      ? selectedSeller.emeraldBalance.toFixed(2)
      : '0.00';

    return (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-teal-400">
          Seller: {selectedSeller.name}
        </h2>
        <div className="text-lg font-semibold text-teal-300 bg-gray-700 px-4 py-2 rounded-lg">
          Balance: <span className="font-mono">{balance}</span> Emeralds
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-white tracking-tight">
            Marketing Campaign Manager
          </h1>
        </header>

        <main className="bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8">
          {selectedSeller && !selectedProduct && (
            <button
              onClick={handleBackToSellers}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-700 transition-colors"
            >
              &larr; Back to Sellers
            </button>
          )}
          {selectedProduct && (
            <button
              onClick={handleBackToProducts}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-700 transition-colors"
            >
              &larr; Back to Products
            </button>
          )}

          {!selectedSeller ? (
            <SellerSelector onSelectSeller={handleSelectSeller} />
          ) : !selectedProduct ? (
            <div>
              {renderSellerHeader()}
              <ProductList sellerId={selectedSeller.id} onSelectProduct={handleSelectProduct} />
            </div>
          ) : (
            <div>
              {renderSellerHeader()}
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Product: {selectedProduct.name}</h3>
              <CampaignManager productId={selectedProduct.id} onCampaignChange={refreshSeller} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

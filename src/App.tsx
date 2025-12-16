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

  const refreshSeller = async () => {
    if (selectedSeller) {
      try {
        const updatedSeller = await getSeller(selectedSeller.id);
        setSelectedSeller(updatedSeller);
      } catch (error) {
        console.error("Failed to refresh seller data:", error);
      }
    }
  };

  const renderSellerHeader = () => {
    if (!selectedSeller) return null;
    const balance = typeof selectedSeller.emeraldBalance === 'number' ? selectedSeller.emeraldBalance.toFixed(2) : '0.00';
    return (
      <div className="flex flex-wrap justify-between items-center mb-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
        <div>
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Active Seller</p>
          <h2 className="text-3xl font-bold text-white mt-1">
            {selectedSeller.name}
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Wallet Balance</p>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {balance} <span className="text-sm text-emerald-600">Emeralds</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans selection:bg-indigo-500/30">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <header className="mb-12 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <h1 className="relative text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 py-4 tracking-tight drop-shadow-sm">
            Marketing
          </h1>
          <p className="text-slate-400 text-lg mt-2">Campaign Management System</p>
        </header>

        <main className="relative z-10">
          {/* Navigation / Breadcrumbs area */}
          <div className="mb-6 flex gap-4">
            {selectedSeller && !selectedProduct && (
              <button
                onClick={handleBackToSellers}
                className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-all duration-300 border border-slate-700 hover:border-slate-600"
              >
                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> 
                Back to Sellers
              </button>
            )}
            {selectedProduct && (
              <button
                onClick={handleBackToProducts}
                className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-all duration-300 border border-slate-700 hover:border-slate-600"
              >
                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> 
                Back to Products
              </button>
            )}
          </div>

          {!selectedSeller ? (
            <SellerSelector onSelectSeller={handleSelectSeller} />
          ) : !selectedProduct ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderSellerHeader()}
              <ProductList sellerId={selectedSeller.id} onSelectProduct={handleSelectProduct} />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderSellerHeader()}
              <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-lg">
                <p className="text-sm text-cyan-400 uppercase tracking-wider font-bold mb-1">Selected Product</p>
                <h3 className="text-3xl font-bold text-white">{selectedProduct.name}</h3>
              </div>
              <CampaignManager productId={selectedProduct.id} onCampaignChange={refreshSeller} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

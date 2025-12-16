import React, { useState, useEffect } from 'react';
import type { Product } from '../types/types';
import { getProductsBySeller, createProduct } from '../services/api';

interface ProductListProps {
  sellerId: number;
  onSelectProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ sellerId, onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [name, setName] = useState('');

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProductsBySeller(sellerId);
      setProducts(data);
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sellerId]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProduct = await createProduct(sellerId, { name });
      setProducts([...products, newProduct]);
      setShowCreateForm(false);
      setName('');
    } catch (error) {
      setError('Failed to create product');
    }
  };

  if (isLoading) {
    return <div className="text-center p-12 text-slate-400">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center p-12 text-red-400 bg-red-900/20 rounded-lg">{error}</div>;
  }

  return (
    <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-white">Select a Product</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="group relative inline-flex items-center justify-center px-6 py-3 text-white font-bold overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105"
        >
          <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
          <span className="relative">{showCreateForm ? 'Cancel' : 'Create Product'}</span>
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProduct} className="mb-8 p-8 bg-slate-800/60 rounded-xl shadow-inner border border-slate-700 animate-in fade-in duration-500">
          <h3 className="text-2xl font-bold mb-6 text-white">Create New Product</h3>
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-slate-300 mb-2">Product Name</label>
            <input
              id="productName"
              type="text"
              placeholder="e.g., Running Shoes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 transition-colors"
              required
            />
          </div>
          <button type="submit" className="mt-8 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md transform hover:scale-105">
            Create Product
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative p-8 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/20 border border-slate-800 hover:border-slate-700"
            onClick={() => onSelectProduct(product)}
          >
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
            <div className="relative flex items-center justify-center h-full">
              <h3 className="font-bold text-2xl text-white text-center truncate">{product.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

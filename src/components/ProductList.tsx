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
    return <div className="text-center p-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-400">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Select a Product</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-cyan-500 text-white font-bold px-5 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-md"
        >
          {showCreateForm ? 'Cancel' : 'Create Product'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProduct} className="mb-8 p-6 bg-gray-700 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-white">Create New Product</h3>
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <button type="submit" className="mt-6 w-full bg-green-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-md">
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-6 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-transform transform hover:-translate-y-1 shadow-lg"
            onClick={() => onSelectProduct(product)}
          >
            <h3 className="font-bold text-xl text-white">{product.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

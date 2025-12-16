import type { Campaign, Product, Seller, Town, Keyword } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const getSellers = async (): Promise<Seller[]> => {
  const response = await fetch(`${API_BASE_URL}/sellers`);
  if (!response.ok) {
    throw new Error('Failed to fetch sellers');
  }
  return response.json();
};

export const getSeller = async (sellerId: number): Promise<Seller> => {
  const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch seller details');
  }
  return response.json();
};

export const createSeller = async (sellerData: { name: string; initialEmeraldBalance: number }): Promise<Seller> => {
  const response = await fetch(`${API_BASE_URL}/sellers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sellerData),
  });
  if (!response.ok) {
    throw new Error('Failed to create seller');
  }
  return response.json();
};

export const getProductsBySeller = async (sellerId: number): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products/sellers/${sellerId}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

export const createProduct = async (sellerId: number, productData: { name: string }): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/sellers/${sellerId}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
};

export const getCampaignsByProduct = async (productId: number): Promise<Campaign[]> => {
  const response = await fetch(`${API_BASE_URL}/campaigns/products/${productId}/campaigns`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }
  return response.json();
};

export const createCampaign = async (productId: number, campaignData: Omit<Campaign, 'id'>): Promise<Campaign> => {
  const response = await fetch(`${API_BASE_URL}/campaigns/products/${productId}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaignData),
  });
  if (!response.ok) {
    throw new Error('Failed to create campaign');
  }
  return response.json();
};

export const updateCampaign = async (campaignId: number, campaignData: Omit<Campaign, 'id'>): Promise<Campaign> => {
  const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaignData),
  });
  if (!response.ok) {
    throw new Error('Failed to update campaign');
  }
  return response.json();
};

export const deleteCampaign = async (campaignId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete campaign');
  }
};

// Dictionary endpoints

export const getTowns = async (): Promise<Town[]> => {
  const response = await fetch(`${API_BASE_URL}/dictionary/towns`);
  if (!response.ok) {
    throw new Error('Failed to fetch towns');
  }
  return response.json();
};

export const searchKeywords = async (query: string): Promise<Keyword[]> => {
  const url = query 
    ? `${API_BASE_URL}/dictionary/keywords?query=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/dictionary/keywords`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch keywords');
  }
  return response.json();
};

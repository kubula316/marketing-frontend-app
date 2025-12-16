// Type definitions for the application

export interface Seller {
  id: number;
  name: string;
  emeraldBalance: number;
}

export interface Product {
  id: number;
  name: string;
}

export interface Campaign {
  id: number;
  campaignName: string;
  keywords: string[];
  bidAmount: number;
  campaignFund: number;
  status: 'ON' | 'OFF';
  townId?: number;
  radiusKm: number;
}

export interface Town {
  id: number;
  name: string;
}

export interface Keyword {
  id: number;
  value: string;
}

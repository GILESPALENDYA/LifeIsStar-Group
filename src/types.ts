export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  status: 'active' | 'hidden';
  createdAt: any;
  updatedAt: any;
}

export interface MarketplaceLinks {
  tokopedia?: string;
  shopee?: string;
  blibli?: string;
}

export interface ProfileSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  createdAt: any;
}

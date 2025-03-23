export interface Shop {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  user_id: string;
}

export interface Item {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  image_url?: string;
  shop_id: string;
  category_id: string | null;
  user_id: string;
  price: number;
  count: number;
}

export interface Category {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  shop_id: string;
  user_id: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
} 
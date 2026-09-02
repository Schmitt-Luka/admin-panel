export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: string;
}

export interface Sale {
  id: string;
  total: string;
  createdAt: string;
  items: SaleItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

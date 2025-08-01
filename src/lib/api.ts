// API Service Layer for Spring Boot E-commerce Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Types for API responses
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  brand: string;
  category: Category;
  images: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  fileName: string;
  downloadUrl: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

export interface Cart {
  id: number;
  totalAmount: number;
  cartItems: CartItem[];
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  address: string;
  user: User;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

// Auth token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Base fetch wrapper with auth
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

// User API
export const userApi = {
  create: (user: Omit<User, 'id'>): Promise<User> =>
    apiFetch('/users/add', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  getById: (userId: number): Promise<User> =>
    apiFetch(`/users/${userId}/user`),

  update: (userId: number, user: Partial<User>): Promise<User> =>
    apiFetch(`/users/${userId}/update`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),

  delete: (userId: number): Promise<void> =>
    apiFetch(`/users/${userId}/delete`, { method: 'DELETE' }),
};

// Product API
export const productApi = {
  create: (product: Omit<Product, 'id'>): Promise<Product> =>
    apiFetch('/products/add', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  getAll: (): Promise<Product[]> =>
    apiFetch('/products/all'),

  getByName: (name: string): Promise<Product[]> =>
    apiFetch(`/products/products/${encodeURIComponent(name)}/products`),

  getByCategoryAndBrand: (category: string, brand: string): Promise<Product[]> =>
    apiFetch(`/products/products/by/category-and-brand?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(brand)}`),

  getByBrandAndName: (brand: string, name: string): Promise<Product[]> =>
    apiFetch(`/products/products/by/brand-and-name?brandName=${encodeURIComponent(brand)}&productName=${encodeURIComponent(name)}`),

  getByCategory: (category: string): Promise<Product[]> =>
    apiFetch(`/products/product/${encodeURIComponent(category)}/all`),

  getById: (productId: number): Promise<Product> =>
    apiFetch(`/products/product/${productId}/product`),

  getCountByBrandAndName: (brand: string, name: string): Promise<number> =>
    apiFetch(`/products/product/count/by-brand/and-name?brand=${encodeURIComponent(brand)}&name=${encodeURIComponent(name)}`),

  getByBrand: (brand: string): Promise<Product[]> =>
    apiFetch(`/products/product/by-brand?brand=${encodeURIComponent(brand)}`),

  update: (productId: number, product: Partial<Product>): Promise<Product> =>
    apiFetch(`/products/product/${productId}/update`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  delete: (productId: number): Promise<void> =>
    apiFetch(`/products/product/${productId}/delete`, { method: 'DELETE' }),
};

// Category API
export const categoryApi = {
  create: (category: Omit<Category, 'id'>): Promise<Category> =>
    apiFetch('/categories/add', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  getAll: (): Promise<Category[]> =>
    apiFetch('/categories/all'),

  getById: (id: number): Promise<Category> =>
    apiFetch(`/categories/category/${id}/category`),

  getByName: (name: string): Promise<Category> =>
    apiFetch(`/categories/category/${encodeURIComponent(name)}/category`),

  update: (id: number, category: Partial<Category>): Promise<Category> =>
    apiFetch(`/categories/category/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),

  delete: (id: number): Promise<void> =>
    apiFetch(`/categories/category/${id}/delete`, { method: 'DELETE' }),
};

// Cart API
export const cartApi = {
  getCart: (cartId: number): Promise<Cart> =>
    apiFetch(`/carts/${cartId}/my-cart`),

  getTotalPrice: (cartId: number): Promise<number> =>
    apiFetch(`/carts/${cartId}/cart/total-price`),

  clearCart: (cartId: number): Promise<void> =>
    apiFetch(`/carts/${cartId}/clear`, { method: 'DELETE' }),
};

// Cart Item API
export const cartItemApi = {
  addItem: (cartId: number, productId: number, quantity: number): Promise<void> =>
    apiFetch(`/cartItems/item/add?cartId=${cartId}&productId=${productId}&quantity=${quantity}`, {
      method: 'POST',
    }),

  updateItem: (cartId: number, itemId: number, quantity: number): Promise<void> =>
    apiFetch(`/cartItems/cart/${cartId}/item/${itemId}/update?quantity=${quantity}`, {
      method: 'PUT',
    }),

  removeItem: (cartId: number, itemId: number): Promise<void> =>
    apiFetch(`/cartItems/cart/${cartId}/item/${itemId}/remove`, {
      method: 'DELETE',
    }),
};

// Order API
export const orderApi = {
  createOrder: (userId: number, address: string): Promise<Order> =>
    apiFetch(`/orders/order?userId=${userId}&address=${encodeURIComponent(address)}`, {
      method: 'POST',
    }),

  getUserOrders: (userId: number): Promise<Order[]> =>
    apiFetch(`/orders/${userId}/order`),

  getOrderById: (orderId: number): Promise<Order> =>
    apiFetch(`/orders/${orderId}/order`),
};

// Image API
export const imageApi = {
  upload: (imageFile: File): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiFetch('/images/upload', {
      method: 'POST',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: formData,
    });
  },

  download: (imageId: number): string =>
    `${API_BASE_URL}/images/image/download/${imageId}`,

  update: (imageId: number, imageFile: File): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiFetch(`/images/image/${imageId}/update`, {
      method: 'PUT',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: formData,
    });
  },

  delete: (imageId: number): Promise<void> =>
    apiFetch(`/images/image/${imageId}/delete`, { method: 'DELETE' }),
};
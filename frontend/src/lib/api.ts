/**
 * API Client — typed fetch wrapper for backend communication.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ApiOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

import { logout } from './auth';

async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const requestHeaders = new Headers(options.headers || {});

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (!requestHeaders.has('Content-Type') && !(options.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    // If we get a 401 Unauthorized, and it's not the login endpoint,
    // trigger a global logout because the session has likely expired.
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      if (typeof window !== 'undefined') {
        logout();
      }
    }

    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      errorData?.detail || `API Error: ${response.status}`,
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (firebaseToken: string) =>
    apiRequest<{
      access_token: string;
      refresh_token: string;
      user_id: string;
      is_new_user: boolean;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ firebase_token: firebaseToken }),
    }),

  refreshToken: (refreshToken: string) =>
    apiRequest<{
      access_token: string;
      refresh_token: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  getMe: (token: string) =>
    apiRequest<any>('/auth/me', { token }),

  updateProfile: (token: string, data: { name?: string }) =>
    apiRequest<any>('/auth/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  // Restaurants
  createRestaurant: (token: string, data: any) =>
    apiRequest<any>('/restaurants/', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  getMyRestaurants: (token: string) =>
    apiRequest<any[]>('/restaurants/', { token }),

  getRestaurant: (token: string, id: string) =>
    apiRequest<any>(`/restaurants/${id}`, { token }),

  updateRestaurant: (token: string, id: string, data: any) =>
    apiRequest<any>(`/restaurants/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  getRestaurantPublic: (slug: string) =>
    apiRequest<any>(`/restaurants/public/${slug}`),

  // Menus
  getMenus: (token: string, restaurantId: string) =>
    apiRequest<any[]>(`/restaurants/${restaurantId}/menus`, { token }),

  createMenu: (token: string, restaurantId: string, data: any) =>
    apiRequest<any>(`/restaurants/${restaurantId}/menus`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  updateMenu: (token: string, id: string, data: any) =>
    apiRequest<any>(`/menus/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  deleteMenu: (token: string, id: string) =>
    apiRequest<void>(`/menus/${id}`, {
      method: 'DELETE',
      token,
    }),

  // Categories
  getCategories: (token: string, menuId: string) =>
    apiRequest<any[]>(`/menus/${menuId}/categories`, { token }),

  createCategory: (token: string, menuId: string, data: any) =>
    apiRequest<any>(`/menus/${menuId}/categories`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  updateCategory: (token: string, categoryId: string, data: any) =>
    apiRequest<any>(`/categories/${categoryId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  deleteCategory: (token: string, categoryId: string) =>
    apiRequest<void>(`/categories/${categoryId}`, {
      method: 'DELETE',
      token,
    }),

  // Items
  getItems: (token: string, categoryId: string) =>
    apiRequest<any[]>(`/categories/${categoryId}/items`, { token }),

  createItem: (token: string, categoryId: string, data: any) =>
    apiRequest<any>(`/categories/${categoryId}/items`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  updateItem: (token: string, itemId: string, data: any) =>
    apiRequest<any>(`/items/${itemId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  toggleItemAvailability: (token: string, itemId: string) =>
    apiRequest<any>(`/items/${itemId}/toggle-availability`, {
      method: 'PATCH',
      token,
    }),

  deleteItem: (token: string, itemId: string) =>
    apiRequest<void>(`/items/${itemId}`, {
      method: 'DELETE',
      token,
    }),

  // Gallery
  getGallery: (token: string, restaurantId: string, category?: string) =>
    apiRequest<any[]>(`/restaurants/${restaurantId}/gallery${category ? `?category=${category}` : ''}`, { token }),

  uploadGalleryImage: (token: string, restaurantId: string, formData: FormData) =>
    apiRequest<any>(`/restaurants/${restaurantId}/gallery`, {
      method: 'POST',
      token,
      body: formData,
    }),

  deleteGalleryImage: (token: string, imageId: string) =>
    apiRequest<void>(`/gallery/${imageId}`, {
      method: 'DELETE',
      token,
    }),

  // QR Codes
  getQRCodes: (token: string, restaurantId: string) =>
    apiRequest<any[]>(`/restaurants/${restaurantId}/qr`, { token }),

  createQRCode: (token: string, restaurantId: string, data: any) =>
    apiRequest<any>(`/restaurants/${restaurantId}/qr`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  getRestaurantStats: (token: string, restaurantId: string) =>
    apiRequest<any>(`/restaurants/${restaurantId}/stats`, { token }),

  // Tiers
  getTiers: (token?: string) =>
    apiRequest<any>('/tiers/', token ? { token } : {}),

  getMyTierUsage: (token: string) =>
    apiRequest<any>('/tiers/my-usage', { token }),

  requestTierUpgrade: (token: string, targetTier: string, message?: string) =>
    apiRequest<any>('/tiers/upgrade-request', {
      method: 'POST',
      token,
      body: JSON.stringify({ target_tier: targetTier, message }),
    }),
};

export { ApiError };

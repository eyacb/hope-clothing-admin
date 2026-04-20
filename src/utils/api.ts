import axios from "axios";
import {
  Product,
  Order,
  CreateProductData,
  UpdateProductData,
  LoginCredentials,
} from "../types";

const API_BASE_URL = (import.meta as any).env.VITE_API_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL ,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/admin/login", credentials);
    return response.data;
  },
};

export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get("/admin/products");
    return response.data;
  },
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },
  create: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post("/admin/products", data);
    return response.data;
  },
  update: async (data: UpdateProductData): Promise<Product> => {
    const response = await api.put(`/admin/products/${data.id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },
};

export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get("/admin/orders");
    return response.data;
  },
  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id: string, status: Order["status"]): Promise<Order> => {
    const response = await api.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/orders/${id}`);
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },
};

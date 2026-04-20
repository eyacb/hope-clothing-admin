import axios from "axios";

const API_BASE_URL = (import.meta as any).env.VITE_API_URL as string;

export interface UploadedFile {
  id?: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface UploadResponse {
  success: boolean;
  file?: UploadedFile;
  files?: UploadedFile[];
  count?: number;
  message?: string;
}

export interface UploadStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
}

export const uploadAPI = {
  // Upload single file
  uploadFile: async (
    file: File,
    uploadType: "products" | "admin" = "products",
    productId?: string
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", uploadType);
    if (productId) {
      formData.append("productId", productId);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Upload failed");
    }
  },

  // Upload multiple files
  uploadMultipleFiles: async (
    files: File[],
    uploadType: "products" | "admin" = "products",
    productId?: string
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("uploadType", uploadType);
    if (productId) {
      formData.append("productId", productId);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/multiple`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Upload failed");
    }
  },

  // Get upload statistics
  getStats: async (): Promise<{ success: boolean; stats: UploadStats }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/upload/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get stats");
    }
  },

  // Delete uploaded file
  deleteFile: async (
    fileId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/upload/${fileId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Delete failed");
    }
  },

  // Get file URL
  getFileUrl: (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    try {
      const base = API_BASE_URL?.startsWith("http")
        ? API_BASE_URL
        : `https://${API_BASE_URL || ""}`;
      const url = new URL(base);
      // Use origin (protocol + host + optional port), drop any path like /api
      const origin = url.origin.replace(/\/$/, "");
      return `${origin}${path}`;
    } catch {
      // Fallback to simple replace if VITE_API_URL is valid enough
      return `${(API_BASE_URL || "").replace("/api", "")}${path}`;
    }
  },
};

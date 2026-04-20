export interface Admin {
  id: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  basePrice: string;
  discountPercentage?: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size?: string | null;
  stock: number;
}

export interface Order {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  address: string;
  total: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  color: string;
  size?: string | null;
  quantity: number;
  price: string;
}

export interface CreateProductData {
  title: string;
  description: string;
  basePrice: string;
  discountPercentage?: number | null;
  images: { url: string }[];
  variants: {
    color: string;
    size?: string | null;
    stock: number;
  }[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

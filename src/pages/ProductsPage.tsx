import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { productsAPI } from "../utils/api";
import { uploadAPI } from "../utils/uploadAPI";
import { Product, CreateProductData } from "../types";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchProducts();
  }, [isAuthenticated, navigate]);

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsAPI.delete(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleCreate = async (data: CreateProductData) => {
    try {
      const newProduct = await productsAPI.create(data);
      setProducts([...products, newProduct]);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  const handleUpdate = async (data: CreateProductData & { id?: string }) => {
    if (!data.id) return;

    try {
      const updatedProduct = await productsAPI.update(
        data as CreateProductData & { id: string }
      );
      setProducts(products.map((p) => (p.id === data.id ? updatedProduct : p)));
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Product
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        {product.images?.[0]?.url ? (
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={product.images[0].url}
                            alt={product.title}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.basePrice} DT
                          {product.discountPercentage && (
                            <span className="ml-2 text-green-600">
                              -{product.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No products
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new product.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Product Modal */}
      {(showCreateForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onClose={() => {
            setShowCreateForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Product Form Component
interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: CreateProductData & { id?: string }) => void;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateProductData>({
    title: product?.title || "",
    description: product?.description || "",
    basePrice: product?.basePrice || "",
    discountPercentage: product?.discountPercentage || null,
    images: product?.images || [],
    variants: product?.variants || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: product?.id,
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // State for managing color-based variants
  const [colorVariants, setColorVariants] = useState<{
    [key: string]: {
      color: string;
      sizes: { size: string; stock: number }[];
    };
  }>({});

  // Initialize colorVariants from existing variants when editing
  React.useEffect(() => {
    if (product?.variants) {
      const grouped: {
        [key: string]: {
          color: string;
          sizes: { size: string; stock: number }[];
        };
      } = {};

      product.variants.forEach((variant) => {
        if (!grouped[variant.color]) {
          grouped[variant.color] = {
            color: variant.color,
            sizes: [],
          };
        }
        grouped[variant.color].sizes.push({
          size: variant.size || "",
          stock: variant.stock,
        });
      });

      setColorVariants(grouped);
    }
  }, [product]);

  // Convert colorVariants back to flat variants array for backend
  React.useEffect(() => {
    const flatVariants: CreateProductData["variants"] = [];

    Object.values(colorVariants).forEach((colorData) => {
      colorData.sizes.forEach((sizeData) => {
        if (colorData.color && sizeData.size) {
          flatVariants.push({
            color: colorData.color,
            size: sizeData.size,
            stock: sizeData.stock,
          });
        }
      });
    });

    setFormData((prev) => ({
      ...prev,
      variants: flatVariants,
    }));
  }, [colorVariants]);

  const addColorVariant = () => {
    const newColorKey = `color_${Date.now()}`;
    setColorVariants((prev) => ({
      ...prev,
      [newColorKey]: {
        color: "",
        sizes: [{ size: "", stock: 0 }],
      },
    }));
  };

  const updateColorVariant = (colorKey: string, color: string) => {
    setColorVariants((prev) => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        color: color,
      },
    }));
  };

  const addSizeToColor = (colorKey: string) => {
    setColorVariants((prev) => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        sizes: [...prev[colorKey].sizes, { size: "", stock: 0 }],
      },
    }));
  };

  const updateSizeInColor = (
    colorKey: string,
    sizeIndex: number,
    field: "size" | "stock",
    value: string | number
  ) => {
    setColorVariants((prev) => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        sizes: prev[colorKey].sizes.map((size, index) =>
          index === sizeIndex ? { ...size, [field]: value } : size
        ),
      },
    }));
  };

  const removeSizeFromColor = (colorKey: string, sizeIndex: number) => {
    setColorVariants((prev) => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        sizes: prev[colorKey].sizes.filter((_, index) => index !== sizeIndex),
      },
    }));
  };

  const removeColorVariant = (colorKey: string) => {
    setColorVariants((prev) => {
      const newState = { ...prev };
      delete newState[colorKey];
      return newState;
    });
  };

  // Unified local file handling (click or drop)
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleLocalFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Instant previews
    const localPreviews = files.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...localPreviews.map((p) => ({ url: p }))],
    }));

    // Upload
    try {
      const resp = await uploadAPI.uploadMultipleFiles(files, "products");
      const uploaded = (resp.files || []).map((f) => ({
        url: uploadAPI.getFileUrl(f.path),
      }));

      // Replace blob previews with real URLs
      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images.filter((img) => !img.url.startsWith("blob:")),
          ...uploaded,
        ],
      }));
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white/60">
          <h3 className="text-xl font-semibold text-gray-900">
            {product ? "Edit Product" : "Create Product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Product title"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 shadow-sm transition focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Write a short description..."
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 shadow-sm transition focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Base Price
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 shadow-sm transition focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discount Percentage
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discountPercentage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="Optional"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 shadow-sm transition focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Image upload area - clickable and supports drag & drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleLocalFiles(Array.from(e.target.files || []))
              }
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleLocalFiles(Array.from(e.dataTransfer.files || []));
              }}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400 bg-gray-50/60"
            >
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-indigo-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, WEBP up to 5MB each
              </p>
            </div>

            {/* Thumbnails */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={
                        img.url.startsWith("http") ||
                        img.url.startsWith("blob:")
                          ? img.url
                          : uploadAPI.getFileUrl(img.url)
                      }
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full h-7 w-7 flex items-center justify-center shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Variants
            </label>
            <button
              type="button"
              onClick={addColorVariant}
              className="mb-4 inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Color
            </button>

            <div className="space-y-6">
              {Object.entries(colorVariants).map(([colorKey, colorData]) => (
                <div
                  key={colorKey}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Blue, Red, Black"
                        value={colorData.color}
                        onChange={(e) =>
                          updateColorVariant(colorKey, e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColorVariant(colorKey)}
                      className="ml-3 mt-6 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove this color"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Sizes & Stock
                      </label>
                      <button
                        type="button"
                        onClick={() => addSizeToColor(colorKey)}
                        className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 rounded-md px-2 py-1 hover:bg-indigo-50 transition-colors"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Size
                      </button>
                    </div>

                    {colorData.sizes.map((sizeData, sizeIndex) => (
                      <div key={sizeIndex} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="e.g., S, M, L, XL"
                          value={sizeData.size}
                          onChange={(e) =>
                            updateSizeInColor(
                              colorKey,
                              sizeIndex,
                              "size",
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                        />
                        <div className="flex">
                          <input
                            type="number"
                            placeholder="Stock qty"
                            value={sizeData.stock === 0 ? "" : sizeData.stock}
                            onChange={(e) =>
                              updateSizeInColor(
                                colorKey,
                                sizeIndex,
                                "stock",
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value) || 0
                              )
                            }
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeSizeFromColor(colorKey, sizeIndex)
                            }
                            className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 rounded-lg transition-colors"
                            title="Remove this size"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(colorVariants).length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M7 21a4 4 0 01-4-4V5a4 4 0 014-4h10a4 4 0 014 4v12a4 4 0 01-4 4M7 21h10M7 21V8a3 3 0 013-3h4a3 3 0 013 3v13M7 8V5a1 1 0 011-1h8a1 1 0 011 1v3"
                  />
                </svg>
                <p className="text-sm">No variants added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Add Color" to create your first variant
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              {product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsPage;

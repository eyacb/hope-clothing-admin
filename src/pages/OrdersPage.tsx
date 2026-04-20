import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ordersAPI } from "../utils/api";
import { Order } from "../types";

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      const updatedOrder = await ordersAPI.updateStatus(orderId, status);
      setOrders(
        orders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await ordersAPI.delete(id);
        setOrders(orders.filter((o) => o.id !== id));
        if (selectedOrder?.id === id) {
          setSelectedOrder(null);
        }
      } catch (error) {
        console.error("Failed to delete order:", error);
      }
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <div className="text-sm text-gray-500">
              Total: {orders.length} orders
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <div
                        className={`px-4 py-4 cursor-pointer hover:bg-gray-50 ${
                          selectedOrder?.id === order.id ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {order.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.phone}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items?.length || 0} items • 
                                {order.total} DT
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {orders.length === 0 && (
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No orders
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Orders will appear here when customers place them.
                  </p>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Order Details
                    </h3>
                    <button
                      onClick={() => handleDelete(selectedOrder.id)}
                      className="text-red-600 hover:text-red-500 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Customer Information
                      </h4>
                      <div className="mt-2 text-sm text-gray-900">
                        <p>
                          <strong>Name:</strong> {selectedOrder.fullName}
                        </p>
                        <p>
                          <strong>Phone:</strong> {selectedOrder.phone}
                        </p>
                        {selectedOrder.email && (
                          <p>
                            <strong>Email:</strong> {selectedOrder.email}
                          </p>
                        )}
                        {selectedOrder.whatsapp && (
                          <p>
                            <strong>WhatsApp:</strong> {selectedOrder.whatsapp}
                          </p>
                        )}
                        {selectedOrder.instagram && (
                          <p>
                            <strong>Instagram:</strong>{" "}
                            {selectedOrder.instagram}
                          </p>
                        )}
                        {selectedOrder.facebook && (
                          <p>
                            <strong>Facebook:</strong> {selectedOrder.facebook}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Delivery Address
                      </h4>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedOrder.address}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Order Items
                      </h4>
                      <div className="mt-2 space-y-2">
                        {selectedOrder.items?.map((item, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-900 border-b border-gray-200 pb-2"
                          >
                            <p>
                              <strong>{item.title}</strong>
                            </p>
                            <p>
                              Color: {item.color}{" "}
                              {item.size && `• Size: ${item.size}`}
                            </p>
                            <p>
                              Quantity: {item.quantity} • {item.price} DT each
                            </p>
                            <p>
                              <strong>
                                Total: 
                                {(Number(item.price) * item.quantity).toFixed(
                                  2
                                )} DT
                              </strong>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Order Total
                      </h4>
                      <p className="mt-2 text-lg font-bold text-gray-900">
                        {selectedOrder.total} DT
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Status
                      </h4>
                      <div className="mt-2">
                        <select
                          value={selectedOrder.status}
                          onChange={(e) =>
                            handleStatusChange(
                              selectedOrder.id,
                              e.target.value as Order["status"]
                            )
                          }
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Order Date
                      </h4>
                      <p className="mt-2 text-sm text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="text-center">
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
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Select an order
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Click on an order to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

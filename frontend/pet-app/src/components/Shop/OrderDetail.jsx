import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig.js";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/my-orders`);
        const foundOrder = response.data.find((o) => o.order_id === parseInt(id));
        if (foundOrder) {
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  if (!order) {
    return <div className="max-w-4xl mx-auto p-8">Order not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-semibold">#{order.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold">${(Number(order.total) / 1000).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-semibold capitalize">
              {order.payment_method || "Credit Card"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <div className="border rounded-lg p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Item</th>
                <th className="text-left py-2 px-4">Quantity</th>
                <th className="text-right py-2 px-4">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 px-4 font-medium">{item.products?.name || "Product"}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-semibold">${(Number(item.price) / 1000).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Estimated Delivery</p>
            <p className="font-semibold">
              {(() => {
                const orderDate = new Date(order.created_at);
                const minDate = new Date(orderDate);
                minDate.setDate(minDate.getDate() + 3);
                const maxDate = new Date(orderDate);
                maxDate.setDate(maxDate.getDate() + 5);
                return `${minDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${maxDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Shipping Address</p>
            <p className="font-semibold">
              {order.shipping_address || "Address not provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${(Number(order.subtotal) / 1000).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{Number(order.shipping) === 0 ? "Free" : `$${(Number(order.shipping) / 1000).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${(Number(order.tax) / 1000).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>${(Number(order.total) / 1000).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;


import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { Plus, Edit, Trash2, Tag, Calendar, Percent, DollarSign, X, Save } from "lucide-react";
import { showToast, showConfirm } from "../../utils/notifications";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const formatVND = (amount) => {
  if (!amount) return "0₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const CouponModal = ({ coupon, onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    discount_percent: coupon?.discount_percent || null,
    discount_amount: coupon?.discount_amount || null,
    rule_condition: coupon?.rule_condition || "",
    start_date: coupon?.start_date ? formatDate(coupon.start_date) : "",
    end_date: coupon?.end_date ? formatDate(coupon.end_date) : "",
    vendor_id: null, // Admin coupons always have vendor_id = null (apply to all)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "discount_percent" || name === "discount_amount" || name === "vendor_id"
          ? value === "" ? null : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code) {
      showToast("Please enter coupon code", "error");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 font-medium">
              ℹ️ This coupon will apply to <strong>all products</strong> from every vendor in the system.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              disabled={!!coupon}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none uppercase"
              placeholder="VD: SUMMER2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount % (if any)
              </label>
              <input
                type="number"
                name="discount_percent"
                value={formData.discount_percent || ""}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount (if any)
              </label>
              <input
                type="number"
                name="discount_amount"
                value={formData.discount_amount || ""}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition (e.g., Min: 100000)
            </label>
            <input
              type="text"
              name="rule_condition"
              value={formData.rule_condition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminCouponManagement = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchCoupons();
    }
  }, [user]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coupons/admin/all");
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      showToast("Failed to load coupon list", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    const result = await showConfirm("Delete Coupon", "Are you sure you want to delete this coupon?");
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/coupons/admin/${couponId}`);
      showToast("Coupon deleted successfully", "success");
      fetchCoupons();
    } catch (err) {
      console.error("Error deleting coupon:", err);
      showToast("Failed to delete coupon", "error");
    }
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      // Admin coupons should have vendor_id = null (apply to all products)
      const adminCouponData = {
        ...formData,
        vendor_id: null // Admin coupons apply to all vendors/products
      };
      
      if (editingCoupon) {
        await api.put(`/coupons/admin/${editingCoupon.coupon_id}`, adminCouponData);
        showToast("Coupon updated successfully", "success");
      } else {
        await api.post("/coupons/admin/create", adminCouponData);
        showToast("Coupon created successfully", "success");
      }
      setShowModal(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err) {
      console.error("Error saving coupon:", err);
      showToast(
        err.response?.data?.error || "Failed to save coupon",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">You don't have permission to access this page</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Coupon Management
            </h1>
            <p className="text-sm text-gray-600">
              Manage all discount codes in the system
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Coupon
          </button>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No coupons yet
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.coupon_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-900">{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.discount_percent ? (
                        <span className="text-green-600 font-medium">
                          {coupon.discount_percent}%
                        </span>
                      ) : coupon.discount_amount ? (
                        <span className="text-green-600 font-medium">
                          {formatVND(coupon.discount_amount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {coupon.vendors?.store_name || "All"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {coupon.start_date
                        ? formatDate(coupon.start_date)
                        : "Unlimited"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {coupon.end_date ? formatDate(coupon.end_date) : "Unlimited"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {coupon.usage_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.coupon_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <CouponModal
            coupon={editingCoupon}
            onClose={() => {
              setShowModal(false);
              setEditingCoupon(null);
            }}
            onSave={handleSave}
            isSaving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCouponManagement;


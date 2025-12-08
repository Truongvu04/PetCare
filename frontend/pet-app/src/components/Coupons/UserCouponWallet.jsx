import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { Tag, Calendar, Percent, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { showToast } from "../../utils/notifications";

const formatDate = (dateString) => {
  if (!dateString) return "Không giới hạn";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatVND = (amount) => {
  if (!amount) return "0₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const UserCouponWallet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [coupons, setCoupons] = useState({
    available: [],
    used: [],
    expired: [],
  });

  useEffect(() => {
    fetchCoupons();
  }, [user]);

  const fetchCoupons = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("/coupons/user/wallet");
      setCoupons(res.data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      showToast("Không thể tải mã giảm giá", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Đã sao chép mã: ${code}`, "success");
  };

  const tabs = [
    { id: "available", label: "Có thể dùng", count: coupons.available.length },
    { id: "used", label: "Đã sử dụng", count: coupons.used.length },
    { id: "expired", label: "Hết hạn", count: coupons.expired.length },
  ];

  const currentCoupons = coupons[activeTab] || [];

  if (loading) {
    return (
      <CustomerLayout currentPage="settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Đang tải mã giảm giá...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="settings">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Ví Mã Giảm Giá
        </h1>
        <p className="text-sm text-green-700 mb-8">
          Quản lý và sử dụng các mã giảm giá của bạn
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition ${
                activeTab === tab.id
                  ? "border-b-2 border-green-600 text-green-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Coupons List */}
        {currentCoupons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Tag className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">
              {activeTab === "available"
                ? "Chưa có mã giảm giá nào"
                : activeTab === "used"
                ? "Chưa sử dụng mã nào"
                : "Chưa có mã nào hết hạn"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentCoupons.map((coupon) => (
              <div
                key={coupon.coupon_id}
                className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
                  activeTab === "available"
                    ? "border-green-200 hover:border-green-400"
                    : activeTab === "used"
                    ? "border-gray-200 opacity-75"
                    : "border-red-200 opacity-60"
                } transition`}
              >
                {/* Coupon Header */}
                <div
                  className={`p-4 ${
                    activeTab === "available"
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : activeTab === "used"
                      ? "bg-gray-400"
                      : "bg-red-400"
                  } text-white`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={20} />
                      <span className="font-bold text-lg">{coupon.code}</span>
                    </div>
                    {activeTab === "available" && (
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition"
                      >
                        Sao chép
                      </button>
                    )}
                  </div>
                </div>

                {/* Coupon Body */}
                <div className="p-4">
                  {/* Discount Info */}
                  <div className="mb-4">
                    {coupon.discount_percent ? (
                      <div className="flex items-center gap-2">
                        <Percent className="text-green-600" size={24} />
                        <span className="text-2xl font-bold text-gray-900">
                          {coupon.discount_percent}%
                        </span>
                        <span className="text-sm text-gray-600">giảm giá</span>
                      </div>
                    ) : coupon.discount_amount ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-green-600" size={24} />
                        <span className="text-2xl font-bold text-gray-900">
                          {formatVND(coupon.discount_amount)}
                        </span>
                        <span className="text-sm text-gray-600">giảm giá</span>
                      </div>
                    ) : null}

                    {coupon.vendor && (
                      <p className="text-sm text-gray-600 mt-2">
                        Áp dụng cho: {coupon.vendor.store_name}
                      </p>
                    )}
                  </div>

                  {/* Conditions */}
                  {coupon.rule_condition && (
                    <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      {coupon.rule_condition}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>
                        {coupon.start_date
                          ? `Từ ${formatDate(coupon.start_date)}`
                          : "Không giới hạn"}
                      </span>
                    </div>
                    {coupon.end_date && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>Đến {formatDate(coupon.end_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {activeTab === "available" && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Có thể sử dụng</span>
                      </div>
                    )}
                    {activeTab === "used" && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Đã sử dụng</span>
                      </div>
                    )}
                    {activeTab === "expired" && (
                      <div className="flex items-center gap-2 text-red-500">
                        <XCircle size={16} />
                        <span className="text-sm font-medium">Hết hạn</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default UserCouponWallet;


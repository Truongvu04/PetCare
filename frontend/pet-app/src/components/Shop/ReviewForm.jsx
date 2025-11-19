import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../hooks/useAuth.js";

const ReviewForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState("");
  const [loadingName, setLoadingName] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("productId");
  const serviceId = searchParams.get("serviceId");

  useEffect(() => {
    const fetchItemName = async () => {
      try {
        if (productId) {
          const response = await api.get(`/products/${productId}`);
          setItemName(response.data.name || `Product #${productId}`);
        } else if (serviceId) {
          const response = await api.get(`/services/${serviceId}`);
          setItemName(response.data.name || `Service #${serviceId}`);
        }
      } catch (error) {
        console.error("Error fetching item name:", error);
        setItemName(productId ? `Product #${productId}` : `Service #${serviceId}`);
      } finally {
        setLoadingName(false);
      }
    };

    if (productId || serviceId) {
      fetchItemName();
    } else {
      setLoadingName(false);
    }
  }, [productId, serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá");
      navigate("/login");
      return;
    }

    if (rating === 0) {
      alert("Vui lòng chọn số sao");
      return;
    }

    if (!comment.trim()) {
      alert("Vui lòng nhập nhận xét");
      return;
    }

    setLoading(true);
    try {
      await api.post("/reviews", {
        rating,
        comment,
        productId: productId || null,
        serviceId: serviceId || null,
      });

      alert("Đánh giá thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Error creating review:", error);
      alert("Lỗi khi đánh giá: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loadingName) {
    return <div className="max-w-2xl mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Rate and Review</h1>
      <p className="text-green-600 mb-6">Share your experience with other pet owners</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product/Service Name
          </label>
          <input
            type="text"
            value={itemName || ""}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating (1-5 stars)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none">
                <Star
                  size={32}
                  className={
                    star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={6}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Write your review here..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;


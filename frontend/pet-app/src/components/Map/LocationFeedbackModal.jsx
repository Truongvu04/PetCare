import React, { useState } from 'react';
import { showSuccess, showError, showWarning } from '../../utils/notifications';

const LocationFeedbackModal = ({ 
  isOpen, 
  onClose, 
  clinic, 
  onSubmitFeedback 
}) => {
  const [feedbackType, setFeedbackType] = useState('incorrect_location');
  const [description, setDescription] = useState('');
  const [correctAddress, setCorrectAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      showWarning("Thiếu thông tin", "Vui lòng mô tả vấn đề");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        clinicId: clinic.id,
        clinicName: clinic.name,
        type: feedbackType,
        description: description.trim(),
        correctAddress: correctAddress.trim(),
        reportedCoordinates: clinic.coordinates,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      if (onSubmitFeedback) {
        await onSubmitFeedback(feedbackData);
      }

      // Reset form
      setDescription('');
      setCorrectAddress('');
      setFeedbackType('incorrect_location');
      
      showSuccess("Thành công", "Cảm ơn bạn đã báo cáo! Chúng tôi sẽ xem xét và cập nhật thông tin.");
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError("Lỗi", "Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !clinic) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Báo cáo vấn đề
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Clinic Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white">{clinic.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{clinic.address}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Feedback Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại vấn đề
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="incorrect_location">Vị trí trên bản đồ không chính xác</option>
                <option value="wrong_address">Địa chỉ sai</option>
                <option value="closed_permanently">Phòng khám đã đóng cửa</option>
                <option value="wrong_info">Thông tin khác không chính xác</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vui lòng mô tả vấn đề bạn gặp phải..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Correct Address (if location issue) */}
            {(feedbackType === 'incorrect_location' || feedbackType === 'wrong_address') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ chính xác (nếu biết)
                </label>
                <input
                  type="text"
                  value={correctAddress}
                  onChange={(e) => setCorrectAddress(e.target.value)}
                  placeholder="Nhập địa chỉ chính xác..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  'Gửi báo cáo'
                )}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                info
              </span>
              <div className="text-xs text-blue-800 dark:text-blue-300">
                Báo cáo của bạn sẽ được xem xét và cập nhật để cải thiện độ chính xác của dữ liệu. 
                Cảm ơn bạn đã đóng góp!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationFeedbackModal;
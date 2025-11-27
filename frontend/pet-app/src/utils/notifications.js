import Swal from 'sweetalert2';
import 'animate.css';

// Common styling configuration matching the system's interface
const commonConfig = {
  background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
  color: "#333",
  showClass: { 
    popup: 'animate__animated animate__zoomIn', 
    icon: 'animate__animated animate__bounceIn' 
  },
  hideClass: { 
    popup: 'animate__animated animate__fadeOutUp' 
  },
  customClass: {
    popup: 'shadow-lg rounded-xl border border-gray-200',
    confirmButton: 'px-6 py-2 rounded-lg font-semibold transition-all',
    cancelButton: 'px-6 py-2 rounded-lg font-semibold transition-all'
  },
  buttonsStyling: false
};

/**
 * Success notification (Toast - non-blocking)
 */
export const showSuccess = (title, message = '', timer = 3000) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    title: title,
    html: message ? `<div style="margin-top: 4px; font-size: 14px; color: #6B7280;">${message}</div>` : '',
    icon: "success",
    iconColor: "#10B981",
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    background: "#fff",
    color: "#333",
    customClass: {
      popup: 'shadow-lg rounded-lg border border-gray-200',
      title: 'font-semibold text-gray-800'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInRight'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutRight'
    }
  });
};

/**
 * Error notification (Toast - non-blocking, but longer duration)
 */
export const showError = (title, message = '', timer = 4000) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    title: title,
    html: message ? `<div style="margin-top: 4px; font-size: 14px; color: #6B7280;">${message}</div>` : '',
    icon: "error",
    iconColor: "#EF4444",
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    background: "#fff",
    color: "#333",
    customClass: {
      popup: 'shadow-lg rounded-lg border border-red-200',
      title: 'font-semibold text-gray-800'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInRight'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutRight'
    }
  });
};

/**
 * Warning notification (Toast - non-blocking)
 */
export const showWarning = (title, message = '', timer = 3500) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    title: title,
    html: message ? `<div style="margin-top: 4px; font-size: 14px; color: #6B7280;">${message}</div>` : '',
    icon: "warning",
    iconColor: "#F59E0B",
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    background: "#fff",
    color: "#333",
    customClass: {
      popup: 'shadow-lg rounded-lg border border-yellow-200',
      title: 'font-semibold text-gray-800'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInRight'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutRight'
    }
  });
};

/**
 * Info notification (Toast - non-blocking)
 */
export const showInfo = (title, message = '', timer = 3000) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    title: title,
    html: message ? `<div style="margin-top: 4px; font-size: 14px; color: #6B7280;">${message}</div>` : '',
    icon: "info",
    iconColor: "#3B82F6",
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    background: "#fff",
    color: "#333",
    customClass: {
      popup: 'shadow-lg rounded-lg border border-blue-200',
      title: 'font-semibold text-gray-800'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInRight'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutRight'
    }
  });
};

/**
 * Confirmation dialog
 */
export const showConfirm = (title, message = '', confirmText = "Xác nhận", cancelText = "Hủy") => {
  return Swal.fire({
    ...commonConfig,
    title: `<strong>${title}</strong>`,
    html: message ? `<p>${message}</p>` : '',
    icon: "question",
    iconColor: "#3B82F6",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#4CAF50",
    cancelButtonColor: "#6B7280",
    reverseButtons: true
  });
};

/**
 * Toast notification (non-blocking, auto-dismiss)
 * Simple version for quick messages
 */
export const showToast = (message, type = "info", duration = 3000) => {
  const colors = {
    success: { bg: "#10B981", icon: "success", border: "border-green-200" },
    error: { bg: "#EF4444", icon: "error", border: "border-red-200" },
    warning: { bg: "#F59E0B", icon: "warning", border: "border-yellow-200" },
    info: { bg: "#3B82F6", icon: "info", border: "border-blue-200" }
  };

  const config = colors[type] || colors.info;

  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true,
    icon: config.icon,
    iconColor: config.bg,
    title: message,
    background: "#fff",
    color: "#333",
    customClass: {
      popup: `shadow-lg rounded-lg border ${config.border}`,
      title: 'font-semibold text-gray-800'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInRight'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutRight'
    }
  });
};

/**
 * Loading notification
 */
export const showLoading = (title = "Đang xử lý...") => {
  return Swal.fire({
    ...commonConfig,
    title: title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Close any open notification
 */
export const closeNotification = () => {
  Swal.close();
};


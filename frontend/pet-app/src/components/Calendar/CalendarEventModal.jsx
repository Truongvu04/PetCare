import React from "react";

const CalendarEventModal = ({ date, eventsData, onClose }) => {
  const formatDate = (month, day) => {
    const dateObj = new Date(month.getFullYear(), month.getMonth(), day);
    return dateObj.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const { events = [], reminders = [] } = eventsData || {};

  const getReminderTypeLabel = (type) => {
    const labels = {
      vaccination: "Tiêm chủng",
      vet_visit: "Khám thú y",
      feeding: "Cho ăn",
      grooming: "Chải lông",
      medication: "Thuốc",
      other: "Khác",
    };
    return labels[type] || type;
  };

  const getReminderStatusBadge = (status) => {
    if (status === "done") {
      return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Đã hoàn thành</span>;
    }
    return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Chờ xử lý</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {formatDate(date.month, date.day)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Reminders Section */}
        {reminders.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Lời nhắc ({reminders.length})
            </h4>
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.reminder_id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {reminder.display_title || getReminderTypeLabel(reminder.type)}
                      </h5>
                      {reminder.pet && (
                        <p className="text-sm text-gray-600 mt-1">
                          Thú cưng: <span className="font-medium">{reminder.pet.name}</span>
                        </p>
                      )}
                    </div>
                    {getReminderStatusBadge(reminder.status)}
                  </div>
                  {reminder.vaccination_type && (
                    <p className="text-sm text-gray-700 mt-2">
                      Loại vaccine: <span className="font-medium">{reminder.vaccination_type}</span>
                    </p>
                  )}
                  {reminder.feeding_time && (
                    <p className="text-sm text-gray-700 mt-2">
                      Giờ cho ăn: <span className="font-medium">
                        {new Date(`2000-01-01T${reminder.feeding_time}`).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  )}
                  {reminder.frequency && reminder.frequency !== "none" && (
                    <p className="text-xs text-gray-500 mt-2">
                      Tần suất: {reminder.frequency === "daily" ? "Hàng ngày" : 
                                 reminder.frequency === "weekly" ? "Hàng tuần" :
                                 reminder.frequency === "monthly" ? "Hàng tháng" :
                                 reminder.frequency === "yearly" ? "Hàng năm" : reminder.frequency}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Section */}
        {events.length > 0 && (
          <div className={reminders.length > 0 ? "border-t pt-6" : ""}>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Sự kiện ({events.length})
            </h4>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h5 className="font-medium text-gray-900">{event.title}</h5>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                  {event.pet && (
                    <p className="text-xs text-gray-500 mt-2">
                      Thú cưng: {event.pet.name}
                    </p>
                  )}
                  {event.expense && (
                    <p className="text-xs text-gray-500 mt-1">
                      Chi phí: {parseFloat(event.expense.amount).toLocaleString("vi-VN")} VND
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {events.length === 0 && reminders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có lời nhắc hoặc sự kiện nào trong ngày này</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default CalendarEventModal;


import React from "react";
import { X } from "lucide-react";

const CalendarEventModal = ({ isOpen, onClose, events, date }) => {
  if (!isOpen) return null;

  const categoryLabels = {
    food: "Thức ăn",
    medicine: "Thuốc",
    accessories: "Phụ kiện",
    vet_visit: "Khám thú y",
    grooming: "Chải chuốt",
    other: "Khác",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Sự kiện ngày {new Date(date).toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không có sự kiện nào</p>
            <p className="text-gray-400 text-sm mt-2">Chọn ngày khác để xem sự kiện</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-base">{event.title}</h3>
                      {event.status && (
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            event.status === "done"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {event.status === "done" ? "Hoàn thành" : "Chưa hoàn thành"}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {event.pet && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          🐾 {event.pet.name} ({event.pet.species})
                        </span>
                      )}
                      {event.expense && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          💰 {categoryLabels[event.expense.category] || event.expense.category}:{" "}
                          {parseFloat(event.expense.amount).toLocaleString("vi-VN")} VND
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEventModal;


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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            Sự kiện ngày {new Date(date).toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Không có sự kiện nào</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    {event.pet && (
                      <p className="text-xs text-gray-500 mt-1">
                        Thú cưng: {event.pet.name} ({event.pet.species})
                      </p>
                    )}
                    {event.expense && (
                      <div className="mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {categoryLabels[event.expense.category] || event.expense.category}:{" "}
                          {parseFloat(event.expense.amount).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                    )}
                    {event.status && (
                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            event.status === "done"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {event.status === "done" ? "Đã hoàn thành" : "Chưa hoàn thành"}
                        </span>
                      </div>
                    )}
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


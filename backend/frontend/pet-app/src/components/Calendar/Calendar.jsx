import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { calendarApi } from "../../api/calendarApi.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import CalendarEventModal from "./CalendarEventModal.jsx";
import { showError } from "../../utils/notifications.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [upcomingExpenses, setUpcomingExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper functions for date handling (to avoid timezone issues)
  const createDateString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const normalizeDateToString = (date) => {
    if (date instanceof Date) {
      return createDateString(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      );
    }
    if (typeof date === "string") {
      return date.split("T")[0];
    }
    return date;
  };

  useEffect(() => {
    if (user) {
      loadEvents();
      loadUpcomingExpenses();
    }
  }, [user, currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Get events for current month and next month
      const startDate = createDateString(year, month, 1);
      const nextMonth = new Date(year, month + 1, 1);
      const endDate = createDateString(
        nextMonth.getFullYear(),
        nextMonth.getMonth() + 1,
        0
      );

      const response = await calendarApi.getCalendarEvents(startDate, endDate);
      setEvents(response.events || []);
    } catch (error) {
      console.error("Error loading events:", error);
      showError("Lỗi", "Không thể tải sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingExpenses = async () => {
    try {
      const response = await calendarApi.getUpcomingExpenses();
      setUpcomingExpenses(response.upcoming_expenses || []);
    } catch (error) {
      console.error("Error loading upcoming expenses:", error);
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = normalizeDateToString(date);
    return events.filter((event) => {
      const eventDateStr = normalizeDateToString(event.event_date);
      return eventDateStr === dateStr;
    });
  };

  const handleDateClick = (date) => {
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length > 0) {
      setSelectedDate(date);
      setSelectedEvents(dateEvents);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    // Add weekday headers
    days.push(
      <div key="headers" className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
    );

    // Add empty cells for days before month starts
    const emptyCells = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      emptyCells.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Add day cells
    const dayCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateEvents = getEventsForDate(date);
      const hasEvents = dateEvents.length > 0;
      const isToday =
        normalizeDateToString(date) === normalizeDateToString(new Date());

      dayCells.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`aspect-square flex flex-col items-center justify-center border border-gray-200 rounded-lg cursor-pointer transition ${
            hasEvents
              ? "bg-green-50 border-green-300 hover:bg-green-100"
              : "hover:bg-gray-50"
          } ${isToday ? "ring-2 ring-green-500" : ""}`}
        >
          <span
            className={`text-sm font-medium ${
              isToday ? "text-green-600" : "text-gray-700"
            }`}
          >
            {day}
          </span>
          {hasEvents && (
            <span className="text-xs text-green-600 mt-1">
              {dateEvents.length} sự kiện
            </span>
          )}
        </div>
      );
    }

    days.push(
      <div key="calendar" className="grid grid-cols-7 gap-1">
        {emptyCells}
        {dayCells}
      </div>
    );

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);
  const nextYear = nextMonth.getFullYear();
  const nextMonthIndex = nextMonth.getMonth();

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const categoryLabels = {
    food: "Thức ăn",
    medicine: "Thuốc",
    accessories: "Phụ kiện",
    vet_visit: "Khám thú y",
    grooming: "Chải chuốt",
    other: "Khác",
  };

  return (
    <CustomerLayout currentPage="calendar">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lịch</h1>
          <p className="text-gray-600">Xem lịch sự kiện và lời nhắc</p>
        </div>

        {/* Calendar View - 2 months side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Month */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            {renderCalendar(currentYear, currentMonth)}
          </div>

          {/* Next Month */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <h2 className="text-lg font-semibold">
                {monthNames[nextMonthIndex]} {nextYear}
              </h2>
              <div></div>
            </div>
            {renderCalendar(nextYear, nextMonthIndex)}
          </div>
        </div>

        {/* Upcoming Expenses Section */}
        {upcomingExpenses.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Chi phí sắp tới</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thú cưng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Danh mục
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mô tả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {upcomingExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 text-sm">
                        {new Date(expense.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {expense.pet?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {categoryLabels[expense.category] || expense.category}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-700">
                        {parseFloat(expense.amount).toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Event Modal */}
        <CalendarEventModal
          isOpen={selectedDate !== null}
          onClose={() => {
            setSelectedDate(null);
            setSelectedEvents([]);
          }}
          events={selectedEvents}
          date={selectedDate}
        />
      </div>
    </CustomerLayout>
  );
};

export default Calendar;


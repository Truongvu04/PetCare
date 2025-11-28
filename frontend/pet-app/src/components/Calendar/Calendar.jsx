import React, { useState, useEffect } from "react";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { calendarApi } from "../../api/calendarApi.js";
import { reminderApi } from "../../api/reminderApi.js";
import CalendarEventModal from "./CalendarEventModal.jsx";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [upcomingExpenses, setUpcomingExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCalendarData();
    loadReminders();
    loadUpcomingExpenses();
  }, [currentMonth]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);
      const data = await calendarApi.getCalendarEvents(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );
      setEvents(data);
    } catch (err) {
      console.error("Error loading calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const data = await reminderApi.getReminders();
      setReminders(data || []);
    } catch (err) {
      console.error("Error loading reminders:", err);
    }
  };

  const loadUpcomingExpenses = async () => {
    try {
      const data = await calendarApi.getUpcomingExpenses();
      setUpcomingExpenses(data);
    } catch (err) {
      console.error("Error loading upcoming expenses:", err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Helper function to normalize date to YYYY-MM-DD format (handles timezone issues)
  const normalizeDateToString = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Use UTC to avoid timezone issues
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to create date string from year, month, day
  const createDateString = (year, month, day) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const getEventsForDate = (date, month) => {
    if (!date) return { events: [], reminders: [] };
    // Create date string directly from year, month, day to avoid timezone issues
    const dateStr = createDateString(month.getFullYear(), month.getMonth(), date);
    
    const dayEvents = events.filter((event) => {
      if (!event.event_date) return false;
      const eventDateStr = normalizeDateToString(event.event_date);
      return eventDateStr === dateStr;
    });

    const dayReminders = reminders.filter((reminder) => {
      if (!reminder.reminder_date) return false;
      const reminderDateStr = normalizeDateToString(reminder.reminder_date);
      return reminderDateStr === dateStr;
    });

    return { events: dayEvents, reminders: dayReminders };
  };

  const hasEventsOrReminders = (date, month) => {
    const { events: dayEvents, reminders: dayReminders } = getEventsForDate(date, month);
    return dayEvents.length > 0 || dayReminders.length > 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const month1 = currentMonth;
  const month2 = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  const days1 = getDaysInMonth(month1);
  const days2 = getDaysInMonth(month2);

  return (
    <CustomerLayout currentPage="calendar">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Calendar</h2>
      <p className="text-green-600 mb-6">Manage your pet's expenses and schedules</p>

      {/* Calendar View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Month 1 */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={prevMonth} className="text-gray-600 hover:text-gray-900">
              &lt;
            </button>
            <h3 className="text-lg font-semibold">
              {monthNames[month1.getMonth()]} {month1.getFullYear()}
            </h3>
            <div className="w-6"></div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days1.map((day, idx) => {
              const hasEvents = hasEventsOrReminders(day, month1);
              return (
                <button
                  key={idx}
                  onClick={() => day && setSelectedDate({ month: month1, day })}
                  className={`p-2 text-sm rounded relative ${
                    day
                      ? hasEvents
                        ? "bg-green-100 text-green-800 hover:bg-green-200 font-medium"
                        : "hover:bg-gray-100"
                      : ""
                  }`}
                >
                  {day}
                  {hasEvents && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Month 2 */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="w-6"></div>
            <h3 className="text-lg font-semibold">
              {monthNames[month2.getMonth()]} {month2.getFullYear()}
            </h3>
            <button onClick={nextMonth} className="text-gray-600 hover:text-gray-900">
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days2.map((day, idx) => {
              const hasEvents = hasEventsOrReminders(day, month2);
              return (
                <button
                  key={idx}
                  onClick={() => day && setSelectedDate({ month: month2, day })}
                  className={`p-2 text-sm rounded relative ${
                    day
                      ? hasEvents
                        ? "bg-green-100 text-green-800 hover:bg-green-200 font-medium"
                        : "hover:bg-gray-100"
                      : ""
                  }`}
                >
                  {day}
                  {hasEvents && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Expenses */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Expenses</h3>
        {upcomingExpenses.length === 0 ? (
          <p className="text-gray-500">Không có chi phí sắp tới</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Category</th>
                  <th className="p-3 border-b">Description</th>
                  <th className="p-3 border-b">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {upcomingExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-green-50">
                    <td className="p-3 border-b">{formatDate(expense.expense_date)}</td>
                    <td className="p-3 border-b">{expense.category}</td>
                    <td className="p-3 border-b">{expense.description}</td>
                    <td className="p-3 border-b">
                      {expense.amount ? `${parseFloat(expense.amount).toLocaleString("vi-VN")} VND` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDate && (
        <CalendarEventModal
          date={selectedDate}
          eventsData={getEventsForDate(selectedDate.day, selectedDate.month)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </CustomerLayout>
  );
};

export default Calendar;


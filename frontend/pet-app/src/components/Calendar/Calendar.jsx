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
      const nextMonth = new Date(year, month + 2, 0); // Last day of next month
      const endDate = createDateString(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        nextMonth.getDate()
      );

      const response = await calendarApi.getCalendarEvents(startDate, endDate);
      setEvents(response.events || []);
    } catch (error) {
      console.error("Error loading events:", error);
      showError("Error", "Unable to load events");
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
    setSelectedDate(date);
    setSelectedEvents(dateEvents);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
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

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Add empty cells for days before month starts
    const emptyCells = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      emptyCells.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Add day cells
    const dayCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date at noon to avoid timezone issues
      const date = new Date(year, month, day, 12, 0, 0);
      const dateEvents = getEventsForDate(date);
      const hasEvents = dateEvents.length > 0;
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const isToday =
        normalizeDateToString(date) === normalizeDateToString(today);
      const isSelected = selectedDate && 
        normalizeDateToString(date) === normalizeDateToString(selectedDate);

      dayCells.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-14 flex flex-col items-center justify-center border border-gray-200 rounded-md cursor-pointer transition-all ${
            hasEvents
              ? "bg-green-50 border-green-300 hover:bg-green-100 hover:shadow-sm"
              : "hover:bg-gray-50"
          } ${isToday ? "ring-2 ring-green-500" : ""} ${
            isSelected ? "bg-green-100 border-green-500 shadow-sm" : ""
          }`}
        >
          <span
            className={`text-sm font-medium ${
              isToday ? "text-green-600 font-bold" : isSelected ? "text-green-700 font-semibold" : "text-gray-700"
            }`}
          >
            {day}
          </span>
          {hasEvents && (
            <div className="flex items-center justify-center mt-0.5 space-x-0.5">
              {dateEvents.slice(0, 3).map((_, idx) => (
                <div
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-green-500"
                />
              ))}
              {dateEvents.length > 3 && (
                <span className="text-[10px] text-green-600 font-medium ml-0.5">
                  +{dateEvents.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyCells}
          {dayCells}
        </div>
      </div>
    );
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const categoryLabels = {
    food: "Food",
    medicine: "Medicine",
    accessories: "Accessories",
    vet_visit: "Vet Visit",
    grooming: "Grooming",
    other: "Other",
  };

  return (
    <CustomerLayout currentPage="calendar">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Calendar</h1>
          <p className="text-gray-600">Manage schedule and upcoming expenses</p>
        </div>

        {/* Calendar View - 2 months side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Month */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
            {renderCalendar(currentYear, currentMonth)}
          </div>

          {/* Next Month */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                {monthNames[nextMonthIndex]} {nextYear}
              </h2>
              <div className="w-10"></div>
            </div>
            {renderCalendar(nextYear, nextMonthIndex)}
          </div>
        </div>

        {/* Upcoming Expenses Section - Table Format */}
        {upcomingExpenses.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Expenses</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {categoryLabels[expense.category] || expense.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700">
                        {parseFloat(expense.amount).toLocaleString("en-US")} VND
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


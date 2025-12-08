import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { showToast } from "../../utils/notifications";

const ToggleSwitch = ({ enabled, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
        enabled ? "bg-green-600" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    appointment_reminders: true,
    community_events: true,
    platform_updates: true,
    new_products_services: true,
    urgent_care_alerts: true,
    account_activity_alerts: true,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/notification-settings");
        setPreferences(res.data);
      } catch (err) {
        console.error("Error fetching notification preferences:", err);
        showToast("Unable to load notification settings", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!user) {
      showToast("Please login", "error");
      return;
    }

    try {
      setSaving(true);
      await api.put("/notification-settings", preferences);
      showToast("Notification settings saved successfully", "success");
    } catch (err) {
      console.error("Error saving notification preferences:", err);
      showToast("Unable to save notification settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const notificationSections = [
    {
      title: "Reminders",
      items: [
        {
          key: "appointment_reminders",
          label: "Appointment & Medication Reminders",
          description:
            "Receive reminders for upcoming appointments, medication schedules, and other important pet care tasks.",
        },
        {
          key: "community_events",
          label: "Community Events & Offers",
          description:
            "Get notified about upcoming events, community meetups, and special offers related to pet care.",
        },
      ],
    },
    {
      title: "Updates",
      items: [
        {
          key: "platform_updates",
          label: "Platform Updates",
          description:
            "Stay updated on new features, improvements, and changes to the PetCare+ platform.",
        },
        {
          key: "new_products_services",
          label: "New Products & Services",
          description:
            "Receive notifications about new products, services, and vendor offerings available on PetCare+.",
        },
      ],
    },
    {
      title: "Alerts",
      items: [
        {
          key: "urgent_care_alerts",
          label: "Urgent Care Alerts",
          description:
            "Get immediate alerts for urgent pet care needs, such as appointment cancellations or changes.",
        },
        {
          key: "account_activity_alerts",
          label: "Account Activity Alerts",
          description:
            "Receive notifications about changes to your account, including security alerts and updates to your profile.",
        },
      ],
    },
  ];

  if (loading) {
    return (
      <CustomerLayout currentPage="settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading notification settings...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="settings">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Notification Settings
        </h1>
        <p className="text-sm text-green-700 mb-8">
          Manage your notification preferences to stay informed about your
          pet's care and platform updates.
        </p>

        <div className="space-y-8">
          {notificationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 px-6 pt-6 pb-4">
                {section.title}
              </h2>
              <div className="divide-y divide-gray-200">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="px-6 py-5 flex items-start justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch
                        enabled={preferences[item.key]}
                        onChange={() => handleToggle(item.key)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default NotificationSettings;


import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { healthApi } from "../../api/healthApi.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import WeightForm from "./WeightForm.jsx";
import VaccinationForm from "./VaccinationForm.jsx";
import HealthNoteForm from "./HealthNoteForm.jsx";
import { showError } from "../../utils/notifications.js";

const HealthTracking = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [weightRecords, setWeightRecords] = useState([]);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [healthNotes, setHealthNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await api.get("/pets");
        setPets(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedPetId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error loading pets:", error);
      }
    };
    if (user) {
      loadPets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPetId) {
      loadData();
    }
  }, [selectedPetId, activeTab]);

  const loadData = async () => {
    if (!selectedPetId) return;
    setLoading(true);
    try {
      if (activeTab === "overview" || activeTab === "weight") {
        const response = await healthApi.getWeightHistory(selectedPetId);
        setWeightRecords(response.records || []);
      }
      if (activeTab === "overview" || activeTab === "vaccination") {
        const response = await healthApi.getVaccinationHistory(selectedPetId);
        setVaccinationRecords(response.records || []);
      }
      if (activeTab === "health_note") {
        const response = await healthApi.getHealthRecords(selectedPetId, "health_note");
        setHealthNotes(response.records || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadData();
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const currentWeight = weightRecords.length > 0 
    ? weightRecords[weightRecords.length - 1] 
    : null;

  return (
    <CustomerLayout currentPage="health">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Health & Activity</h1>
          <p className="text-gray-600">Theo dõi sức khỏe và hoạt động của thú cưng</p>
        </div>

        {/* Pet Selector */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn thú cưng
          </label>
          <select
            value={selectedPetId || ""}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>

        {selectedPetId && (
          <>
            {/* Current Weight Display */}
            {currentWeight && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Cân nặng hiện tại</p>
                <p className="text-2xl font-bold text-green-700">
                  {(parseFloat(currentWeight.value) * 0.453592).toFixed(2)} kg
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "weight", label: "Weight" },
                  { id: "vaccination", label: "Medical History" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Forms */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {currentWeight && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Weight</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Current Weight</p>
                      <p className="text-3xl font-bold text-green-700">
                        {(parseFloat(currentWeight.value) * 0.453592).toFixed(1)} kg
                      </p>
                      {weightRecords.length > 1 && (
                        <p className="text-sm text-green-600 mt-2">
                          Last 6 Months {weightRecords.length > 0 ? "+5%" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Diet</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Food Type</p>
                      <p className="text-base font-medium text-gray-800">Dry Kibble</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Daily Calories</p>
                      <p className="text-base font-medium text-gray-800">350 kcal</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Feeding Schedule</p>
                      <p className="text-base font-medium text-gray-800">8 AM, 6 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "weight" && (
              <WeightForm petId={selectedPetId} onSuccess={handleSuccess} />
            )}
            {activeTab === "vaccination" && (
              <VaccinationForm petId={selectedPetId} onSuccess={handleSuccess} />
            )}

            {/* Records List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {activeTab === "overview" && "Overview"}
                  {activeTab === "weight" && "Weight"}
                  {activeTab === "vaccination" && "Medical History"}
                </h3>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Đang tải...</div>
                ) : (
                  <table className="w-full">
                    {activeTab === "overview" && (
                      <>
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Vaccination
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {vaccinationRecords.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                Chưa có lịch sử tiêm chủng
                              </td>
                            </tr>
                          ) : (
                            vaccinationRecords.map((record) => (
                              <tr key={record.id}>
                                <td className="px-4 py-3 text-sm">
                                  {new Date(record.record_date).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">{record.vaccination_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">Annual vaccination</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </>
                    )}
                    {activeTab === "weight" && (
                      <>
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Ngày
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Cân nặng (kg)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {weightRecords.length === 0 ? (
                            <tr>
                              <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                                Chưa có dữ liệu cân nặng
                              </td>
                            </tr>
                          ) : (
                            weightRecords.map((record) => (
                              <tr key={record.id}>
                                <td className="px-4 py-3 text-sm">
                                  {new Date(record.record_date).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">
                                  {(parseFloat(record.value) * 0.453592).toFixed(2)} kg
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </>
                    )}
                    {activeTab === "vaccination" && (
                      <>
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Vaccination
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {vaccinationRecords.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                Chưa có lịch sử tiêm chủng
                              </td>
                            </tr>
                          ) : (
                            vaccinationRecords.map((record) => (
                              <tr key={record.id}>
                                <td className="px-4 py-3 text-sm">
                                  {new Date(record.record_date).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">{record.vaccination_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">Annual vaccination</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </>
                    )}
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default HealthTracking;


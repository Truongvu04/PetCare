import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { healthApi } from "../../api/healthApi.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import WeightForm from "./WeightForm.jsx";
import VaccinationForm from "./VaccinationForm.jsx";
import HealthNoteForm from "./HealthNoteForm.jsx";
import { showError } from "../../utils/notifications.js";
import { MapPin } from "lucide-react";

const HealthTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [weightRecords, setWeightRecords] = useState([]);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [healthNotes, setHealthNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOpenMap = () => {
    navigate('/vet-map');
  };

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
      showError("Error", "Unable to load data");
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
          <p className="text-gray-600">Track your pet's health and activity</p>
        </div>

        {/* Pet Selector */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pet
          </label>
          {pets.length === 0 ? (
            <div className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed">
              No pets found. Please add a pet first.
            </div>
          ) : (
            <select
              value={selectedPetId || ""}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select Pet --</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Current Weight Display */}
        {selectedPetId && currentWeight && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Current Weight</p>
            <p className="text-2xl font-bold text-green-700">
              {(parseFloat(currentWeight.value) * 0.453592).toFixed(2)} kg
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
            <div className="flex flex-wrap gap-4">
              {[
                { id: "overview", label: "Overview" },
                { id: "weight", label: "Weight" },
                { id: "vaccination", label: "Medical History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!selectedPetId || pets.length === 0}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } ${
                    !selectedPetId || pets.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleOpenMap}
              className="flex items-center text-green-600 hover:text-green-700 space-x-1 px-4 py-2 text-sm font-medium border-b-2 border-transparent transition-colors whitespace-nowrap"
            >
              <MapPin className="w-5 h-5"/>
              <span>Clinic Map</span>
            </button>
          </nav>
        </div>

        {/* Forms */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {selectedPetId && currentWeight ? (
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
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200 opacity-50">
                <h3 className="text-lg font-semibold mb-4">Weight</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Please select a pet to view weight information</p>
                </div>
              </div>
            )}
            <div className={`bg-white p-6 rounded-lg border border-gray-200 ${!selectedPetId || pets.length === 0 ? 'opacity-50' : ''}`}>
              <h3 className="text-lg font-semibold mb-4">Diet</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Food Type</p>
                  <p className={`text-base font-medium ${selectedPetId ? 'text-gray-800' : 'text-gray-400'}`}>
                    {selectedPetId ? 'Dry Kibble' : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Daily Calories</p>
                  <p className={`text-base font-medium ${selectedPetId ? 'text-gray-800' : 'text-gray-400'}`}>
                    {selectedPetId ? '350 kcal' : '--'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Feeding Schedule</p>
                  <p className={`text-base font-medium ${selectedPetId ? 'text-gray-800' : 'text-gray-400'}`}>
                    {selectedPetId ? '8 AM, 6 PM' : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "weight" && (
          <div className={!selectedPetId || pets.length === 0 ? 'opacity-50 pointer-events-none' : ''}>
            {selectedPetId ? (
              <WeightForm petId={selectedPetId} onSuccess={handleSuccess} />
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-center">Please select a pet to add weight information</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "vaccination" && (
          <div className={!selectedPetId || pets.length === 0 ? 'opacity-50 pointer-events-none' : ''}>
            {selectedPetId ? (
              <VaccinationForm petId={selectedPetId} onSuccess={handleSuccess} />
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-center">Please select a pet to add vaccination information</p>
              </div>
            )}
          </div>
        )}

        {/* Records List */}
        <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${!selectedPetId || pets.length === 0 ? 'opacity-50' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {activeTab === "overview" && "Overview"}
              {activeTab === "weight" && "Weight"}
              {activeTab === "vaccination" && "Medical History"}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {!selectedPetId || pets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {pets.length === 0 
                  ? "No pets found. Please add a pet first."
                  : "Please select a pet to view data"}
              </div>
            ) : loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
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
                            No vaccination history
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
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Weight (kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {weightRecords.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                            No weight data available
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
                            No vaccination history
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
      </div>
    </CustomerLayout>
  );
};

export default HealthTracking;


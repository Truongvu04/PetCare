import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { healthApi } from "../../api/healthApi.js";
import api from "../../api/axiosConfig.js";
import WeightForm from "./WeightForm.jsx";
import VaccinationForm from "./VaccinationForm.jsx";
import HealthNoteForm from "./HealthNoteForm.jsx";
import { MapPin } from "lucide-react";

const HealthTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Weight");
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [healthNotes, setHealthNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      loadHealthData();
    }
  }, [selectedPetId, activeTab]);

  const loadPets = async () => {
    try {
      const res = await api.get("/pets");
      const data = res.data;
      if (Array.isArray(data)) {
        setPets(data);
        if (data.length > 0) {
          setSelectedPetId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading pets:", err);
    }
  };

  const loadHealthData = async () => {
    if (!selectedPetId) return;
    setLoading(true);
    try {
      if (activeTab === "Weight") {
        const data = await healthApi.getWeightHistory(selectedPetId);
        setWeightHistory(data);
      } else if (activeTab === "Vaccination") {
        const data = await healthApi.getVaccinationHistory(selectedPetId);
        setVaccinationHistory(data);
      } else if (activeTab === "Health Notes") {
        const data = await healthApi.getHealthRecords(selectedPetId, "health_note");
        setHealthNotes(data);
      }
    } catch (err) {
      console.error("Error loading health data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadHealthData();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;

  return (
    <CustomerLayout currentPage="health">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
        Health & Activity
      </h2>

      {/* Pet Selector */}
      {pets.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn thú cưng
          </label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-between items-center border-b mb-6">
        <div className="flex space-x-8">
          {["Weight", "Vaccination", "Health Notes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium ${
                activeTab === tab
                  ? "text-green-700 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/vet-map")}
          className="flex items-center text-green-600 hover:text-green-500 space-x-1 pb-2 font-medium border-b-2 border-transparent"
        >
          <MapPin className="w-5 h-5" />
          <span>Clinic Map</span>
        </button>
      </div>

      {!selectedPetId && pets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Bạn chưa có thú cưng nào. Hãy thêm thú cưng trước.</p>
        </div>
      ) : (
        <>
          {/* Weight Tab */}
          {activeTab === "Weight" && (
            <section className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-5">
                  <h4 className="font-medium mb-4">Thêm cân nặng mới</h4>
                  <WeightForm petId={selectedPetId} onSuccess={handleSuccess} />
                </div>
                <div className="border rounded-lg p-5">
                  {currentWeight ? (
                    <>
                      <p className="text-3xl font-bold text-gray-900">
                        {(parseFloat(currentWeight.value) * 0.453592).toFixed(2)} kg
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        Cập nhật lần cuối: {formatDate(currentWeight.record_date)}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">Chưa có dữ liệu cân nặng</p>
                  )}
                </div>
              </div>
              <div className="mt-6 border rounded-lg overflow-hidden">
                <h4 className="font-medium p-4 border-b bg-gray-50">Lịch sử cân nặng</h4>
                {loading ? (
                  <p className="p-4 text-gray-500">Đang tải...</p>
                ) : weightHistory.length === 0 ? (
                  <p className="p-4 text-gray-500">Chưa có lịch sử cân nặng</p>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                      <tr>
                        <th className="p-3 border-b">Ngày</th>
                        <th className="p-3 border-b">Cân nặng (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {weightHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-green-50">
                          <td className="p-3 border-b">{formatDate(record.record_date)}</td>
                          <td className="p-3 border-b">{(parseFloat(record.value) * 0.453592).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* Vaccination Tab */}
          {activeTab === "Vaccination" && (
            <section className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Vaccination</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-5">
                  <h4 className="font-medium mb-4">Thêm tiêm chủng mới</h4>
                  <VaccinationForm petId={selectedPetId} onSuccess={handleSuccess} />
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <h4 className="font-medium p-4 border-b bg-gray-50">Lịch sử tiêm chủng</h4>
                {loading ? (
                  <p className="p-4 text-gray-500">Đang tải...</p>
                ) : vaccinationHistory.length === 0 ? (
                  <p className="p-4 text-gray-500">Chưa có lịch sử tiêm chủng</p>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                      <tr>
                        <th className="p-3 border-b">Ngày</th>
                        <th className="p-3 border-b">Vaccine</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {vaccinationHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-green-50">
                          <td className="p-3 border-b text-green-700">
                            {formatDate(record.record_date)}
                          </td>
                          <td className="p-3 border-b">{record.vaccination_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* Health Notes Tab */}
          {activeTab === "Health Notes" && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-5">
                  <h4 className="font-medium mb-4">Thêm ghi chú sức khỏe</h4>
                  <HealthNoteForm petId={selectedPetId} onSuccess={handleSuccess} />
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <h4 className="font-medium p-4 border-b bg-gray-50">Ghi chú sức khỏe</h4>
                {loading ? (
                  <p className="p-4 text-gray-500">Đang tải...</p>
                ) : healthNotes.length === 0 ? (
                  <p className="p-4 text-gray-500">Chưa có ghi chú sức khỏe</p>
                ) : (
                  <div className="divide-y">
                    {healthNotes.map((note) => (
                      <div key={note.id} className="p-4 hover:bg-green-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-green-700 font-medium">
                            {formatDate(note.record_date)}
                          </span>
                        </div>
                        <p className="text-gray-800">{note.health_note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </CustomerLayout>
  );
};

export default HealthTracking;


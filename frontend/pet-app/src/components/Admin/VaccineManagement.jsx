import React, { useState, useEffect } from 'react';
import { Syringe, Plus, Edit, Trash2, Loader2, X, Save, AlertCircle } from 'lucide-react';
import { vaccineApi } from '../../api/vaccineApi';
import { showError, showSuccess, showConfirm } from '../../utils/notifications';

const VaccineManagement = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    description: '',
    is_active: true,
    dose_schedules: [],
  });
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccineApi.getAllVaccines();
      setVaccines(data || []);
    } catch (err) {
      console.error("Error fetching vaccines:", err);
      showError("Error", "Failed to load vaccine list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDose = () => {
    const newDose = {
      dose_number: formData.dose_schedules.length + 1,
      days_after_previous: 0,
      is_booster: false,
      notes: '',
    };
    setFormData({
      ...formData,
      dose_schedules: [...formData.dose_schedules, newDose],
    });
  };

  const handleRemoveDose = (index) => {
    const updatedDoses = formData.dose_schedules.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      dose_schedules: updatedDoses.map((dose, i) => ({
        ...dose,
        dose_number: i + 1,
      })),
    });
  };

  const handleDoseChange = (index, field, value) => {
    const updatedDoses = [...formData.dose_schedules];
    updatedDoses[index] = {
      ...updatedDoses[index],
      [field]: field === 'dose_number' || field === 'days_after_previous' ? parseInt(value) || 0 : 
               field === 'is_booster' ? value === 'true' || value === true : value,
    };
    setFormData({
      ...formData,
      dose_schedules: updatedDoses,
    });
  };

  const handleEdit = (vaccine) => {
    setEditingVaccine(vaccine);
    setFormData({
      name: vaccine.name,
      species: vaccine.species,
      description: vaccine.description || '',
      is_active: vaccine.is_active,
      dose_schedules: vaccine.dose_schedules || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (vaccineId) => {
    const result = await showConfirm(
      'Delete Vaccine?',
      'Are you sure you want to delete this vaccine?',
      'Delete',
      'Cancel'
    );

    if (!result.isConfirmed) return;

    try {
      setProcessing(vaccineId);
      await vaccineApi.deleteVaccine(vaccineId);
      showSuccess("Success", "Vaccine deleted successfully");
      fetchVaccines();
    } catch (err) {
      console.error("Error deleting vaccine:", err);
      showError("Error", err.response?.data?.error || "Failed to delete vaccine");
    } finally {
      setProcessing(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.species) {
      showError("Error", "Please fill in all required fields");
      return;
    }

    if (formData.dose_schedules.length === 0) {
      showError("Error", "Please add at least one dose schedule");
      return;
    }

    try {
      setProcessing(editingVaccine ? editingVaccine.vaccine_id : 'new');
      
      if (editingVaccine) {
        await vaccineApi.updateVaccine(editingVaccine.vaccine_id, formData);
        showSuccess("Success", "Vaccine updated successfully");
      } else {
        await vaccineApi.createVaccine(formData);
        showSuccess("Success", "Vaccine added successfully");
      }
      
      setShowForm(false);
      setEditingVaccine(null);
      setFormData({
        name: '',
        species: 'dog',
        description: '',
        is_active: true,
        dose_schedules: [],
      });
      fetchVaccines();
    } catch (err) {
      console.error("Error saving vaccine:", err);
      showError("Error", err.response?.data?.error || "Failed to save vaccine");
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVaccine(null);
    setFormData({
      name: '',
      species: 'dog',
      description: '',
      is_active: true,
      dose_schedules: [],
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Syringe className="text-blue-600" /> Vaccine Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage vaccine list for pets</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} /> Add Vaccine
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Species *
                </label>
                <select
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dose Schedule *
                </label>
                <button
                  type="button"
                  onClick={handleAddDose}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Add Dose
                </button>
              </div>

              {formData.dose_schedules.length === 0 ? (
                <div className="text-sm text-gray-500 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  No doses yet. Please add at least one dose.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.dose_schedules.map((dose, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Dose {dose.dose_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDose(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Days After Previous Dose</label>
                          <input
                            type="number"
                            value={dose.days_after_previous}
                            onChange={(e) => handleDoseChange(index, 'days_after_previous', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Type</label>
                          <select
                            value={dose.is_booster ? 'true' : 'false'}
                            onChange={(e) => handleDoseChange(index, 'is_booster', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="false">Regular Dose</option>
                            <option value="true">Booster Dose</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Notes</label>
                          <input
                            type="text"
                            value={dose.notes || ''}
                            onChange={(e) => handleDoseChange(index, 'notes', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., Initial dose"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editingVaccine ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaccine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Species
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vaccines.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No vaccines found</p>
                  </td>
                </tr>
              ) : (
                vaccines.map((vaccine) => (
                  <tr key={vaccine.vaccine_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vaccine.name}</div>
                      {vaccine.description && (
                        <div className="text-xs text-gray-500 mt-1">{vaccine.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {vaccine.species === 'dog' ? 'Dog' : 'Cat'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaccine.dose_schedules?.length || 0} dose{vaccine.dose_schedules?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vaccine.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {vaccine.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(vaccine)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(vaccine.vaccine_id)}
                          disabled={processing === vaccine.vaccine_id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete"
                        >
                          {processing === vaccine.vaccine_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VaccineManagement;


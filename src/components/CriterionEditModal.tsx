import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface CriterionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCriteria: Record<string, number>) => void;
  categoryName: string;
  categoryIcon: React.ReactNode;
  criteria: Record<string, number>;
  criteriaLabels: Record<string, { label: string; description: string }>;
}

const CriterionEditModal: React.FC<CriterionEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryName,
  categoryIcon,
  criteria,
  criteriaLabels,
}) => {
  const [editedCriteria, setEditedCriteria] = useState<Record<string, number>>(criteria);

  useEffect(() => {
    setEditedCriteria(criteria);
  }, [criteria, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedCriteria({ ...editedCriteria, [key]: numValue });
  };

  const calculateTotal = () => {
    return Object.values(editedCriteria).reduce((sum, val) => sum + val, 0);
  };

  const handleSave = () => {
    onSave(editedCriteria);
    onClose();
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                {categoryIcon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{categoryName}</h2>
                <p className="text-indigo-100 text-sm mt-1">Editar pontos individuais</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Total Display */}
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total desta seção:</span>
              <span className="text-3xl font-bold">{total.toFixed(1)} pts</span>
            </div>
          </div>
        </div>

        {/* Criteria Fields */}
        <div className="p-6 space-y-4">
          {Object.entries(criteriaLabels).map(([key, { label, description }]) => (
            <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <label className="block font-semibold text-gray-800 mb-1">
                    {label}
                  </label>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editedCriteria[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-24 px-3 py-2 border-2 border-indigo-300 rounded-lg text-center font-bold text-gray-700 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-gray-700 font-semibold">pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-600">
            💡 Ajuste os pontos de cada critério individualmente
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriterionEditModal;

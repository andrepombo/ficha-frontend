import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Position {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

function Positions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/positions/', { headers });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setPositions(data);
        } else {
          // Initialize defaults if empty
          await fetch('/api/positions/initialize_defaults/', { method: 'POST' });
          const retryResponse = await fetch('/api/positions/', { headers });
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setPositions(retryData);
          }
        }
      } else {
        // Initialize defaults if error
        await fetch('/api/positions/initialize_defaults/', { method: 'POST' });
        const retryResponse = await fetch('/api/positions/', { headers });
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          setPositions(retryData);
        }
      }
    } catch (error) {
      console.error('Error loading positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePositions = async (newPositions: Position[]) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/positions/bulk_update/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ positions: newPositions }),
      });
      
      if (response.ok) {
        setPositions(newPositions);
      } else {
        console.error('Error saving positions:', response.status);
        alert('Erro ao salvar posições. Você está autenticado?');
      }
    } catch (error) {
      console.error('Error saving positions:', error);
      alert('Erro ao salvar posições');
    }
  };

  const handleAdd = () => {
    if (!newPosition.trim()) {
      alert('Por favor, digite o nome do cargo');
      return;
    }

    const newPos: Position = {
      id: Date.now(),
      name: newPosition.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const updated = [...positions, newPos];
    savePositions(updated);
    setNewPosition('');
    setShowAddForm(false);
  };

  const handleEdit = (position: Position) => {
    setEditingId(position.id);
    setEditValue(position.name);
  };

  const handleSaveEdit = (id: number) => {
    if (!editValue.trim()) {
      alert('O nome do cargo não pode estar vazio');
      return;
    }

    const updated = positions.map(p =>
      p.id === id ? { ...p, name: editValue.trim() } : p
    );
    savePositions(updated);
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cargo?')) return;

    const updated = positions.filter(p => p.id !== id);
    savePositions(updated);
  };

  const handleToggleActive = (id: number) => {
    const updated = positions.map(p =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    savePositions(updated);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cargos Disponíveis</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os cargos que aparecem no formulário de candidatura
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Cargo
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Novo Cargo</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Ex: Pintor, Auxiliar de Pintor..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewPosition('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Os cargos cadastrados aqui aparecerão automaticamente no dropdown 
          "Cargo Pretendido" do formulário de candidatura. Apenas cargos ativos são exibidos.
        </p>
      </div>

      {/* Positions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : positions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cargo cadastrado
          </h3>
          <p className="text-gray-600 mb-4">
            Adicione o primeiro cargo para começar
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Adicionar Cargo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map((position) => (
                <tr key={position.id} className={!position.is_active ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === position.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(position.id)}
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {position.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(position.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        position.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {position.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(position.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === position.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSaveEdit(position.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(position)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(position.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total de Cargos</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{positions.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Cargos Ativos</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {positions.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Cargos Inativos</div>
          <div className="text-3xl font-bold text-gray-400 mt-2">
            {positions.filter(p => !p.is_active).length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Positions;

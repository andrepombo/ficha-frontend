import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Candidate } from '../types';
import ScoreBadge from './ScoreBadge';
import { candidateAPI } from '../services/api';

interface KanbanBoardProps {
  candidates: Candidate[];
  onStatusChange: (id: number, newStatus: string) => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const kanbanColumns: KanbanColumn[] = [
  {
    id: 'incomplete',
    title: 'Incompleto',
    status: ['incomplete'],
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300'
  },
  {
    id: 'pending',
    title: 'Pendente',
    status: ['pending'],
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300'
  },
  {
    id: 'reviewing',
    title: 'Em Análise',
    status: ['reviewing'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300'
  },
  {
    id: 'shortlisted',
    title: 'Pré-Selecionado',
    status: ['shortlisted'],
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300'
  },
  {
    id: 'interviewed',
    title: 'Entrevistado',
    status: ['interviewed'],
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300'
  },
  {
    id: 'accepted',
    title: 'Aceito',
    status: ['accepted'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  },
  {
    id: 'rejected',
    title: 'Rejeitado',
    status: ['rejected'],
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300'
  }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ candidates, onStatusChange }) => {
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getCandidatesForColumn = (columnStatuses: string[]) => {
    return candidates.filter(candidate => columnStatuses.includes(candidate.status));
  };

  const handleDragStart = (candidate: Candidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedCandidate && draggedCandidate.status !== columnId) {
      try {
        await candidateAPI.updateStatus(draggedCandidate.id, columnId);
        onStatusChange(draggedCandidate.id, columnId);
      } catch (error) {
        console.error('Error updating candidate status:', error);
      }
    }
    setDraggedCandidate(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {kanbanColumns.map(column => {
        const columnCandidates = getCandidatesForColumn(column.status);
        const isDropTarget = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex flex-col"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`${column.bgColor} ${column.borderColor} border-2 rounded-t-xl p-4 sticky top-0 z-10`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-lg ${column.color}`}>
                  {column.title}
                </h3>
                <span className={`${column.bgColor} ${column.color} px-3 py-1 rounded-full text-sm font-semibold border ${column.borderColor}`}>
                  {columnCandidates.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div
              className={`${column.bgColor} border-2 ${column.borderColor} border-t-0 rounded-b-xl p-3 min-h-[500px] transition-all ${
                isDropTarget ? 'ring-4 ring-indigo-400 ring-opacity-50' : ''
              }`}
            >
              <div className="space-y-3">
                {columnCandidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Nenhum candidato</p>
                  </div>
                ) : (
                  columnCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={() => handleDragStart(candidate)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border border-gray-200 p-4 ${
                        draggedCandidate?.id === candidate.id ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Position */}
                      {candidate.position_applied && (
                        <p className="text-sm text-gray-700 font-semibold mb-2">
                          💼 {candidate.position_applied}
                        </p>
                      )}

                      {/* Candidate Name */}
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {candidate.full_name}
                        </h4>
                      </div>

                      {/* Contact Info & Score */}
                      <div className="flex items-center justify-between mb-3">
                        {candidate.phone_number && (
                          <p className="text-xs text-gray-600">
                            📱 {candidate.phone_number}
                          </p>
                        )}
                        {candidate.score !== null && candidate.score !== undefined && (
                          <ScoreBadge candidate={candidate} size="sm" showGrade={true} />
                        )}
                      </div>

                      {/* Applied Date */}
                      <p className="text-xs text-gray-500 mb-3">
                        📅 {new Date(candidate.applied_date).toLocaleDateString('pt-BR')}
                      </p>

                      {/* Action Button */}
                      <Link
                        to={`/candidate/${candidate.id}`}
                        className="block w-full text-center px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;

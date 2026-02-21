import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { candidateAPI } from '../services/api';
import { Candidate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getCopy } from '../i18n';

interface AgeGroup {
  range: string;
  count: number;
  [key: string]: string | number;
}

interface EducationData {
  level: string;
  count: number;
  [key: string]: string | number;
}

function Demographics() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [ageData, setAgeData] = useState<AgeGroup[]>([]);
  const [educationData, setEducationData] = useState<EducationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Colors for charts
  const AGE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
  const EDUCATION_COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) {
      processAgeData();
      processEducationData();
    }
  }, [candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getAll();
      setCandidates(data);
      setError(null);
    } catch (err) {
      setError(copy.demographics.error);
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const processAgeData = () => {
    const ageGroups: { [key: string]: number } = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0,
    };

    candidates.forEach(candidate => {
      if (candidate.date_of_birth) {
        const age = calculateAge(candidate.date_of_birth);
        
        if (age >= 18 && age <= 24) ageGroups['18-24']++;
        else if (age >= 25 && age <= 34) ageGroups['25-34']++;
        else if (age >= 35 && age <= 44) ageGroups['35-44']++;
        else if (age >= 45 && age <= 54) ageGroups['45-54']++;
        else if (age >= 55 && age <= 64) ageGroups['55-64']++;
        else if (age >= 65) ageGroups['65+']++;
      }
    });

    const data: AgeGroup[] = Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
    }));

    setAgeData(data);
  };

  const processEducationData = () => {
    const educationCounts: { [key: string]: number } = {};
    
    // Map education codes to Portuguese labels
    const educationLabels = copy.demographics.labels.education;

    candidates.forEach(candidate => {
      if (candidate.highest_education) {
        const education = candidate.highest_education;
        const label = educationLabels[education] || education;
        educationCounts[label] = (educationCounts[label] || 0) + 1;
      }
    });

    // Sort by count descending
    const data: EducationData[] = Object.entries(educationCounts)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);

    setEducationData(data);
  };

  // Additional datasets retained for future use but not rendered currently

  const totalCandidates = candidates.length;
  const candidatesWithAge = candidates.filter(c => c.date_of_birth).length;
  const candidatesWithEducation = candidates.filter(c => c.highest_education).length;
  const averageAge = candidates
    .filter(c => c.date_of_birth)
    .reduce((sum, c) => sum + calculateAge(c.date_of_birth!), 0) / candidatesWithAge || 0;

  // Custom label for pie chart
  const renderCustomLabel = (props: any) => {
    const percent = ((props.count / candidatesWithAge) * 100).toFixed(1);
    return `${props.range}: ${percent}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{copy.demographics.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button onClick={fetchCandidates} className="btn-primary">
            {copy.demographics.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{copy.demographics.cards.totalCandidates}</p>
                <p className="text-4xl font-bold mt-2">{totalCandidates}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{copy.demographics.cards.averageAge}</p>
                <p className="text-4xl font-bold mt-2">{averageAge.toFixed(1)}</p>
                <p className="text-purple-100 text-xs mt-1">{copy.demographics.cards.averageAgeUnit}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">{copy.demographics.cards.withAge}</p>
                <p className="text-4xl font-bold mt-2">{candidatesWithAge}</p>
                <p className="text-pink-100 text-xs mt-1">
                  {((candidatesWithAge / totalCandidates) * 100).toFixed(1)}% {copy.demographics.cards.ofTotal}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">{copy.demographics.cards.withEducation}</p>
                <p className="text-4xl font-bold mt-2">{candidatesWithEducation}</p>
                <p className="text-indigo-100 text-xs mt-1">
                  {((candidatesWithEducation / totalCandidates) * 100).toFixed(1)}% {copy.demographics.cards.ofTotal}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Age Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{copy.demographics.age.title}</h2>
            
            {candidatesWithAge === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{copy.demographics.age.noData}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {ageData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 gap-3 w-full">
                  {ageData.map((entry, index) => (
                    <div key={entry.range} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: AGE_COLORS[index % AGE_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700">
                        {entry.range} {copy.demographics.age.legendSuffix}: <span className="font-semibold">{entry.count}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{copy.demographics.education.title}</h2>
            
            {candidatesWithEducation === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{copy.demographics.education.noData}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={educationData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    allowDecimals={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="level" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8b5cf6" 
                    radius={[0, 8, 8, 0]}
                    name={copy.demographics.education.candidatesLabel}
                  >
                    {educationData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={EDUCATION_COLORS[index % EDUCATION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Age Details Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{copy.demographics.age.tableTitle}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {copy.demographics.age.headers.range}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {copy.demographics.age.headers.quantity}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {copy.demographics.age.headers.percent}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ageData.map((age, index) => (
                    <tr key={age.range} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {age.range} {copy.demographics.age.legendSuffix}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {age.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {candidatesWithAge > 0 
                          ? `${((age.count / candidatesWithAge) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Education Details Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{copy.demographics.education.tableTitle}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {copy.demographics.education.headers.level}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {copy.demographics.education.headers.quantity}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {copy.demographics.education.headers.percent}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {educationData.map((edu, index) => (
                    <tr key={edu.level} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {edu.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {edu.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {candidatesWithEducation > 0 
                          ? `${((edu.count / candidatesWithEducation) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demographics;

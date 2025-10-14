interface StatsCardProps {
  title: string;
  count: number;
  color?: 'blue' | 'orange' | 'purple' | 'indigo' | 'green' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
};

function StatsCard({ title, count, color = 'blue' }: StatsCardProps) {
  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-2">{count}</p>
    </div>
  );
}

export default StatsCard;

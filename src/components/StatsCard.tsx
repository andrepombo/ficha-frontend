interface StatsCardProps {
  title: string;
  count: number;
  color?: 'blue' | 'orange' | 'purple' | 'cyan' | 'indigo' | 'green' | 'red' | 'yellow';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 shadow-blue-200',
  orange: 'from-orange-500 to-orange-600 shadow-orange-200',
  purple: 'from-purple-500 to-purple-600 shadow-purple-200',
  cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-200',
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
  green: 'from-green-500 to-green-600 shadow-green-200',
  red: 'from-red-500 to-red-600 shadow-red-200',
  yellow: 'from-yellow-500 to-yellow-600 shadow-yellow-200',
} as const;

function StatsCard({ title, count, color = 'blue' }: StatsCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20`}>
      <div className="relative z-10">
        <p className="text-sm font-bold uppercase tracking-wider text-white/90">{title}</p>
        <p className="text-4xl font-extrabold mt-3 text-white">{count}</p>
      </div>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
    </div>
  );
}

export default StatsCard;

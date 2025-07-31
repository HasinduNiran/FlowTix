interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  bgColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeType = 'increase',
  bgColor = 'bg-blue-500',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center">
      <div className={`rounded-full ${bgColor} p-3 mr-4 text-white`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="flex items-center">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {change && (
            <span className={`ml-2 text-sm ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
              {changeType === 'increase' ? '↑' : '↓'} {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 
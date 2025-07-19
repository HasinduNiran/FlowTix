interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityCardProps {
  activities: Activity[];
}

export default function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const getStatusColor = (status?: 'success' | 'warning' | 'error' | 'info') => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
      </div>
      <div className="p-4">
        <ul className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <li key={activity.id} className="flex items-start">
                <div className={`${getStatusColor(activity.status)} h-3 w-3 rounded-full mt-1.5 mr-3`}></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-800">{activity.title}</p>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500 py-4">No recent activities</li>
          )}
        </ul>
      </div>
      {activities.length > 0 && (
        <div className="p-4 border-t">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all activities
          </button>
        </div>
      )}
    </div>
  );
} 
'use client';

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
            <p className="text-gray-600 mt-1">
              Monitor ticket sales and booking data
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <span className="text-6xl mb-4 block">🎫</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tickets Management</h3>
        <p className="text-gray-500 mb-6">
          This section will allow you to monitor ticket sales, view booking data, and manage ticket-related operations.
        </p>
        <p className="text-sm text-gray-400">
          Backend integration will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}

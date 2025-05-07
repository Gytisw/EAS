import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSchedules, deleteSchedule } from '../../services/api';
import type { Schedule } from '../../services/api'; // Assuming Schedule type is exported from api.ts
import { useAuth } from '../../auth/AuthContext'; // To ensure user is authenticated

const SchedulesListPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setError("User not authenticated. Please login.");
      setLoading(false);
      return;
    }

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const data = await getSchedules();
        setSchedules(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch schedules:', err);
        setError('Failed to fetch schedules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [isAuthenticated]);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    try {
      await deleteSchedule(id);
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      // Optionally, show a success message
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      setError('Failed to delete schedule. Please try again.');
      // Optionally, show an error message to the user
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading schedules...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  if (!schedules.length) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Schedules</h1>
          <Link
            to="/schedules/new"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create New Schedule
          </Link>
        </div>
        <p className="text-center text-gray-500">No schedules found. Get started by creating one!</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedules</h1>
        <Link
          to="/schedules/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create New Schedule
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Config</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run At</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap">{schedule.id}</td>
                <td className="py-4 px-4 whitespace-nowrap">
                  {schedule.task_config ? (
                    <Link to={`/task-configs/${schedule.task_config.id}/edit`} className="text-blue-600 hover:underline">
                      {schedule.task_config.name} (ID: {schedule.task_config.id})
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">{schedule.frequency}</td>
                <td className="py-4 px-4 whitespace-nowrap">
                  {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString() : 'N/A'}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {schedule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/schedules/${schedule.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulesListPage;
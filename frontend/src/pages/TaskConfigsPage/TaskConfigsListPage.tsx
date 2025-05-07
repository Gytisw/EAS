import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTaskConfigs, deleteTaskConfig } from '../../services/api';
import type { TaskConfig } from '../../services/api';
// import { useAuth } from '../../auth/AuthContext'; // Assuming useAuth provides user info or token

const TaskConfigsListPage: React.FC = () => {
  const [taskConfigs, setTaskConfigs] = useState<TaskConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // const { user } = useAuth(); // Or however you get the auth token/user

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming getTaskConfigs is already set up to send auth token
      const data = await getTaskConfigs();
      setTaskConfigs(data);
    } catch (err) {
      console.error('Failed to fetch task configs:', err);
      setError('Failed to load task configurations. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this task configuration?')) {
      try {
        await deleteTaskConfig(id);
        setTaskConfigs(prevConfigs => prevConfigs.filter(config => config.id !== id));
        // Optionally, show a success message
      } catch (err) {
        console.error('Failed to delete task config:', err);
        setError('Failed to delete task configuration. Please try again.');
        // Optionally, show an error message to the user
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading task configurations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Configurations</h1>
        <Link
          to="/task-configs/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Task Config
        </Link>
      </div>

      {taskConfigs.length === 0 ? (
        <p className="text-center text-gray-500">No task configurations found. Get started by creating one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Provider</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Model</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {taskConfigs.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">{config.name}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{config.task_type}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{config.ai_provider}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{config.ai_model_name}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/task-configs/${config.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
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
      )}
    </div>
  );
};

export default TaskConfigsListPage;
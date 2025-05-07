import React, { useState, useEffect } from 'react';
import { getTaskConfigs } from '../../services/api';
import type { TaskConfig, ScheduleData, ScheduleFrequency } from '../../services/api';

interface ScheduleFormProps {
  initialData?: ScheduleData & { id?: string | number }; // Include id if editing
  onSubmit: (data: ScheduleData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  submitButtonText?: string;
  formTitle?: string;
}

const frequencyOptions: { value: ScheduleFrequency; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'cron', label: 'Cron Expression' },
];

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  submitButtonText = 'Submit',
  formTitle = 'Schedule Form'
}) => {
  const [formData, setFormData] = useState<ScheduleData>(
    initialData || {
      task_config_id: '',
      frequency: 'once',
      next_run_at: '',
      cron_expression: '',
      is_active: true,
    }
  );
  const [taskConfigs, setTaskConfigs] = useState<TaskConfig[]>([]);
  const [loadingTaskConfigs, setLoadingTaskConfigs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskConfigs = async () => {
      try {
        setLoadingTaskConfigs(true);
        const configs = await getTaskConfigs();
        setTaskConfigs(configs);
        if (!isEditMode && configs.length > 0 && !initialData?.task_config_id) {
          // Pre-select the first task config if creating a new schedule and none is selected
          setFormData(prev => ({ ...prev, task_config_id: configs[0].id }));
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch task configs:', err);
        setError('Failed to load task configurations. Please try again.');
      } finally {
        setLoadingTaskConfigs(false);
      }
    };
    fetchTaskConfigs();
  }, [isEditMode, initialData?.task_config_id]);

  useEffect(() => {
    if (initialData) {
      // Format next_run_at for datetime-local input if present
      const formattedInitialData = {
        ...initialData,
        next_run_at: initialData.next_run_at
          ? new Date(initialData.next_run_at).toISOString().slice(0, 16)
          : '',
        task_config_id: initialData.task_config_id || (taskConfigs.length > 0 ? taskConfigs[0].id : '')
      };
      setFormData(formattedInitialData);
    }
  }, [initialData, taskConfigs]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Conditional logic for frequency and related fields
    if (name === 'frequency') {
      if (value !== 'cron') {
        setFormData((prev) => ({ ...prev, cron_expression: '' }));
      }
      if (value !== 'once') {
        // For non-'once' frequencies, next_run_at might be handled differently
        // or cleared if it's only for 'once'. Backend might auto-calculate.
        // For now, let's keep it, but this could be a point of adjustment.
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task_config_id) {
        setError("Task Configuration is required.");
        return;
    }
    if (formData.frequency === 'cron' && !formData.cron_expression?.trim()) {
        setError("Cron Expression is required for 'cron' frequency.");
        return;
    }
    if (formData.frequency === 'once' && !formData.next_run_at) {
        setError("Next Run At is required for 'once' frequency.");
        return;
    }
    setError(null); // Clear previous errors
    
    // Ensure next_run_at is in ISO format if provided
    const dataToSubmit = {
        ...formData,
        next_run_at: formData.next_run_at ? new Date(formData.next_run_at).toISOString() : new Date().toISOString(), // Default to now if not 'once' or not set
        cron_expression: formData.frequency === 'cron' ? formData.cron_expression : null,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">{formTitle}</h2>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="task_config_id" className="block text-sm font-medium text-gray-700 mb-1">
            Task Configuration <span className="text-red-500">*</span>
          </label>
          {loadingTaskConfigs ? (
            <p>Loading task configurations...</p>
          ) : taskConfigs.length === 0 ? (
            <p className="text-sm text-gray-500">No task configurations available. Please create one first.</p>
          ) : (
            <select
              id="task_config_id"
              name="task_config_id"
              value={formData.task_config_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select a Task Configuration</option>
              {taskConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name} (ID: {config.id})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Frequency <span className="text-red-500">*</span>
          </label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {frequencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {formData.frequency === 'cron' && (
          <div>
            <label htmlFor="cron_expression" className="block text-sm font-medium text-gray-700 mb-1">
              Cron Expression <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cron_expression"
              name="cron_expression"
              value={formData.cron_expression || ''}
              onChange={handleChange}
              required={formData.frequency === 'cron'}
              placeholder="e.g., 0 0 * * *"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
                Use cron syntax. Example: '0 0 * * *' for midnight daily.
            </p>
          </div>
        )}

        {formData.frequency === 'once' && (
          <div>
            <label htmlFor="next_run_at" className="block text-sm font-medium text-gray-700 mb-1">
              Next Run At <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="next_run_at"
              name="next_run_at"
              value={formData.next_run_at}
              onChange={handleChange}
              required={formData.frequency === 'once'}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        
        {/* Display next_run_at as read-only for other frequencies if it's set (e.g. by backend or if editing) */}
        {formData.frequency !== 'once' && initialData?.next_run_at && (
             <div>
                <label htmlFor="next_run_at_display" className="block text-sm font-medium text-gray-700 mb-1">
                Next Scheduled Run
                </label>
                <input
                type="text"
                id="next_run_at_display"
                name="next_run_at_display"
                value={new Date(initialData.next_run_at).toLocaleString()}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                />
            </div>
        )}


        <div className="flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Is Active
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loadingTaskConfigs || (taskConfigs.length === 0 && !isEditMode)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
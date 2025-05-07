import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskConfigForm from './TaskConfigForm';
import {
  getTaskConfigById,
  createTaskConfig,
  updateTaskConfig,
} from '../../services/api';
import type { TaskConfigData, TaskConfig } from '../../services/api';

const TaskConfigFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState<Partial<TaskConfigData> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string>('Create Task Configuration');

  const fetchTaskConfig = useCallback(async (configId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: TaskConfig = await getTaskConfigById(configId);
      // Prepare initialData for the form.
      // The form expects output_constraints as a string if it's an object.
      // linked_credentials_id should be the ID.
      const formData: Partial<TaskConfigData> = {
        ...data,
        linked_credentials_id: data.linked_credentials?.id,
      };
      setInitialData(formData);
      setPageTitle(`Edit Task Configuration: ${data.name}`);
    } catch (err) {
      console.error('Failed to fetch task config for editing:', err);
      setError('Failed to load task configuration. It might not exist or an error occurred.');
      setPageTitle('Error Loading Task Configuration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      fetchTaskConfig(id);
    } else {
      setPageTitle('Create New Task Configuration');
      // For create mode, ensure initialData is explicitly undefined or a minimal default
      // if TaskConfigForm doesn't handle all defaults internally.
      // Here, TaskConfigForm handles defaults, so undefined is fine.
      setInitialData(undefined); 
    }
  }, [id, isEditMode, fetchTaskConfig]);

  const handleSubmit = async (data: TaskConfigData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && id) {
        await updateTaskConfig(id, data);
        navigate('/task-configs');
      } else {
        await createTaskConfig(data);
        navigate('/task-configs');
      }
    } catch (errUnknown: unknown) {
      console.error('Failed to save task configuration:', errUnknown);
      let errorMessage = 'Failed to save task configuration. Please check the details and try again.';

      if (typeof errUnknown === 'object' && errUnknown !== null && 'response' in errUnknown) {
        // Define a more specific type for the error response data
        interface ErrorResponseData {
          detail?: string;
          [key: string]: string | string[] | undefined; // For field-specific errors
        }
        const errResponse = (errUnknown as { response?: { data?: ErrorResponseData } }).response;
        
        if (errResponse?.data) {
          if (typeof errResponse.data.detail === 'string') {
            errorMessage = errResponse.data.detail;
          } else if (typeof errResponse.data === 'object') {
            let formattedError = '';
            // Now errResponse.data is typed as ErrorResponseData | undefined
            const responseData = errResponse.data;
            for (const key in responseData) {
              if (Object.prototype.hasOwnProperty.call(responseData, key) && key !== 'detail') {
                const fieldErrors = responseData[key];
                if (Array.isArray(fieldErrors)) {
                  formattedError += `${key}: ${fieldErrors.join(', ')}\n`;
                } else if (typeof fieldErrors === 'string') {
                  formattedError += `${key}: ${fieldErrors}\n`;
                }
              }
            }
            if (formattedError) errorMessage = formattedError.trim();
          }
        }
      } else if (errUnknown instanceof Error) {
        errorMessage = errUnknown.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditMode && !initialData) {
    return <div className="p-4 text-center">Loading configuration details...</div>;
  }

  if (error && isEditMode && !initialData) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => navigate('/task-configs')}
        className="mb-4 text-indigo-600 hover:text-indigo-800"
      >
        &larr; Back to Task Configurations
      </button>
      <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
      {error && (initialData || !isEditMode) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2 whitespace-pre-line">{error}</span>
        </div>
      )}
      <TaskConfigForm
        onSubmit={handleSubmit}
        initialData={initialData}
        isEditMode={isEditMode}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TaskConfigFormPage;
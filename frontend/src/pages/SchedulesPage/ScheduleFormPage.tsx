import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScheduleForm from './ScheduleForm';
import { createSchedule, getScheduleById, updateSchedule } from '../../services/api';
import type { ScheduleData, Schedule } from '../../services/api';
import { useAuth } from '../../auth/AuthContext';

const ScheduleFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [initialData, setInitialData] = useState<ScheduleData & { id?: string | number } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('Create New Schedule');

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: `/schedules${isEditMode ? `/${id}/edit` : '/new'}` } });
      return;
    }

    if (isEditMode && id) {
      setFormTitle('Edit Schedule');
      setIsLoading(true);
      getScheduleById(id)
        .then((schedule: Schedule) => {
          // The API returns task_config as an object, but ScheduleData expects task_config_id
          // Also, ensure next_run_at is correctly formatted if it comes from the server
          const formattedScheduleData: ScheduleData & { id: string | number } = {
            id: schedule.id,
            task_config_id: typeof schedule.task_config === 'object' ? schedule.task_config.id : schedule.task_config,
            frequency: schedule.frequency,
            cron_expression: schedule.cron_expression || '',
            next_run_at: schedule.next_run_at, // ScheduleForm will format this for input
            is_active: schedule.is_active,
          };
          setInitialData(formattedScheduleData);
          setError(null);
        })
        .catch(err => {
          console.error('Failed to fetch schedule details:', err);
          setError('Failed to load schedule details. Please try again.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setFormTitle('Create New Schedule');
      // For create mode, initialData can be undefined or a default structure
      setInitialData({
        task_config_id: '', // Will be populated by ScheduleForm's useEffect or user selection
        frequency: 'once',
        next_run_at: '',
        cron_expression: '',
        is_active: true,
      });
    }
  }, [id, isEditMode, isAuthenticated, navigate]);

  const handleSubmit = async (data: ScheduleData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && id) {
        await updateSchedule(id, data);
        // Optionally, show success message
      } else {
        await createSchedule(data);
        // Optionally, show success message
      }
      navigate('/schedules'); // Redirect to the list page after successful submission
    } catch (err) {
      console.error('Failed to save schedule:', err);
      let errorMessage = 'Failed to save schedule. Please check your input and try again.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data) {
        // Define a more specific type for the error data if possible,
        // for now, we'll check for common error message structures.
        interface ApiErrorResponse {
          detail?: string;
          error?: string;
          // Add other potential error fields if your API returns them
          [key: string]: string | string[] | number | boolean | undefined | null | Record<string, unknown>; // More specific than 'any'
        }
        const errorData = err.response.data as ApiErrorResponse;
        errorMessage = errorData.detail || errorData.error || errorMessage;
        if (typeof errorData === 'string') { // Sometimes the error data itself is a string
            errorMessage = errorData;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as Error).message;
      }
      setError(errorMessage);
      // Optionally, display specific field errors if the API returns them
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/schedules');
  };

  if (!isAuthenticated) {
    // This case should be handled by the useEffect redirect, but as a fallback:
    return <div className="p-4 text-center">Redirecting to login...</div>;
  }
  
  if (isLoading && isEditMode) { // Only show loading for edit mode initial fetch
    return <div className="p-4 text-center">Loading schedule details...</div>;
  }

  if (error && isEditMode && !initialData) { // If fetching initial data for edit failed
     return <div className="p-4 text-red-500 text-center">{error}</div>;
  }


  // Render form once initialData is resolved (or for new form)
  // The key ensures the form re-initializes if initialData changes (e.g. navigating between new/edit)
  return (
    <div className="container mx-auto p-4">
      {initialData || !isEditMode ? (
        <ScheduleForm
          key={id || 'new'} // Re-mounts form if id changes, helping with state reset
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditMode={isEditMode}
          submitButtonText={isEditMode ? 'Update Schedule' : 'Create Schedule'}
          formTitle={formTitle}
        />
      ) : (
        // This handles the case where edit mode is true, but initialData is still undefined (should be covered by isLoading)
        <div className="p-4 text-center">Preparing form...</div>
      )}
       {isLoading && <p className="text-center mt-4">Submitting...</p>}
       {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
    </div>
  );
};

export default ScheduleFormPage;
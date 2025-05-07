import React, { useState, useEffect } from 'react';
import type { TaskConfigData } from '../../services/api';

// This interface defines the shape of the form's internal state.
// output_constraints is always a string here for the textarea.
interface TaskConfigFormState {
  name: string;
  task_type: string;
  ai_provider: string;
  ai_model_name: string;
  prompt_template: string;
  output_constraints: string; // Always a string in the form's state
  refinement_iterations: number | string; // Allow string for input, convert on submit
  target_email_recipients: string;
  email_subject_template: string;
  linked_credentials_id: number | string; // Allow string for input, convert on submit
}

interface TaskConfigFormProps {
  onSubmit: (data: TaskConfigData) => void;
  initialData?: Partial<TaskConfigData>; // This can have output_constraints as object or string
  isEditMode?: boolean;
  isLoading?: boolean;
}

const AI_PROVIDERS = ['openai', 'anthropic', 'google_vertexai', 'custom_api'];
const TASK_TYPES = ['email_generation', 'content_summarization', 'data_extraction', 'custom_prompt'];

const TaskConfigForm: React.FC<TaskConfigFormProps> = ({
  onSubmit,
  initialData,
  isEditMode = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TaskConfigFormState>({
    name: '',
    task_type: TASK_TYPES[0],
    ai_provider: AI_PROVIDERS[0],
    ai_model_name: '',
    prompt_template: '',
    output_constraints: '{}', // Default to empty JSON object string
    refinement_iterations: 1,
    target_email_recipients: '',
    email_subject_template: '',
    linked_credentials_id: '', // Default to empty string, API handles null/undefined
  });

  useEffect(() => {
    if (initialData) {
      let outputConstraintsString = '{}';
      if (typeof initialData.output_constraints === 'object' && initialData.output_constraints !== null) {
        outputConstraintsString = JSON.stringify(initialData.output_constraints, null, 2);
      } else if (typeof initialData.output_constraints === 'string') {
        if (initialData.output_constraints.trim() === '') {
          outputConstraintsString = initialData.output_constraints; // Keep empty string
        } else {
          try {
            // Prettify if valid JSON, otherwise use as is
            const parsed = JSON.parse(initialData.output_constraints);
            outputConstraintsString = JSON.stringify(parsed, null, 2);
          } catch {
            outputConstraintsString = initialData.output_constraints;
          }
        }
      } else if (initialData.output_constraints === undefined) {
        outputConstraintsString = '{}'; // Default if undefined
      }

      setFormData({
        name: initialData.name || '',
        task_type: initialData.task_type || TASK_TYPES[0],
        ai_provider: initialData.ai_provider || AI_PROVIDERS[0],
        ai_model_name: initialData.ai_model_name || '',
        prompt_template: initialData.prompt_template || '',
        output_constraints: outputConstraintsString, // Now definitely a string
        refinement_iterations: initialData.refinement_iterations ?? 1,
        target_email_recipients: initialData.target_email_recipients || '',
        email_subject_template: initialData.email_subject_template || '',
        linked_credentials_id: initialData.linked_credentials_id?.toString() || '',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // All values from inputs are initially strings or become strings
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let parsedOutputConstraints: Record<string, unknown> | undefined = undefined;
    if (formData.output_constraints.trim() !== '') {
      try {
        parsedOutputConstraints = JSON.parse(formData.output_constraints);
      } catch (_parseError) {
        alert('Output constraints must be valid JSON or empty.');
        console.error("JSON parsing error for output_constraints:", _parseError); // Keep for debugging
        return;
      }
    }

    const refinementIter = parseInt(formData.refinement_iterations.toString(), 10);
    const linkedCredId = formData.linked_credentials_id.toString().trim() !== '' ? parseInt(formData.linked_credentials_id.toString(), 10) : undefined;

    const dataToSubmit: TaskConfigData = {
      name: formData.name,
      task_type: formData.task_type,
      ai_provider: formData.ai_provider,
      ai_model_name: formData.ai_model_name,
      prompt_template: formData.prompt_template,
      output_constraints: parsedOutputConstraints,
      refinement_iterations: isNaN(refinementIter) ? undefined : refinementIter,
      target_email_recipients: formData.target_email_recipients || undefined,
      email_subject_template: formData.email_subject_template || undefined,
      linked_credentials_id: isNaN(linkedCredId as number) ? undefined : linkedCredId,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="task_type" className="block text-sm font-medium text-gray-700">
          Task Type
        </label>
        <select
          name="task_type"
          id="task_type"
          value={formData.task_type}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {TASK_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
        </select>
      </div>

      <div>
        <label htmlFor="ai_provider" className="block text-sm font-medium text-gray-700">
          AI Provider
        </label>
        <select
          name="ai_provider"
          id="ai_provider"
          value={formData.ai_provider}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {AI_PROVIDERS.map(provider => (<option key={provider} value={provider}>{provider}</option>))}
        </select>
      </div>

      <div>
        <label htmlFor="ai_model_name" className="block text-sm font-medium text-gray-700">
          AI Model Name
        </label>
        <input
          type="text"
          name="ai_model_name"
          id="ai_model_name"
          value={formData.ai_model_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="prompt_template" className="block text-sm font-medium text-gray-700">
          Prompt Template
        </label>
        <textarea
          name="prompt_template"
          id="prompt_template"
          rows={6}
          value={formData.prompt_template}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="output_constraints" className="block text-sm font-medium text-gray-700">
          Output Constraints (JSON format)
        </label>
        <textarea
          name="output_constraints"
          id="output_constraints"
          rows={6}
          value={formData.output_constraints}
          onChange={handleChange}
          placeholder='e.g., {"type": "object", "properties": {"summary": {"type": "string"}}}'
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">Enter a valid JSON object or leave empty if not applicable.</p>
      </div>

      <div>
        <label htmlFor="refinement_iterations" className="block text-sm font-medium text-gray-700">
          Refinement Iterations
        </label>
        <input
          type="number"
          name="refinement_iterations"
          id="refinement_iterations"
          value={formData.refinement_iterations}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="target_email_recipients" className="block text-sm font-medium text-gray-700">
          Target Email Recipients (comma-separated)
        </label>
        <input
          type="text"
          name="target_email_recipients"
          id="target_email_recipients"
          value={formData.target_email_recipients}
          onChange={handleChange}
          placeholder="e.g., user1@example.com, user2@example.com"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="email_subject_template" className="block text-sm font-medium text-gray-700">
          Email Subject Template
        </label>
        <input
          type="text"
          name="email_subject_template"
          id="email_subject_template"
          value={formData.email_subject_template}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="linked_credentials_id" className="block text-sm font-medium text-gray-700">
          Linked Credentials ID (Optional)
        </label>
        <input
          type="text" // Kept as text to allow empty string, parsed in handleSubmit
          name="linked_credentials_id"
          id="linked_credentials_id"
          value={formData.linked_credentials_id}
          onChange={handleChange}
          placeholder="Enter ID of existing credentials"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
        >
            Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Update Task Config' : 'Create Task Config')}
        </button>
      </div>
    </form>
  );
};

export default TaskConfigForm;
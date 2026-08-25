import { type FormEvent, useState } from 'react';
import type { CreateTaskData } from '@/entities/task/model/types';
import DateTimePicker from '@/shared/ui/DateTimePicker/DateTimePicker';
import Select from '@/shared/ui/Select/Select';

interface CreateTaskFormProps {
  onCreateTask: (data: CreateTaskData) => void;
}

const INITIAL_FORM_DATA: CreateTaskData = {
  title: '',
  description: '',
  dueDate: undefined,
  priority: 'medium',
  status: 'todo',
};

const CreateTaskForm = ({ onCreateTask }: CreateTaskFormProps) => {
  const [formData, setFormData] = useState<CreateTaskData>(INITIAL_FORM_DATA);

  const isTitleEmpty = formData.title.trim().length === 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isTitleEmpty) {
      return;
    }

    onCreateTask({
      ...formData,
      title: formData.title.trim(),
    });

    setFormData(INITIAL_FORM_DATA);
  };

  const handleChange = (field: keyof CreateTaskData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Task
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add a new task to your Kanban board.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="title"
            className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-300"
          >
            Title
          </label>

          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter task title..."
            className={`rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:bg-slate-900 dark:text-white ${
              isTitleEmpty
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-900/40'
                : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-900/40'
            }`}
          />

          {isTitleEmpty && (
            <p className="text-xs leading-4 text-red-500 dark:text-red-400">
              Title is required.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-300"
          >
            Description
          </label>

          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Add a description..."
            className="min-h-28 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
          />
        </div>

        {/* Due date + Priority */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="due-date"
              className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-300"
            >
              Due date
            </label>

            <div id="due-date">
              <DateTimePicker
                value={formData.dueDate}
                onChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: value,
                  }));
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="priority"
              className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-300"
            >
              Priority
            </label>

            <Select
              value={formData.priority}
              onChange={(value) => handleChange('priority', value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5 dark:border-slate-700">
        <button
          type="submit"
          disabled={isTitleEmpty}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:disabled:bg-slate-600 dark:disabled:text-slate-400"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default CreateTaskForm;

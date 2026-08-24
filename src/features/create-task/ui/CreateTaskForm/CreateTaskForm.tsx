import { type FormEvent, useState } from 'react';
import type { CreateTaskData } from '@/entities/task/model/types';
import DateTimePicker from '@/shared/ui/DateTimePicker/DateTimePicker';

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
      className="mb-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        Create Task
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            Title
          </label>

          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter task title..."
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="min-h-24 resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Due date</label>

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

        <div className="flex flex-col gap-2">
          <label
            htmlFor="priority"
            className="text-sm font-medium text-slate-700"
          >
            Priority
          </label>

          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isTitleEmpty}
          className="
            mt-2
            rounded-lg
            bg-slate-900
            px-4
            py-2
            font-medium
            text-white
            transition
            hover:bg-slate-700
            disabled:cursor-not-allowed
            disabled:bg-slate-400
          "
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default CreateTaskForm;

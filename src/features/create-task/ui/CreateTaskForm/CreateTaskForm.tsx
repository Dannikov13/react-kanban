import { useState } from 'react';
import type { CreateTaskData } from '@/entities/task/model/types';

interface CreateTaskFormProps {
  onCreateTask: (data: CreateTaskData) => void;
}

const CreateTaskForm = ({ onCreateTask }: CreateTaskFormProps) => {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onCreateTask(formData);

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
    });
  };

  const handleChange = (field: keyof CreateTaskData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
      <div>
        <label htmlFor="title">Title</label>

        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>

        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="priority">Priority</label>

        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button type="submit">Create task</button>
    </form>
  );
};

export default CreateTaskForm;

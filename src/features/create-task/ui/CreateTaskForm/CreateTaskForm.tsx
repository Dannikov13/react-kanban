import { useState } from 'react';
import type { CreateTaskData } from '@/entities/task/model/types';

const CreateTaskForm = () => {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
  });

  const onCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const handleChange = (field: keyof CreateTaskData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={onCreateTask}>
      <label htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
      />
    </form>
  );
};

export default CreateTaskForm;

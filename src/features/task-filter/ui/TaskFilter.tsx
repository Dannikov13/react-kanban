import type {
  DueDateFilter,
  TaskPriority,
  TaskSort,
  TaskStatus,
} from '@/entities/task';

interface TaskFilterProps {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  sort: TaskSort;
  dueDate: DueDateFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | 'all') => void;
  onPriorityChange: (value: TaskPriority | 'all') => void;
  onSortChange: (value: TaskSort) => void;
  onDueDateChange: (value: DueDateFilter) => void;
}

const TaskFilter = ({
  search,
  status,
  priority,
  sort,
  dueDate,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onDueDateChange,
}: TaskFilterProps) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-4">
          <label
            htmlFor="task-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search tasks
          </label>

          <div className="relative max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              🔍
            </span>

            <input
              id="task-search"
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="status-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id="status-filter"
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as TaskStatus | 'all')
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All statuses</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Priority
          </label>

          <select
            id="priority-filter"
            value={priority}
            onChange={(e) =>
              onPriorityChange(e.target.value as TaskPriority | 'all')
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="due-date-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Due date
          </label>

          <select
            id="due-date-filter"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value as DueDateFilter)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All due dates</option>
            <option value="none">No due date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sort-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Sort by
          </label>

          <select
            id="sort-filter"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as TaskSort)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="manual">Manual order</option>
            <option value="due-asc">Due date ↑</option>
            <option value="due-desc">Due date ↓</option>
            <option value="priority-asc">Priority ↑</option>
            <option value="priority-desc">Priority ↓</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;

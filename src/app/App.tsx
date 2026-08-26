import KanbanBoard from '@/widgets/kanban-board/ui/KanbanBoard';
import ThemeToggle from '@/shared/ui/ThemeToggle/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';

const App = () => {
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen min-w-0 max-w-full overflow-x-clip bg-slate-50 p-4 transition-colors sm:p-6 dark:bg-slate-900">
      <div className="mb-6 flex min-w-0 max-w-full justify-end">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
      </div>

      <KanbanBoard />
    </main>
  );
};

export default App;

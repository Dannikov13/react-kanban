import KanbanBoard from '@/widgets/kanban-board/ui/KanbanBoard';
import ThemeToggle from '@/shared/ui/ThemeToggle/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';

const App = () => {
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 p-6 transition-colors dark:bg-slate-900">
      <div className="mb-6 flex justify-end">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
      </div>

      <KanbanBoard />
    </main>
  );
};

export default App;

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export const TasksPanel = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'barba', completed: false },
    { id: '2', text: 'cabelo', completed: false },
    { id: '3', text: 'viagem', completed: false },
    { id: '4', text: 'empresa', completed: false },
    { id: '5', text: 'namorada', completed: false },
    { id: '6', text: 'beber', completed: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-card to-card/50 border shadow-lg">
      <div className="p-4 border-b bg-card/80 backdrop-blur-sm">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          As minhas tarefas
        </h3>
      </div>

      <div className="p-4 border-b">
        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Adicionar uma tarefa"
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={addTask}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Nenhuma tarefa ainda
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-accent",
                task.completed && "opacity-60"
              )}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <span className={cn(
                "flex-1 text-sm",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.text}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteTask(task.id)}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
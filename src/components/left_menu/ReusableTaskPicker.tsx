import React, { useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from 'src/components/ui/card';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import { TaskList } from 'src/components/task_list/TaskList';
import { TaskExtensionProvider } from 'src/components/context/TaskExtensionContext';
import { ArrowRight } from 'lucide-react';
import { useTaskInteraction } from 'src/components/context/TaskInteractionContext';
import { useTaskList } from 'src/components/context/TaskListsContext';
import { Task, taskService } from '../../service/taskService';

export const ReusableTaskPicker: React.FC = () => {
    const todoContext = useTaskList('DAILY_TODO');

    const addTaskToDailyPlan = async (newTask: Task) => {
        const addedTask = { ...newTask, listName: 'DAILY_TODO' };
        const createdTask = await taskService.createTask(addedTask);
        todoContext.setTasks([...todoContext.tasks, createdTask]);
    };

    const tasks = useTaskList('REUSABLE').tasks;
    const { openCreateTaskDialog } = useTaskInteraction();

    const cardContentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (cardContentRef.current) {
            cardContentRef.current.scrollTo({
                left: 0,
                behavior: 'smooth',
            });
        }
    }, [tasks]);

    const addTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'add-task-reusable',
            keys: ['A'],
            action: openCreateTaskDialog,
            description: 'Add a new task to reusable tasks',
            order: 1,
        }),
        [openCreateTaskDialog]
    );

    useRegisterShortcut(addTaskShortcut);

    return (
        <Card className="flex flex-col flex-1">
            <CardContent
                ref={cardContentRef}
                className="flex-grow overflow-y-auto overflow-x-clip scrollbar-custom"
            >
                <TaskExtensionProvider
                    extraButtons={[
                        { icon: ArrowRight, handler: addTaskToDailyPlan },
                    ]}
                >
                    <div className="mt-2">
                        <TaskList
                            tasks={tasks}
                            placeholderNode={
                                <>
                                    <span>reusable tasks.</span>
                                    <span>
                                        the building blocks of your boring life.
                                    </span>
                                </>
                            }
                            title="Reusable Tasks"
                            isDroppable={false}
                            showCreateButton={true}
                            onCreateTask={openCreateTaskDialog}
                        />
                    </div>
                </TaskExtensionProvider>
            </CardContent>
        </Card>
    );
};

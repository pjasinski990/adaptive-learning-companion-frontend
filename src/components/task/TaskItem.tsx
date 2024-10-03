import { Task } from '../../service/taskService';
import React, { useEffect, useRef } from 'react';
import { TaskItemContent } from 'src/components/task/TaskItemContent';
import { useTaskProperties } from 'src/components/context/TaskPropertiesContext';
import { Draggable } from '@hello-pangea/dnd';
import { DraggableProvider } from 'src/components/context/DraggableContext';
import { DraggableWrapper } from 'src/components/library/DraggableWrapper';

interface TaskItemProps {
    task: Task;
    index?: number;
    isVanity?: boolean;
    className?: string;
    isHighlighted?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    index,
    isVanity = false,
    className,
    isHighlighted = false,
}) => {
    const itemRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isHighlighted && itemRef.current) {
            itemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
            });
        }
    }, [isHighlighted]);

    return (
        <div ref={itemRef} className={className}>
            <TaskItemInternal
                task={task}
                index={index}
                isVanity={isVanity}
                isHighlighted={isHighlighted}
            />
        </div>
    );
};

const TaskItemInternal: React.FC<TaskItemProps> = ({
    task,
    index,
    isVanity,
    isHighlighted,
}) => {
    if (isVanity) {
        return <VanityTask task={task} />;
    }
    return (
        <TaskDispatcher
            task={task}
            index={index}
            isHighlighted={isHighlighted}
        />
    );
};

const VanityTask: React.FC<TaskItemProps> = ({ task }) => {
    return <TaskItemContent task={task} />;
};

const TaskDispatcher: React.FC<TaskItemProps> = ({
    task,
    index,
    isHighlighted,
}) => {
    const { isDraggable, isFoldable, initiallyFolded } = useTaskProperties();
    let content = <TaskItemContent task={task} isHighlighted={isHighlighted} />;

    if (isFoldable) {
        content = (
            <FoldableTaskItem task={task} initiallyFolded={initiallyFolded}>
                {content}
            </FoldableTaskItem>
        );
    }

    if (isDraggable) {
        if (index === undefined) {
            throw new Error(
                'Attempting to create draggable task but no index provided!'
            );
        }
        content = (
            <DraggableTaskItem task={task} index={index}>
                {content}
            </DraggableTaskItem>
        );
    }
    return content;
};

const DraggableTaskItem: React.FC<
    TaskItemProps & { children: React.ReactNode }
> = ({ task, index, children }) => {
    return (
        <Draggable draggableId={String(task.id)} index={index!}>
            {(provided, snapshot) => (
                <DraggableProvider provided={provided} snapshot={snapshot}>
                    <DraggableWrapper>{children}</DraggableWrapper>
                </DraggableProvider>
            )}
        </Draggable>
    );
};

const FoldableTaskItem: React.FC<
    TaskItemProps & {
        initiallyFolded: boolean | 'unfolded';
        children: React.ReactNode;
    }
> = ({ initiallyFolded, children }) => {
    const [isFolded, setIsFolded] = React.useState(initiallyFolded);

    const handleDoubleClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault();
        setIsFolded(prevState => !prevState);
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className="cursor-pointer transition-colors duration-200"
        >
            {React.cloneElement(children as React.ReactElement, {
                showDetails: !isFolded,
            })}
        </div>
    );
};

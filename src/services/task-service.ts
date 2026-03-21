import { injectable } from 'inversify';
import { Task, TaskType } from '../modules/task.js';

@injectable()
export class TaskService {
    constructor() {
        // Initialize any necessary resources, e.g., database connections, as explained in the requirements, we will use in-memory storage for simplicity. 
    }

    private tasks: Task[] = [];

    getTasksInner(): Task[] {
        return this.tasks;
    }

    getTasks(includeCompleted: boolean, createdAfter: number): Task[] {
        return this.getTasksInner().filter(task => {
                if (!includeCompleted && task.completed) {
                    return false;
                }
                if (task.createdAt < createdAfter) {
                    return false;
                }
                return true;
            });
    }

    createTask(title: string, createdBy: string,taskType: TaskType): Task {
        const newTask = new Task(
            // In a real application, you would generate a unique ID, e.g., using a database auto-increment or UUID.
            this.tasks.length + 1,
            title,
            false,
            (new Date).getUTCDate(),
            createdBy,
            taskType
        );
        this.tasks.push(newTask);
        // In a real application, you would persist the task to a database here.
        return newTask;
    }
}
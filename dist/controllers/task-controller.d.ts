import { Task, TaskType } from '../modules/task.js';
import { TaskService } from '../services/task-service.js';
export declare class TaskController {
    private taskService;
    constructor(taskService: TaskService);
    getTasks(includeCompleted: boolean, createdAfter: Date): Task[];
    createTask(title: string, assignedTo: string, taskType: TaskType): Task;
}
//# sourceMappingURL=task-controller.d.ts.map
import { Task, TaskType } from '../modules/task.js';
export declare class TaskService {
    constructor();
    private tasks;
    getTasksInner(): Task[];
    getTasks(includeCompleted: boolean, createdAfter: number): Task[];
    createTask(title: string, createdBy: string, taskType: TaskType): Task;
}
//# sourceMappingURL=task-service.d.ts.map
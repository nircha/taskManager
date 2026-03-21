
import { injectable, inject } from 'inversify';
import { Task, TaskType } from '../modules/task.js';
import { TaskService } from '../services/task-service.js';

@injectable()
export class TaskController{
    constructor(@inject(TaskService) private taskService: TaskService) {}

    getTasks(includeCompleted: boolean, createdAfter: Date): Task[] {
        const number = createdAfter.getTime();
        return this.taskService.getTasks(includeCompleted, number);
    }

    createTask(title: string, assignedTo: string, taskType: TaskType): Task {
        return this.taskService.createTask(title, assignedTo,taskType);
    }
    
}
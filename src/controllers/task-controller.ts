
import { injectable } from 'inversify';
import { Task, TaskType } from '../modules/task';
import { TaskService } from '../services/task-service';

@injectable()
export class TaskController{
    constructor(private taskService: TaskService) {}

    getTasks(includeCompleted: boolean, createdAfter: Date): Task[] {
        const number = createdAfter.getTime();
        return this.taskService.getTasks(includeCompleted, number);
    }

    createTask(title: string, assignedTo: string, taskType: TaskType): Task {
        return this.taskService.createTask(title, assignedTo,taskType);
    }
    
}
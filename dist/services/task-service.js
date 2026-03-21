var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable } from 'inversify';
import { Task } from '../modules/task.js';
let TaskService = class TaskService {
    constructor() {
        this.tasks = [];
    }
    getTasksInner() {
        return this.tasks;
    }
    getTasks(includeCompleted, createdAfter) {
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
    createTask(title, createdBy, taskType) {
        const newTask = new Task(this.tasks.length + 1, title, false, (new Date).getUTCDate(), createdBy, taskType);
        this.tasks.push(newTask);
        return newTask;
    }
};
TaskService = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], TaskService);
export { TaskService };
//# sourceMappingURL=task-service.js.map
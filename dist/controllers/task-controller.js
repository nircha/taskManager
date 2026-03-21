var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { injectable, inject } from 'inversify';
import { TaskService } from '../services/task-service.js';
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    getTasks(includeCompleted, createdAfter) {
        const number = createdAfter.getTime();
        return this.taskService.getTasks(includeCompleted, number);
    }
    createTask(title, assignedTo, taskType) {
        return this.taskService.createTask(title, assignedTo, taskType);
    }
};
TaskController = __decorate([
    injectable(),
    __param(0, inject(TaskService)),
    __metadata("design:paramtypes", [TaskService])
], TaskController);
export { TaskController };
//# sourceMappingURL=task-controller.js.map
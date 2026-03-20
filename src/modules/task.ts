export enum TaskType {
    CREATE = "create",
    DELETE = "delete"
}

export class Task{
    id: number;
    title: string;
    completed: boolean;
    createdAt: number;
    createdBy: string;
    taskType: TaskType;

    constructor(id: number, title: string, completed: boolean, createdAt: number, createdBy: string, public type: TaskType = TaskType.CREATE) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.taskType = type;
    }
}
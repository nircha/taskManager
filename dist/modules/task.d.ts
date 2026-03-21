export declare enum TaskType {
    CREATE = "create",
    DELETE = "delete"
}
export declare class Task {
    type: TaskType;
    id: number;
    title: string;
    completed: boolean;
    createdAt: number;
    createdBy: string;
    taskType: TaskType;
    constructor(id: number, title: string, completed: boolean, createdAt: number, createdBy: string, type?: TaskType);
}
//# sourceMappingURL=task.d.ts.map
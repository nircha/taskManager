export var TaskType;
(function (TaskType) {
    TaskType["CREATE"] = "create";
    TaskType["DELETE"] = "delete";
})(TaskType || (TaskType = {}));
export class Task {
    constructor(id, title, completed, createdAt, createdBy, type = TaskType.CREATE) {
        this.type = type;
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.taskType = type;
    }
}
//# sourceMappingURL=task.js.map
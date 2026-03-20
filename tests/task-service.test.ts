import { Task, TaskType } from '../src/modules/task';
import { TaskService } from '../src/services/task-service';

describe('Task Service', () => {
  let testService: TaskService;
  beforeEach(() => {
    // Create the app with the custom container
    testService = new TaskService();
  });

  describe('getTasks', () => {
    it('should return uncompleted tasks if includeCompleted is true', async () => {
      const task1 = new Task(1, 'Task 1', false, (new Date('2026-01-01')).getTime(), 'user1', TaskType.CREATE);
      const task2 = new Task(2, 'Task 2', true, (new Date('2026-03-02')).getTime(), 'user2', TaskType.DELETE);
      testService.getTasksInner = ((): Task[] => {
        return [
          task1,
          task2
        ]
      });

      const tasks = testService.getTasks(true, 0);

      expect(tasks.length).toBe(2);
      expect(tasks[0]).toBe(task1);
      expect(tasks[1]).toBe(task2);
    });

    it('should return task that were created after the passed createdAfter date and are uncompleted tasks if includeCompleted is true', async () => {
    
      const task1 = new Task(1, 'Task 1', false, new Date('2026-01-01').getTime(), 'user1', TaskType.CREATE);
      const task2 = new Task(2, 'Task 2', true, new Date('2026-01-03').getTime(), 'user2', TaskType.DELETE);
      testService.getTasksInner = ((): Task[] => {
        return [
          task1,
          task2
        ]
      });

      const tasks = testService.getTasks(true, new Date('2026-01-02').getTime());

      expect(tasks.length).toBe(1);
      expect(tasks[0]).toBe(task2);
    });

    it('should not return any task if none don\'t match the filter criteria', async () => {
    
      const task1 = new Task(1, 'Task 1', false, new Date('2026-01-01').getTime(), 'user1', TaskType.CREATE);
      const task2 = new Task(2, 'Task 2', true, new Date('2026-01-03').getTime(), 'user2', TaskType.DELETE);
      testService.getTasksInner = ((): Task[] => {
        return [
          task1,
          task2
        ]
      });

      const tasks = testService.getTasks(false, new Date('2026-01-02').getTime());

      expect(tasks.length).toBe(0);
    });
  });

  describe('createTask', () => {
    it('should create a new task and return it', async () => {
      const title = 'New Task';
      const createdBy = 'user3';
      const taskType = TaskType.DELETE;
      const newTask = testService.createTask(title, createdBy, taskType);
      expect(newTask).toBeDefined();
      expect(newTask.id).toBe(1);
      expect(newTask.title).toBe(title);
      expect(newTask.completed).toBe(false);
      expect(newTask.createdBy).toBe(createdBy);
      expect(newTask.taskType).toBe(taskType);

      // Check that the task is stored in the service
      const tasks = testService.getTasks(true, 0);
      expect(tasks.length).toBe(1);
      expect(tasks[0]).toBe(newTask);
    });
  });
});

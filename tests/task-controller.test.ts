import { TaskController } from '../src/controllers/task-controller';
import { MockProxy, mock } from 'jest-mock-extended';
import { Task, TaskType } from '../src/modules/task';
import { TaskService } from '../src/services/task-service';

describe('Task Controller', () => {
  let mockService: MockProxy<TaskService>;
  let testController: TaskController;
  beforeEach(() => {
    // Create a mock TaskService
    mockService = mock<TaskService>();
    mockService.createTask.mockReturnValue(
      new Task(1, 'Mock Task', false, 0 ,'user1',TaskType.CREATE ));

    // Create the app with the custom container
    testController = new TaskController(mockService);
  });

  describe('getTasks', () => {
    it('should pass parameters correctly to TaskService, with date as epoch date(number)', async () => {
      // Mock the getTasks method to return an empty array
      mockService.getTasks.mockReturnValue([]);

      const  millisecondsSevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const dateSevenDaysAgo = new Date(millisecondsSevenDaysAgo);
      testController.getTasks(false, dateSevenDaysAgo);

      // Check that getTasks was called with includeCompleted=false and createdAfter approximately 7 days ago (ignoring time)
      expect(mockService.getTasks).toHaveBeenCalledTimes(1);
      const callArgs = mockService.getTasks.mock.calls[0]!;
      const [includeCompletedArg, createdAfterArg] = callArgs;
      expect(includeCompletedArg).toBe(false);

      // Normalize actual date to start of day for comparison
      const actualDate = new Date(createdAfterArg);

      expect(actualDate.getTime()).toBe(millisecondsSevenDaysAgo);
    });
  });

    describe('createTask', () => {
      it('should pass parameters correctly to TaskService', async () => {
        // Mock the getTasks method to return an empty array
        mockService.getTasks.mockReturnValue([]);
        const taskName = 'Mock Task';
        const userName = 'user1';
        const taskType = TaskType.CREATE;
        testController.createTask(taskName, userName, taskType);

        // Check that getTasks was called with includeCompleted=false and createdAfter approximately 7 days ago (ignoring time)
        expect(mockService.createTask).toHaveBeenCalledTimes(1);
        const callArgs = mockService.createTask.mock.calls[0]!;
        const [titleArg, assignedToArg, taskTypeArg] = callArgs;
        expect(titleArg).toBe(taskName);
        expect(assignedToArg).toBe(userName);
        expect(taskTypeArg).toBe(taskType);
      });
  });
});

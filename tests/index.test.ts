import request from 'supertest';
import { createApp } from '../src/index';
import { TaskController } from '../src/controllers/task-controller';
import { Container } from 'inversify';
import { MockProxy, mock } from 'jest-mock-extended';
import { Application } from 'express';
import { Task, TaskType } from '../src/modules/task';
import { after } from 'node:test';

describe('API Endpoints', () => {
  let mockController: MockProxy<TaskController>;
  let testApp: Application;

  beforeEach(() => {
    // Create a mock TaskController
    mockController = mock<TaskController>();
    mockController.createTask.mockReturnValue(
      new Task(1, 'Mock Task', false, 0 ,'user1',TaskType.CREATE ));

    // Create a custom container and bind the mock
    const testContainer = new Container();
    testContainer.bind<TaskController>(TaskController).toConstantValue(mockController);

    // Create the app with the custom container
    testApp = createApp(testContainer);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(testApp)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /tasks', () => {
    it('should return a list of tasks and call TaskController.getTasks with defaults to includeCompleted = false and createdAfter to 7 days ago', async () => {
      // Mock the getTasks method to return an empty array
      mockController.getTasks.mockReturnValue([]);

      const response = await request(testApp)
        .get('/tasks')
        .expect(200);

      // Check that getTasks was called with includeCompleted=false and createdAfter approximately 7 days ago (ignoring time)
      expect(mockController.getTasks).toHaveBeenCalledTimes(1);
      const callArgs = mockController.getTasks.mock.calls[0]!;
      const [includeCompletedArg, createdAfterArg] = callArgs;
      expect(includeCompletedArg).toBe(false);
      expect(createdAfterArg).toBeInstanceOf(Date);

      // Calculate expected date (7 days ago, ignoring time)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 7);
      expectedDate.setHours(0, 0, 0, 0); // Normalize to start of day

      // Normalize actual date to start of day for comparison
      const actualDate = new Date(createdAfterArg);
      actualDate.setHours(0, 0, 0, 0);

      expect(actualDate.getTime()).toBe(expectedDate.getTime());

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return a list of tasks and call TaskController.getTasks with defaults to includeCompleted = false and createdAfter the date passed in the query', async () => {
      // Mock the getTasks method to return an empty array
      mockController.getTasks.mockReturnValue([]);
      const dateInUtc:number = Date.now() - 5 * 24 * 60 * 60 * 1000; // 5 days ago

      const response = await request(testApp)
        .get('/tasks?createdAfter=' + dateInUtc) // 5 days ago
        .expect(200);

      // Check that getTasks was called with includeCompleted=false and createdAfter as passed in query
      expect(mockController.getTasks).toHaveBeenCalledTimes(1);
      const callArgs = mockController.getTasks.mock.calls[0]!;
      const [includeCompletedArg, createdAfterArg] = callArgs;
      expect(includeCompletedArg).toBe(false);
      expect(createdAfterArg).toBeInstanceOf(Date);

      // Normalize actual date to start of day for comparison
      const actualDate = new Date(createdAfterArg);

      expect(actualDate.getTime()).toBe(dateInUtc);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return a list of tasks and call TaskController.getTasks with defaults to createdAfter to 7 days ago and includeCompleted according to what was passed in the query', async () => {
      // Mock the getTasks method to return an empty array
      mockController.getTasks.mockReturnValue([]);

      const response = await request(testApp)
        .get('/tasks?includeCompleted=true') // include completed tasks
        .expect(200);

      // Check that getTasks was called with includeCompleted=true and createdAfter approximately 7 days ago (ignoring time)
      expect(mockController.getTasks).toHaveBeenCalledTimes(1);
      const callArgs = mockController.getTasks.mock.calls[0]!;
      const [includeCompletedArg, createdAfterArg] = callArgs;
      expect(includeCompletedArg).toBe(true);
      expect(createdAfterArg).toBeInstanceOf(Date);

      // Calculate expected date (7 days ago, ignoring time)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 7);
      expectedDate.setHours(0, 0, 0, 0); // Normalize to start of day

      // Normalize actual date to start of day for comparison
      const actualDate = new Date(createdAfterArg);
      actualDate.setHours(0, 0, 0, 0);

      expect(actualDate.getTime()).toBe(expectedDate.getTime());

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return a list of tasks and call TaskController.getTasks with createdAfter and includeCompleted = true according to what was passed in the query', async () => {
      // Mock the getTasks method to return an empty array
      mockController.getTasks.mockReturnValue([]);

      const dateInUtc:number = Date.now() - 5 * 24 * 60 * 60 * 1000; // 5 days ago
      
      const response = await request(testApp)
        .get('/tasks?includeCompleted=true&createdAfter=' + dateInUtc) // include completed tasks
        .expect(200);

      // Check that getTasks was called with includeCompleted=true and createdAfter approximately 7 days ago (ignoring time)
      expect(mockController.getTasks).toHaveBeenCalledTimes(1);
      const callArgs = mockController.getTasks.mock.calls[0]!;
      const [includeCompletedArg, createdAfterArg] = callArgs;
      expect(includeCompletedArg).toBe(true);
      expect(createdAfterArg).toBeInstanceOf(Date);

      // Calculate expected date (7 days ago, ignoring time)
      const expectedDate = new Date(dateInUtc);

      // Normalize actual date to start of day for comparison
      const actualDate = new Date(createdAfterArg);


      expect(actualDate.getTime()).toBe(expectedDate.getTime());

      expect(response.body).toBeInstanceOf(Array);
    });

        it('should return a list of tasks and call TaskController.getTasks with createdAfter and includeCompleted =false according to what was passed in the query', async () => {
      // Mock the getTasks method to return an empty array
      mockController.getTasks.mockReturnValue([]);

      const dateInUtc:number = Date.now() - 5 * 24 * 60 * 60 * 1000; // 5 days ago
      
      const response = await request(testApp)
        .get('/tasks?includeCompleted=false&createdAfter=' + dateInUtc) // include completed tasks
        .expect(200);

      // Check that getTasks was called with includeCompleted=true and createdAfter approximately 7 days ago (ignoring time)
      expect(mockController.getTasks).toHaveBeenCalledTimes(1);
      const callArgs = mockController.getTasks.mock.calls[0]!;
      const [includeCompletedArg, createdAfterArg] = callArgs;
      expect(includeCompletedArg).toBe(false);
      expect(createdAfterArg).toBeInstanceOf(Date);

      // Calculate expected date (7 days ago, ignoring time)
      const expectedDate = new Date(dateInUtc);

      // Normalize actual date to start of day for comparison
      const actualDate = new Date(createdAfterArg);


      expect(actualDate.getTime()).toBe(expectedDate.getTime());

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should not return a list of tasks  uncompletedTasks flag has illegal input', async () => {
      // Mock the getTasks method to return an empty array
      mockController.getTasks.mockReturnValue([]);

      const response = await request(testApp)
        .get('/tasks?includeCompleted=invalid') // include completed tasks
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid includeCompleted parameter');
    });

    it('should not return a list of tasks createdAfter flag has illegal input', async () => {
      // Mock the getTasks method to return an empty array
      mockController.getTasks.mockReturnValue([]);

      const response = await request(testApp)
        .get('/tasks?createdAfter=invalid') // include completed tasks
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid createdAfter parameter');
    });
  });

  describe('POST /tasks', () => {
    it('should call TaskController.createTask with the provided task data', async () => {
      const newTask = {
        title: 'New Task',
        taskType: 'create'
      };
      const response = await request(testApp)
        .post('/tasks')
        .send(newTask)
        .expect(200);

      // Check that createTask was called with the correct parameters
      expect(mockController.createTask).toHaveBeenCalledTimes(1);
      const callArgs = mockController.createTask.mock.calls[0]!;
      const [titleArg, assignedToArg, taskTypeArg] = callArgs;
      expect(titleArg).toBe(newTask.title);
      expect(assignedToArg).toBeDefined();
      expect(taskTypeArg).toBe(newTask.taskType);

    });
    it('should validate task type', async () => {
      const newTask = {
        title: 'New Task',
        taskType: 'invalidType'
      };
      const response = await request(testApp)
        .post('/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid task type');
    });
  });
});
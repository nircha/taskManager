import "reflect-metadata";
import { Container } from "inversify";
import { TaskService } from './services/task-service.js';
import express, { Request, Response } from 'express';
import { TaskController } from './controllers/task-controller.js';
import { randomUUID } from 'node:crypto';
import { TaskType } from './modules/task.js';

const PORT = process.env.PORT || 3000;

// Middleware
const container = new Container();
container.bind<TaskController>(TaskController).toSelf();
container.bind<TaskService>(TaskService).toSelf();

export function createApp(customContainer?: Container): express.Application {
  const app = express();
  app.use(express.json());

  // Middleware to log incoming requests
  app.use((req: Request, res: Response, next) => {
    const { method, url, body } = req;
    console.log('[Incoming Request]', JSON.stringify({ method, url, body }));
    next();
    // ... (optional: keep your response logging after next() if you want both)
  });
  // Logging middleware request and response for answered requests
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    const { method, url } = req;
    const chunks: Buffer[] = [];
    const originalWrite = res.write;
    const originalEnd = res.end;
    let responseBody: string | undefined;

    // Capture response body
    (res.write as unknown) = function (chunk: any, ...args: any[]) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return (originalWrite as any).apply(res, [chunk, ...args]);
    };
    (res.end as unknown) = function (chunk: any, ...args: any[]) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      responseBody = Buffer.concat(chunks).toString('utf8');
      return (originalEnd as any).apply(res, [chunk, ...args]);
    };

    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = {
        method,
        url,
        status: res.statusCode,
        durationMs: duration,
        requestBody: req.body,
        responseBody: responseBody || null
      };
      console.log('[Request]', JSON.stringify(log));
    });
    next();
  });
  
  const container = customContainer || new Container();
  if (!customContainer) {
    // Only bind services if no custom container is provided
    container.bind<TaskController>(TaskController).toSelf();
    container.bind<TaskService>(TaskService).toSelf();
  }
  app.get('/tasks', (req: Request, res: Response):void => {
    let includeCompleted = false;
    let createdAfter: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
    if (req.query.includeCompleted) {
      if (req.query.includeCompleted === 'true') {
        includeCompleted = true;
      }
      else if (req.query.includeCompleted === 'false') {
        includeCompleted = false;
      }
      else {
        res.status(400).json({ error: 'Invalid includeCompleted parameter' });
        return;
      }
    }

    if (req.query.createdAfter) {
      const dateInUtc = Number(req.query.createdAfter);
      if (!isNaN(dateInUtc)) {
        createdAfter = new Date(dateInUtc);
      }
      else{
        res.status(400).json({ error: 'Invalid createdAfter parameter' });
        return;
      }
    } else{
      createdAfter.setHours(0, 0, 0, 0); // Normalize to start of day
    }
    try{
      res.json(container.get<TaskController>(TaskController).getTasks(includeCompleted, createdAfter));
    }catch(error){
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.post('/tasks', (req: Request, res: Response):void => {
    const { title, taskType } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    if (!taskType) {
      res.status(400).json({ error: 'Task type is required' });
      return;
    }
    if (!Object.values(TaskType).includes(taskType)) {
      res.status(400).json({ error: 'Invalid task type' });
      return;
    }
    //This would be taken from auth in real world scenario
    const assignedTo = randomUUID();
    const newTask = container.get<TaskController>(TaskController).createTask(title, assignedTo, taskType)
    if (!newTask) {
      res.status(500).json({ error: 'Failed to create task' });
      return;
    }
    //else return the id of the created task
    res.json(newTask.id);
  });


  app.get('/health', (req: Request, res: Response):void => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  }

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  createApp();
}
export default createApp;
import "reflect-metadata";
import { Container } from "inversify";
import { TaskService } from './services/task-service';
import express, { Request, Response } from 'express';
import { TaskController } from './controllers/task-controller';
import { randomUUID } from 'node:crypto';
import { TaskType } from './modules/task';
import {Server} from 'http';
const PORT = process.env.PORT || 3000;

// Middleware
const container = new Container();
container.bind<TaskController>(TaskController).toSelf();
container.bind<TaskService>(TaskService).toSelf();

export function createApp(customContainer?: Container): express.Application {
  const app = express();
  app.use(express.json());
  let server: Server;

  const shutdown = function shutdown() {
    console.log('Shutting down server...');
    if (server) {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }   
  } 

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
      }
    }

    if (req.query.createdAfter) {
      const dateInUtc = Number(req.query.createdAfter);
      if (!isNaN(dateInUtc)) {
        createdAfter = new Date(dateInUtc);
      }
      else{
        res.status(400).json({ error: 'Invalid createdAfter parameter' });
      }
    } else{
      createdAfter.setHours(0, 0, 0, 0); // Normalize to start of day
    }
    res.json(container.get<TaskController>(TaskController).getTasks(includeCompleted, createdAfter));
  });

  app.post('/tasks', (req: Request, res: Response):void => {
    const { title, taskType } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
    }
    if (!taskType) {
      res.status(400).json({ error: 'Task type is required' });
    }
    if (!Object.values(TaskType).includes(taskType)) {
      res.status(400).json({ error: 'Invalid task type' });
    }
    //This would be taken from auth in real world scenario
    const assignedTo = randomUUID();
    const newTask = container.get<TaskController>(TaskController).createTask(title, assignedTo, taskType)
    if (!newTask) {
      res.status(500).json({ error: 'Failed to create task' });
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
    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  }

  return app;
}

const app = createApp();
export default app;
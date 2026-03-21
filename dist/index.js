import "reflect-metadata";
import { Container } from "inversify";
import { TaskService } from './services/task-service.js';
import express from 'express';
import { TaskController } from './controllers/task-controller.js';
import { randomUUID } from 'node:crypto';
import { TaskType } from './modules/task.js';
const PORT = process.env.PORT || 3000;
const container = new Container();
container.bind(TaskController).toSelf();
container.bind(TaskService).toSelf();
export function createApp(customContainer) {
    const app = express();
    app.use(express.json());
    let server;
    const shutdown = function shutdown() {
        console.log('Shutting down server...');
        if (server) {
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        }
        else {
            process.exit(0);
        }
    };
    const container = customContainer || new Container();
    if (!customContainer) {
        container.bind(TaskController).toSelf();
        container.bind(TaskService).toSelf();
    }
    app.get('/tasks', (req, res) => {
        let includeCompleted = false;
        let createdAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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
            else {
                res.status(400).json({ error: 'Invalid createdAfter parameter' });
                return;
            }
        }
        else {
            createdAfter.setHours(0, 0, 0, 0);
        }
        try {
            res.json(container.get(TaskController).getTasks(includeCompleted, createdAfter));
        }
        catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    });
    app.post('/tasks', (req, res) => {
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
        const assignedTo = randomUUID();
        const newTask = container.get(TaskController).createTask(title, assignedTo, taskType);
        if (!newTask) {
            res.status(500).json({ error: 'Failed to create task' });
            return;
        }
        res.json(newTask.id);
    });
    app.get('/health', (req, res) => {
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
if (process.env.NODE_ENV !== 'test') {
    createApp();
}
export default createApp;
//# sourceMappingURL=index.js.map
# Task Manager API

This service allows users to add new tasks to the list of tasks to be executed, and get the list of exists tasks with their status.

Important:
Usually I would also move the server to use https, but since this is an exercise, and I didn't think that I was being tested on being able to create a certificate from a certificate authority, I assume it will be okay to focus on the other aspects of the exercise.


## Scalability
If traffic spikes 10x tomorrow, what changes would you make to this architecture?
- As specified in the requirements, I chose to use an in memory task db, I change that to atlas mongoDB (this will of course require changing the tests in task-service.test.ts), this will ensure that if more servers are created, they would all share the same list of registered tasks, and make it stateless and therefore will support horizontal scaling. This will also require that I add sanitization for example to remove '$' to prevent noSql injection, which is currently not relevant
- I would configure auto scaling policies to automatically add or remove application instances based on average CPU utilization (e.g., scale up when CPU > 70%, scale down when CPU < 30%). This ensures the system can handle increased load efficiently and reduces costs during low-traffic periods.
- I would move to ECS (inside infra-stack.ts ) so that I can easily add more nodes, so that the autoscaling configurations will create some of the machines on other machines, to make sure my machine isn't choked ( adding 3 more instances, when the machine is already at 80% CPU for example, won't resolve the issue), and add more nodes into the auto scaling configuration I mentioned above
- I would add and ALB (via infra-stack.ts of course) that will spread the incoming requests to different nodes, so the requests are spread across different servers, and different nodes


## Observability
How would you track errors in production?
- I have already configured the awslogger in the docker images, so all logs are registerd to CloudWatch, and are structured to allow easy usage, but I would add alerts and monitoring to CloudWatch, and create a CloudWatch Dashboard
- I would add the container IP to the logs, so I can differentitate between logs from different containers
- I would use external uptime monitoring (e.g., Route 53 health checks, third-party services) to detect outages
- I would emit custom application metrics (e.g. error rates, request latency) to CloudWatch for insights

## Features

- **TypeScript**: Latest version with strict configuration
- **Express.js**: RESTful API framework
- **Jest**: Testing framework with supertest for API testing
- **Docker**: Multi-stage build for optimized production containers
- **Hot Reload**: Development server with tsx

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Building

Build the TypeScript code:
```bash
npm run build
```

## Production

Start the production server:
```bash
npm start
```

## Docker

Build and run with Docker Compose:
```bash
docker-compose up --build
```

## API Endpoints

- `GET /tasks?includeCompleted={true\false}&createdAfter={epoch time} ` - Get all the tasks any user has added to the list of tasks uncompleted\ or completed + uncompleted defaults to false, which were created after {epoch time} 
- `POST /tasks` - Add a new task, the body must contain a valid Task object
- `GET /health` - Health check

## Project Structure

```
├── src/                  # Main application files
├── tests/                # Unit tests for the project
├── infra/                # AWS setup for project, see README.MD file for more details
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run bootstrap:show-template` - see See [infra/README.md](infra/README.md)
- `npm run bootstrap` - see See [infra/README.md](infra/README.md)
- `npm run deploy` - see See [infra/README.md](infra/README.md)
- `npm run destroy` - see See [infra/README.md](infra/README.md)
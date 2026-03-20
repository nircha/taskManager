# Task Manager API

This service allows users to add new tasks to the list of tasks to be executed, and get the list of exists tasks with their status

## Features

- **TypeScript**: Latest version with strict configuration
- **Express.js**: RESTful API framework
- **Jest**: Testing framework with supertest for API testing
- **Docker**: Multi-stage build for optimized production containers
- **ESLint**: Code linting with TypeScript support
- **Hot Reload**: Development server with ts-node-dev

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
├── tsconfig.json         # TypeScript configuration
└── .eslintrc.js          # ESLint configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
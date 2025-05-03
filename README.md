# Smart Farm Mobile

A Smart Farm monitoring and control mobile application built with React Native and Expo.

## Features

- Real-time monitoring of farm environment data
- Remote control of farm equipment
- User authentication and management
- Analytics and reporting
- Notifications and alerts

## API Integration

This application has been integrated with a backend API following the Prisma schema. The integration is implemented through a service layer located in `service/api/`:

### API Services

- **Garden Service** (`service/api/garden.service.ts`): Manages garden creation, retrieval, updates, and deletion.
- **Sensor Service** (`service/api/sensor.service.ts`): Handles sensor data operations and garden monitoring.
- **Plant Service** (`service/api/plant.service.ts`): Provides plant information, growth stages, and care instructions.
- **Task Service** (`service/api/task.service.ts`): Manages garden tasks, activities, and evaluations.
- **Community Service** (`service/api/community.service.ts`): Handles social features like posts, comments, and following.
- **Weather Service** (`service/api/weather.service.ts`): Provides weather data, forecasts, and alerts.
- **User Service** (`service/api/user.service.ts`): Manages user profiles and account settings.

All API services are exported from `service/api/index.ts` for easy importing throughout the application.

### API Documentation

The full API documentation is available in `docs/api_documentation.md`. It contains detailed information about all endpoints, request/response formats, and error handling.

### Implementation Details

- All services use `apiClient` for HTTP requests with proper authentication
- Data types and interfaces match the Prisma schema for type safety
- Proper error handling is implemented throughout the application
- Services follow consistent patterns for maintainability

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/smart-farm-mobile.git
cd smart-farm-mobile
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Environment configuration:
   The project uses two environment files:

   - `.env` - Default development environment (points to localhost)
   - `.env.production` - Production environment

   The default `.env` file is set up with localhost:8080 as the API URL.

4. Start the development server:

```bash
npm start
# or
yarn start
```

## Environment Configuration

The application uses environment files to configure API settings with proper React Native support. The following variables are supported:

| Variable    | Description                        | Development Default   | Production Default              |
| ----------- | ---------------------------------- | --------------------- | ------------------------------- |
| API_URL     | Base URL for API requests          | http://localhost:8080 | https://your-production-api.com |
| API_TIMEOUT | Request timeout in milliseconds    | 20000                 | 20000                           |
| API_VERSION | API version                        | v1                    | v1                              |
| API_DEBUG   | Enable debug logging for API calls | true                  | false                           |

### How Environment Variables Work

This project uses environment variables to ensure proper configuration:

- Environment variables are securely loaded at build time
- Strong TypeScript support with type definitions in `env.d.ts`
- Centralized configuration in `config/environment.ts`
- Fallback default values for safety

## Project Structure

- `app/` - Expo Router application screens
- `components/` - Reusable UI components
- `config/` - Configuration files
- `constants/` - Application constants
- `contexts/` - React contexts
- `hooks/` - Custom React hooks
- `modules/` - Feature modules
- `service/` - API services
- `store/` - State management
- `utils/` - Utility functions

## API Configuration

API requests are centralized through the `apiClient` service, which:

- Uses Axios for HTTP requests
- Automatically adds authentication tokens to requests
- Handles token expiration and logout
- Provides optional debug logging for API calls
- Uses environment variables for configuration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

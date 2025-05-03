# Smart Farm Mobile - API Documentation

This document outlines the API endpoints required by the mobile application based on the Prisma schema. All endpoints should conform to the Prisma models and handle proper error responses.

## Base URL

The base URL is configured in the environment variables as `apiUrl` and is extended with `apiVersion` (e.g., `/api/v1`).

## Authentication Endpoints

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "string",
    "refresh_token": "string",
    "user": {
      "id": "number",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "username": "string",
      "roleId": "number",
      "role": {
        "id": "number",
        "name": "string"
      },
      "profilePicture": "string",
      "isAdmin": "boolean",
      "isGardener": "boolean"
    }
  }
  ```

### Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "username": "string",
    "password": "string",
    "phoneNumber": "string (optional)",
    "dateOfBirth": "string (optional)",
    "address": "string (optional)",
    "bio": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "id": "number",
    "username": "string",
    "email": "string",
    "message": "string"
  }
  ```

### Refresh Token

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <refresh_token>`
- **Response**:
  ```json
  {
    "access_token": "string",
    "refresh_token": "string"
  }
  ```

### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```json
  {
    "message": "string"
  }
  ```

### Get Current User

- **URL**: `/user/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```json
  {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "username": "string",
    "roleId": "number",
    "role": {
      "id": "number",
      "name": "string"
    },
    "phoneNumber": "string",
    "dateOfBirth": "string",
    "profilePicture": "string",
    "address": "string",
    "bio": "string",
    "isAdmin": "boolean",
    "isGardener": "boolean",
    "experiencePoints": "number",
    "experienceLevel": {
      "id": "number",
      "level": "number",
      "title": "string",
      "icon": "string"
    }
  }
  ```

## User Profile Endpoints

### Get User Profile

- **URL**: `/user/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Same as Get Current User

### Update User Profile

- **URL**: `/user/profile`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "firstName": "string (optional)",
    "lastName": "string (optional)",
    "email": "string (optional)",
    "phoneNumber": "string (optional)",
    "dateOfBirth": "string (optional)",
    "address": "string (optional)",
    "bio": "string (optional)"
  }
  ```
- **Response**: Updated user object

### Update Profile Picture

- **URL**: `/user/profile`
- **Method**: `PATCH`
- **Headers**:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: multipart/form-data`
- **Form Data**:
  - `profilePicture`: File
- **Response**: Updated user object with new profile picture URL

### Get Experience Progress

- **URL**: `/user/experience-progress`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```json
  {
    "currentPoints": "number",
    "currentLevel": {
      "id": "number",
      "level": "number",
      "minXP": "number",
      "maxXP": "number",
      "title": "string",
      "description": "string",
      "icon": "string"
    },
    "nextLevel": {
      "id": "number",
      "level": "number",
      "minXP": "number",
      "maxXP": "number",
      "title": "string",
      "description": "string",
      "icon": "string"
    },
    "pointsToNextLevel": "number",
    "percentToNextLevel": "number",
    "recentActivities": [
      {
        "id": "number",
        "name": "string",
        "timestamp": "string",
        "points": "number"
      }
    ]
  }
  ```

## Garden Endpoints

### Get All Gardens

- **URL**: `/gardens`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```json
  [
    {
      "id": "number",
      "gardenKey": "string",
      "name": "string",
      "street": "string",
      "ward": "string",
      "district": "string",
      "city": "string",
      "lat": "number",
      "lng": "number",
      "gardenerId": "number",
      "type": "INDOOR | OUTDOOR | BALCONY | ROOFTOP | WINDOW_SILL",
      "status": "ACTIVE | INACTIVE",
      "plantName": "string",
      "plantGrowStage": "string",
      "plantStartDate": "string",
      "plantDuration": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Get Garden by ID

- **URL**: `/gardens/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Garden object with additional related data:
  ```json
  {
    "id": "number",
    "gardenKey": "string",
    "name": "string",
    "street": "string",
    "ward": "string",
    "district": "string",
    "city": "string",
    "lat": "number",
    "lng": "number",
    "gardenerId": "number",
    "type": "INDOOR | OUTDOOR | BALCONY | ROOFTOP | WINDOW_SILL",
    "status": "ACTIVE | INACTIVE",
    "plantName": "string",
    "plantGrowStage": "string",
    "plantStartDate": "string",
    "plantDuration": "number",
    "sensors": [
      {
        "id": "number",
        "sensorKey": "string",
        "type": "HUMIDITY | TEMPERATURE | LIGHT | WATER_LEVEL | RAINFALL | SOIL_MOISTURE | SOIL_PH",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "latestSensorData": {
      "HUMIDITY": {
        "id": "number",
        "value": "number",
        "timestamp": "string"
      },
      "TEMPERATURE": {
        "id": "number",
        "value": "number",
        "timestamp": "string"
      }
    },
    "currentWeather": {
      "id": "number",
      "observedAt": "string",
      "temp": "number",
      "feelsLike": "number",
      "humidity": "number",
      "weatherMain": "string",
      "weatherDesc": "string",
      "iconCode": "string"
    },
    "activeAlerts": [
      {
        "id": "number",
        "type": "string",
        "message": "string",
        "timestamp": "string",
        "status": "string"
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Create Garden

- **URL**: `/gardens`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "street": "string (optional)",
    "ward": "string (optional)",
    "district": "string (optional)",
    "city": "string (optional)",
    "lat": "number (optional)",
    "lng": "number (optional)",
    "type": "INDOOR | OUTDOOR | BALCONY | ROOFTOP | WINDOW_SILL",
    "plantName": "string (optional)",
    "plantGrowStage": "string (optional)",
    "plantStartDate": "string (optional)",
    "plantDuration": "number (optional)"
  }
  ```
- **Response**: Created garden object

### Update Garden

- **URL**: `/gardens/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: Same fields as create, all optional
- **Response**: Updated garden object

### Delete Garden

- **URL**: `/gardens/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```json
  {
    "message": "Garden deleted successfully"
  }
  ```

## Sensor Endpoints

### Get Garden Sensors

- **URL**: `/gardens/:gardenId/sensors`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
  ```json
  [
    {
      "id": "number",
      "sensorKey": "string",
      "type": "HUMIDITY | TEMPERATURE | LIGHT | WATER_LEVEL | RAINFALL | SOIL_MOISTURE | SOIL_PH",
      "gardenId": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Get Sensor Data

- **URL**: `/sensors/:sensorId/data`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `startDate`: ISO date string (optional)
  - `endDate`: ISO date string (optional)
  - `limit`: number (optional)
  - `offset`: number (optional)
- **Response**:
  ```json
  [
    {
      "id": "number",
      "sensorId": "number",
      "timestamp": "string",
      "value": "number",
      "gardenId": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Get Garden Sensor Data

- **URL**: `/gardens/:gardenId/sensor-data`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `startDate`: ISO date string (optional)
  - `endDate`: ISO date string (optional)
  - `limit`: number (optional)
  - `sensorType`: "HUMIDITY | TEMPERATURE | LIGHT | WATER_LEVEL | RAINFALL | SOIL_MOISTURE | SOIL_PH" (optional)
- **Response**:
  ```json
  {
    "HUMIDITY": [
      {
        "id": "number",
        "sensorId": "number",
        "timestamp": "string",
        "value": "number"
      }
    ],
    "TEMPERATURE": [
      {
        "id": "number",
        "sensorId": "number",
        "timestamp": "string",
        "value": "number"
      }
    ]
  }
  ```

## Weather Endpoints

### Get Current Weather

- **URL**: `/gardens/:gardenId/weather/current`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: WeatherObservation object

### Get Hourly Forecast

- **URL**: `/gardens/:gardenId/weather/hourly`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `hours`: number (default 24)
- **Response**: Array of HourlyForecast objects

### Get Daily Forecast

- **URL**: `/gardens/:gardenId/weather/daily`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `days`: number (default 7)
- **Response**: Array of DailyForecast objects

## Task & Activity Endpoints

### Get Tasks

- **URL**: `/tasks`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `status`: "PENDING | COMPLETED | SKIPPED" (optional)
  - `dueDate`: ISO date string (optional)
- **Response**: Array of Task objects

### Get Garden Tasks

- **URL**: `/gardens/:gardenId/tasks`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**: Same as Get Tasks
- **Response**: Array of Task objects for specific garden

### Create Task

- **URL**: `/tasks`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "gardenId": "number",
    "plantTypeName": "string (optional)",
    "plantStageName": "string (optional)",
    "type": "string",
    "description": "string",
    "dueDate": "string",
    "wateringScheduleId": "number (optional)"
  }
  ```
- **Response**: Created Task object

### Complete Task

- **URL**: `/tasks/:taskId/complete`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Updated Task object with status COMPLETED

### Skip Task

- **URL**: `/tasks/:taskId/skip`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Updated Task object with status SKIPPED

### Upload Task Photo

- **URL**: `/tasks/:taskId/photo`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: multipart/form-data`
- **Form Data**:
  - `photo`: File (required)
  - `plantName`: string (optional)
  - `plantGrowStage`: string (optional)
- **Response**: PhotoEvaluation object

### Get Activities

- **URL**: `/activities`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `type`: ActivityType (optional)
  - `startDate`: ISO date string (optional)
  - `endDate`: ISO date string (optional)
- **Response**: Array of GardenActivity objects

### Get Garden Activities

- **URL**: `/gardens/:gardenId/activities`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**: Same as Get Activities
- **Response**: Array of GardenActivity objects for specific garden

### Create Activity

- **URL**: `/activities`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "gardenId": "number",
    "name": "string",
    "activityType": "PLANTING | WATERING | FERTILIZING | PRUNING | HARVESTING | PEST_CONTROL | SOIL_TESTING | WEEDING | OTHER",
    "timestamp": "string",
    "plantName": "string (optional)",
    "plantGrowStage": "string (optional)",
    "humidity": "number (optional)",
    "temperature": "number (optional)",
    "lightIntensity": "number (optional)",
    "waterLevel": "number (optional)",
    "rainfall": "number (optional)",
    "soilMoisture": "number (optional)",
    "soilPH": "number (optional)",
    "details": "string (optional)",
    "reason": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response**: Created GardenActivity object

## Plant Endpoints

### Get Plant Types

- **URL**: `/plants/types`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Array of PlantType objects

### Get Plants

- **URL**: `/plants`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `type`: PlantType ID (optional)
  - `search`: string (optional)
- **Response**: Array of Plant objects

### Get Plant Growth Stages

- **URL**: `/plants/:plantId/growth-stages`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Array of GrowthStage objects

## Community Endpoints

### Get Posts

- **URL**: `/posts`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `tag`: string (optional)
  - `search`: string (optional)
  - `gardenerId`: number (optional)
  - `plantName`: string (optional)
  - `page`: number (optional)
  - `limit`: number (optional)
- **Response**: Array of Post objects

### Get Post by ID

- **URL**: `/posts/:postId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Post object with comments and author details

### Create Post

- **URL**: `/posts`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: multipart/form-data` (if images included)
- **Form Data**:
  - `title`: string (required)
  - `content`: string (required)
  - `gardenId`: number (optional)
  - `plantName`: string (optional)
  - `plantGrowStage`: string (optional)
  - `tagIds`: array of numbers (optional)
  - `images[]`: Files (optional)
- **Response**: Created Post object

### Get Post Comments

- **URL**: `/posts/:postId/comments`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Array of Comment objects

### Create Comment

- **URL**: `/posts/:postId/comments`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "postId": "number",
    "parentId": "number (optional for replies)",
    "content": "string"
  }
  ```
- **Response**: Created Comment object

### Vote on Post

- **URL**: `/posts/:postId/vote`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "voteValue": "number (1 for upvote, -1 for downvote, 0 for removing vote)"
  }
  ```
- **Response**:
  ```json
  {
    "total_vote": "number",
    "userVote": "number"
  }
  ```

### Get Tags

- **URL**: `/tags`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Array of Tag objects

### Get User Followers

- **URL**: `/gardeners/:gardenerId/followers`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Array of FollowInfo objects

### Follow User

- **URL**: `/follow/:gardenerId`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: FollowInfo object

### Unfollow User

- **URL**: `/follow/:gardenerId`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Success message

## Alert Endpoints

### Get Alerts

- **URL**: `/alerts`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `status`: AlertStatus (optional)
  - `type`: AlertType (optional)
- **Response**: Array of Alert objects

### Get Garden Alerts

- **URL**: `/gardens/:gardenId/alerts`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**: Same as Get Alerts
- **Response**: Array of Alert objects for specific garden

### Resolve Alert

- **URL**: `/alerts/:alertId/resolve`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Updated Alert object with status RESOLVED

## Error Responses

All API endpoints should return proper error responses with appropriate HTTP status codes:

- **400 Bad Request**: Validation errors or missing required fields
- **401 Unauthorized**: Authentication failure or expired token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

Error response format:

```json
{
  "statusCode": "number",
  "message": "string",
  "error": "string"
}
```

## Implementation Notes

1. All authenticated endpoints require a valid JWT token in the Authorization header
2. Dates should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
3. Boolean filters should accept true/false or 1/0
4. Implement proper pagination for list endpoints with large result sets
5. Ensure proper validation of request bodies and parameters
6. Use proper HTTP status codes for responses
7. Implement CORS for the mobile client
8. Add rate limiting for security
9. Implement proper error handling and logging

# Express JWT Todo App

This project is a simple Todo application built with Node.js, Express, and MongoDB. It provides user authentication with JWT, CRUD operations for todos, and rate limiting for API endpoints.

## Features

- User Authentication (Sign-up and Sign-in) with JWT.
- Refresh token mechanism for renewing access tokens.
- Todo CRUD operations (Create, Read, Update, Delete).
- Rate limiting: Users can add up to 10 todos every 15 minutes.
- CORS support for specific origins.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo-link.git
   ```

2. Navigate to the project directory:
   ```bash
   cd your-repo-folder
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

#### Sign-Up
- **POST** `/signup`
  - Request Body:
    ```json
    {
      "username": "example",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "message": "User created"
    }
    ```

#### Sign-In
- **POST** `/signin`
  - Request Body:
    ```json
    {
      "username": "example",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "accessToken": "<JWT_TOKEN>"
    }
    ```

#### Refresh Token
- **POST** `/token`
  - Response:
    ```json
    {
      "accessToken": "<NEW_JWT_TOKEN>"
    }
    ```

### To-Do Operations

#### Get All Todos
- **GET** `/todos`
  - Headers:
    ```json
    {
      "Authorization": "Bearer <JWT_TOKEN>"
    }
    ```
  - Response:
    ```json
    [
      {
        "_id": "todoId",
        "content": "Learn Node.js",
        "createdAt": "2024-12-23T00:00:00.000Z"
      }
    ]
    ```

#### Create a Todo
- **POST** `/todos`
  - Headers:
    ```json
    {
      "Authorization": "Bearer <JWT_TOKEN>"
    }
    ```
  - Request Body:
    ```json
    {
      "content": "New Todo Item"
    }
    ```
  - Response:
    ```json
    {
      "_id": "todoId",
      "content": "New Todo Item",
      "createdAt": "2024-12-23T00:00:00.000Z"
    }
    ```

#### Update a Todo
- **PUT** `/todos/:id`
  - Headers:
    ```json
    {
      "Authorization": "Bearer <JWT_TOKEN>"
    }
    ```
  - Request Body:
    ```json
    {
      "content": "Updated Todo Item"
    }
    ```
  - Response:
    ```json
    {
      "_id": "todoId",
      "content": "Updated Todo Item",
      "createdAt": "2024-12-23T00:00:00.000Z"
    }
    ```

#### Delete a Todo
- **DELETE** `/todos/:id`
  - Headers:
    ```json
    {
      "Authorization": "Bearer <JWT_TOKEN>"
    }
    ```
  - Response:
    ```json
    {
      "message": "Todo deleted"
    }
    ```

### Rate Limiting

- Users can create up to 10 todos within 15 minutes.
- After exceeding the limit, users must wait 3 minutes to add more todos.

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database.
- **JWT**: For secure user authentication.
- **Rate Limiting**: To prevent abuse of the API.
- **CORS**: To allow specific origins.


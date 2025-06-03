# README.md

# Event Booking Backend

This project is an Event Booking Backend application built with Node.js and Express. It provides a RESTful API for managing events, bookings, and user authentication.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd event-booking-backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Create a `.env` file in the root directory and add your environment variables (see [Environment Variables](#environment-variables) section).

2. Start the server:
   ```
   npm start
   ```

3. The server will run on `http://localhost:3000`.

## API Endpoints

- **Authentication**
  - `POST /api/auth/login` - Login a user
  - `POST /api/auth/register` - Register a new user

- **Events**
  - `GET /api/events` - Get all events
  - `POST /api/events` - Create a new event
  - `PUT /api/events/:id` - Update an event
  - `DELETE /api/events/:id` - Delete an event

- **Bookings**
  - `GET /api/bookings` - Get all bookings
  - `POST /api/bookings` - Create a new booking

- **Users**
  - `GET /api/users/:id` - Get user profile
  - `PUT /api/users/:id` - Update user profile

## Testing

To run the tests, use the following command:
```
npm test
```

## Environment Variables

The following environment variables are required:

- `DATABASE_URL` - Connection string for the database
- `JWT_SECRET` - Secret key for JWT authentication
- `EMAIL_SERVICE` - Email service provider
- `EMAIL_USER` - Email account for sending notifications
- `EMAIL_PASS` - Password for the email account

## License

This project is licensed under the MIT License.
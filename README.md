# ![ELLA Logo](src/public/assets/ELLA%20small.png) ELLA - Edugrade Location & Logistics Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-5.2.1-blue)](https://expressjs.com/)

A comprehensive room booking system built for educational environments featuring three distinct user roles: Admin, Teacher, and Student. The system provides a modern, responsive interface with role-based access control and real-time booking management.

> 📸 **[View Screenshots](SCREENSHOTS.md)** to see the application in action!  
> 🚀 **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes!

## 📋 Table of Contents

- [Features Overview](#features-overview)
- [Technology Stack](#technology-stack)
- [Security](#security)
- [UI/UX Features](#uiux-features)
- [Technical Highlights](#technical-highlights)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

## Features Overview

### Booking Management
* Book study rooms with date selection, start time, and duration (2h, 4h, 6h, or 8h)
* Cancel active bookings
* View bookings categorized as "Upcoming" and "History"
* Filter out cancelled bookings via checkbox
* Validation prevents bookings on weekends and after 7:00 PM

### Room Administration (Admin)
* Create new rooms with name, type, capacity, floor, and equipment
* Edit existing rooms
* Delete rooms with safety confirmation
* Dashboard shows available/occupied rooms

### User Management (Admin)
* Create users with name, email, password, and role
* Edit user information
* Delete users
* Search for users via search field
* Filter users by role (Student/Teacher/Admin)
* Dropdown for quick access to specific users

### Dashboard & Statistics (Admin)
* Total rooms and available rooms count
* Active bookings and total bookings statistics
* Real-time updates on changes

## Technology Stack
* **Frontend:** HTML5, CSS3 (with CSS variables), Vanilla JavaScript
* **Backend:** Node.js with Express
* **Database:** SQLite3
* **Authentication:** Session-based with cookies and scrypt for password hashing
* **Architecture:** MVC structure with middleware for authentication and authorization


## Security
* Role-Based Access Control (RBAC) – each role has specific permissions
* Password hashing with scrypt
* Session management with automatic cleanup of expired sessions
* Protected API endpoints – requires authentication
* Input validation on both frontend and backend
 
## UI/UX Features
* Responsive design – works on desktop, tablet, and mobile
* Toast notifications for action feedback
* Modal dialogs for bookings and forms with nudge animation on invalid input
* Confirmation dialogs for user/room deletion
* Dark mode support via CSS variables
* Accessibility features with semantic HTML and ARIA attributes

## Technical Highlights
* **Modular JavaScript** – code is organized into reusable components (BookingModal, UserModal, RoomModal)
* **API Wrapper** – centralized handling of all API calls
* **Error Handling** – translation of technical error messages to user-friendly text
* **State Management** – local management of users, rooms, and bookings with filtering
* **Optimized Rendering** – efficient UI updates based on filter selections

## Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/discovicke/ella-room-booking-system.git
cd ella-room-booking-system
```

2. Install dependencies
```bash
npm install
```

3. The database will be automatically created and seeded on first run

4. Start the server
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:80
```

### Demo Accounts

For testing purposes, the following accounts are pre-configured:

| Email                 | Password   | Role |
|-----------------------|------------|------|
| admin@edugrade.com    | lösen123   | Admin |
| larare@edugrade.com   | lösen123 | Teacher |
| elev@edu.edugrade.com | lösen123     | Student |

## 📡 API Overview

The application exposes a RESTful API with the following main endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

### Bookings
- `GET /api/bookings` - Get all bookings (filtered by role)
- `POST /api/bookings` - Create a new booking
- `DELETE /api/bookings/:id` - Cancel a booking

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a room (Admin only)
- `PUT /api/rooms/:id` - Update a room (Admin only)
- `DELETE /api/rooms/:id` - Delete a room (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create a user (Admin only)
- `PUT /api/users/:id` - Update a user (Admin only)
- `DELETE /api/users/:id` - Delete a user (Admin only)

All API endpoints require authentication via session cookies, except for the login endpoint.

## Project Structure

```
src/
├── modules/          # Feature modules (auth, bookings, rooms, users)
├── middleware/       # Authentication and authorization
├── public/          # Frontend assets and pages
│   ├── components/  # Reusable UI components
│   ├── pages/       # Role-specific pages
│   └── utils/       # Frontend utilities
├── db/              # Database connection
└── utils/           # Backend utilities
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Developers

**Viktor Johansson**
- LinkedIn: [linkedin.com/in/dittnamn](https://linkedin.com/in/dittnamn)
- GitHub: [@discovicke](https://github.com/discovicke)

**Christian Gennari**
- LinkedIn: [linkedin.com/in/christiangennari](https://linkedin.com/in/christiangennari)
- GitHub: [@Christian-Gennari](https://github.com/Christian-Gennari)

**Markus Lööv**
- LinkedIn: [linkedin.com/in/markusloov](https://linkedin.com/in/markusloov)
- GitHub: [@LeafMaster1](https://github.com/LeafMaster1)

**André Pontén**
- LinkedIn: [linkedin.com/in/andrepponten](https://linkedin.com/in/andrepponten)
- GitHub: [@aponten](https://github.com/aponten)
---

## Acknowledgments

- **Nunito Sans** - Font från Google Fonts
- **Node.js Community** - För fantastiska verktyg och libraries
- **Express.js** - För ett robust web framework
- **SQLite** - För en enkel och effektiv databas

ELLA demonstrates a complete modern web application with clear separation between frontend and backend, secure authentication, and a user-friendly interface design. The system is modular enough to integrate with other databases for real-world implementation.


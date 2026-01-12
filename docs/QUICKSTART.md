# Quick Start Guide

This guide will help you get ELLA up and running in under 5 minutes.

## Prerequisites

Make sure you have Node.js installed:
```bash
node --version  # Should be 18.0.0 or higher
```

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ella-room-booking-system.git
cd ella-room-booking-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```

That's it! The server will start on port 80.

## Access the Application

Open your browser and go to:
```
http://localhost:80
```

## Login Credentials

Use one of these test accounts to log in:

### Admin Account
- **Email:** admin@edugrade.com
- **Password:** lösen123
- **Access:** Full system control, user management, room management, statistics

### Teacher Account
- **Email:** larare@edugrade.com
- **Password:** lösen123
- **Access:** Create bookings, view all rooms, priority booking

### Student Account
- **Email:** elev@edu.edugrade.com
- **Password:** lösen123
- **Access:** Create personal bookings, view available rooms

## What to Try

### As a Student:
1. Browse available rooms
2. Create a booking by selecting a room, date, and time
3. View your upcoming bookings
4. Cancel a booking

### As a Teacher:
- Same as student, plus priority access during peak times

### As an Admin:
1. View the dashboard with system statistics
2. Create a new room
3. Edit or delete existing rooms
4. Create new users
5. Manage all bookings

## Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## Troubleshooting

### Port 80 Already in Use
If port 80 is already in use, you can change it in `src/server.js`:
```javascript
const PORT = 3000;
```

### Database Issues
The database is automatically created on first run. If you encounter issues:
1. Stop the server
2. Delete the `data/` folder
3. Restart the server (database will be recreated)

### Permission Denied on Port 80
On macOS/Linux, port 80 requires elevated privileges. Either:
- Run with sudo: `sudo npm start`
- Change to a higher port (e.g., 3000) as described above

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [GUIDE.md](GUIDE.md) for the project architecture
- View [SCREENSHOTS.md](SCREENSHOTS.md) to see all features
- Read [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute

## Need Help?

- Check existing issues on GitHub
- Create a new issue if you find a bug
- Read the code comments for implementation details

Happy booking! 🎉


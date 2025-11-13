# Brandeis Students & Alumni Association (BSAA)

A full-stack web application built with Node.js, Express, MongoDB, and Socket.IO that connects Brandeis University students and alumni through job postings, events, and real-time chat functionality.

## 🎯 Features

- **User Authentication & Authorization**: Secure registration and login system with role-based access control (students, alumni, and admin)
- **Job Board**: Post, browse, edit, and delete job opportunities with validation and filtering
- **Event Management**: Create and manage campus events with RSVP functionality and real-time updates via modal interface
- **Real-time Chat**: Socket.IO-powered chat room for logged-in users to communicate instantly
- **RESTful API**: Token-based API endpoints for event data with user-specific filtering
- **Responsive Design**: Clean, accessible interface with custom CSS styling and Bootstrap integration

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- Passport.js for authentication
- Socket.IO for real-time communication
- Express Validator for input validation

**Frontend:**
- EJS templating engine
- jQuery for AJAX requests and DOM manipulation
- Bootstrap for responsive modals
- Custom CSS with modern design patterns

**Security & Best Practices:**
- Password hashing with passport-local-mongoose
- API token authentication
- Input sanitization and validation
- Method override for RESTful routing

## 📁 Project Structure

```
├── controllers/          # Business logic for routes
│   ├── chatController.js
│   ├── eventsController.js
│   ├── jobsController.js
│   └── usersController.js
├── models/              # MongoDB schemas
│   ├── event.js
│   ├── job.js
│   ├── message.js
│   └── user.js
├── routes/              # Express route definitions
├── views/               # EJS templates
│   ├── events/
│   ├── jobs/
│   └── users/
├── public/              # Static assets (CSS, JS, images)
└── index.js             # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd brandeis-saa
```

2. Install dependencies
```bash
npm install
```

3. Start MongoDB
```bash
mongod
```

4. Run the application
```bash
node index.js
```

5. Access the application at `http://localhost:8080`

## 💡 Key Functionalities

### Event Management with RSVP System
- Users can create events with detailed information (title, description, location, dates, registration links)
- RSVP functionality allows users to join events
- API endpoint filters events based on user's RSVP status
- Real-time modal interface for quick event browsing

### Job Posting Platform
- Create, read, update, and delete job listings
- Validation for salary (integer), email format, and required fields
- Only job creators and admins can edit/delete posts
- Automatic tracking of post creation date

### Real-time Communication
- Socket.IO-powered chat room
- Message persistence in MongoDB
- User identification in chat messages
- Visual notifications for new messages

### Access Control
- Role-based permissions (student, alumni, admin)
- Users can only edit/delete their own content
- Admin users have full CRUD access
- Protected routes require authentication

## 🔐 Security Features

- Passport.js authentication with local strategy
- Password hashing and salting
- API token generation for secure endpoint access
- Input validation and sanitization
- CSRF protection through method override

## 📝 API Endpoints

```
GET  /api/events              # Get all events (requires API token)
GET  /api/events/:id/join     # RSVP to an event (requires API token)
```

## 🎨 Design Highlights

- Custom CSS with CSS variables for consistent theming
- Responsive layout with flexbox
- Clean typography using Google Fonts (Roboto & Lora)
- Accessible color contrast (primary dark blue, light gray backgrounds)
- Hover effects and transitions for better UX

## 👥 User Roles

- **Students**: Can create jobs/events, RSVP, and participate in chat
- **Alumni**: Same permissions as students
- **Admin**: Full access to edit/delete any content

## 📊 Database Models

### User Schema
- Authentication fields (email, password)
- Profile information (name, major, graduation year)
- Location data (city, state, country, zipCode)
- Professional info (job, company, bio, interests)
- RSVP tracking (events array)

### Event Schema
- Event details (title, description, location, dates)
- Organizer and attendee references
- RSVP list with populated user data
- Creator tracking for permissions

### Job Schema
- Job information (title, company, location, description)
- Requirements and salary
- Contact details
- Active status and deadline tracking

### Message Schema
- Chat message content
- User reference and username
- Timestamp for message ordering

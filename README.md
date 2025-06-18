# Superhero Website

A modern, dark-themed website that displays information about superheroes using the Superhero API.

## Features
- Dark, futuristic, and responsive design
- View list of superheroes (with search and pagination)
- View detailed superhero info
- User registration and login (with secure password hashing)
- User profile page (protected)
- Error handling and user feedback
- Built with Node.js, Express, EJS, MongoDB, and Bootstrap

## Setup Instructions

### 1. Clone the Repository
```
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install Dependencies
```
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```
PORT=3000
SESSION_SECRET=your_secret_key
SUPERHERO_API_KEY=your_superheroapi_key
```

If using local MongoDB (recommended for development):
```
# No need to set MONGODB_URI, defaults to mongodb://localhost:27017/superhero-db
```
If using MongoDB Atlas (for production):
```
MONGODB_URI=your_atlas_connection_string
```

### 4. Seed the Database with Superheroes
```
npm run seed
```
This will fetch superhero data from the API and store it in your database.

### 5. Start the Application
```
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
├── models/         # Database models
├── views/          # EJS templates (dark/futuristic style)
├── controllers/    # Route controllers
├── public/         # Static files (CSS, images)
├── routes/         # Route definitions
├── middleware/     # Custom middleware
├── config/         # Configuration files
├── scripts/        # Database seeding script
├── .env            # Environment variables (not committed)
├── .gitignore      # Git ignore file
└── app.js          # Main application file
```

## Deployment
- Use [pm2](https://pm2.keymetrics.io/) to run the app in production on your VM.
- Secure your VM (firewall, SSH, etc.) as required by your assignment.

## Credits
- [Superhero API](https://superheroapi.com/) for superhero data
- Built for educational purposes 
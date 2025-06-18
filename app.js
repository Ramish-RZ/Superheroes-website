require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database');
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for HTTP (not HTTPS)
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    
    // Handle session messages
    if (req.session.success) {
        res.locals.success = req.session.success;
        delete req.session.success;
    }
    if (req.session.error) {
        res.locals.error = req.session.error;
        delete req.session.error;
    }
    
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const superheroRoutes = require('./routes/superhero');
const profileRoutes = require('./routes/profile');

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/superhero', superheroRoutes); // All superhero routes under /superhero

// Home page route (shows superheroes)
const superheroController = require('./controllers/superheroController');
app.get('/', superheroController.getHome);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error',
        message: 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 
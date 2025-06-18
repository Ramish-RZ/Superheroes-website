# Technical Architecture - Superhero Website

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    DNS Server                               │
│                 (10.12.83.92)                              │
│                   BIND9 DNS                                 │
│              werewolf.ikt-fag.no                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ DNS Resolution
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Web Server                                │
│                 (10.12.83.90)                              │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │     Nginx       │    │   Node.js App   │                │
│  │  (Port 80)      │◄──►│  (Port 3000)    │                │
│  │ Reverse Proxy   │    │   Express.js    │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────┬───────────────────────────────────────┘
                      │ MongoDB Connection
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database Server                            │
│                 (10.12.83.91)                              │
│                   MongoDB                                   │
│                (Port 27017)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### DNS Server (BIND9)
- **Purpose**: Domain name resolution
- **Domain**: `werewolf.ikt-fag.no`
- **Records**: `superhelt.werewolf.ikt-fag.no` → `10.12.83.90`
- **Configuration**: Zone files, forwarders, security settings

#### Nginx (Reverse Proxy)
- **Purpose**: HTTP server, load balancer, SSL termination
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Functions**: 
  - Proxy requests to Node.js
  - Serve static files
  - Handle SSL certificates
  - Basic security headers

#### Node.js Application
- **Purpose**: Application server, business logic
- **Port**: 3000
- **Framework**: Express.js
- **Process Manager**: PM2
- **Functions**: API endpoints, session management, database operations

#### MongoDB Database
- **Purpose**: Data persistence
- **Port**: 27017
- **Collections**: users, superheroes
- **Functions**: CRUD operations, aggregation queries

---

## 📁 Code Structure

### Directory Organization
```
superhero-website/
├── app.js                    # Application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
│
├── config/                   # Configuration files
│   └── database.js          # Database connection setup
│
├── controllers/              # Business logic (MVC)
│   ├── authController.js    # Authentication logic
│   └── superheroController.js # Superhero operations
│
├── middleware/               # Express middleware
│   └── auth.js              # Authentication middleware
│
├── models/                   # Database models (Mongoose)
│   ├── User.js              # User schema and methods
│   └── Superhero.js         # Superhero schema
│
├── routes/                   # Route definitions
│   ├── auth.js              # Authentication routes
│   ├── profile.js           # Profile management routes
│   └── superhero.js         # Superhero routes
│
├── services/                 # External service integrations
│   └── superheroApi.js      # Superhero API client
│
├── views/                    # EJS templates (Frontend)
│   ├── layout.ejs           # Base layout template
│   ├── index.ejs            # Home page
│   ├── superhero.ejs        # Superhero detail page
│   ├── profile.ejs          # User profile page
│   ├── favorites.ejs        # Favorites page
│   ├── error.ejs            # Error page
│   └── auth/                # Authentication pages
│       ├── login.ejs        # Login form
│       └── register.ejs     # Registration form
│
├── public/                   # Static assets
│   └── css/
│       └── style.css        # Custom styles
│
└── scripts/                  # Utility scripts
    └── seedDatabase.js      # Database seeding script
```

---

## 🔄 Data Flow Architecture

### 1. User Registration Flow
```
User Input → Form Validation → Password Hashing → Database Save → Session Creation → Redirect
     ↓              ↓                ↓               ↓              ↓              ↓
Register Form → Controller → bcrypt.hash() → User Model → req.session → Home Page
```

### 2. User Login Flow
```
User Input → Form Validation → Database Lookup → Password Verification → Session Creation → Redirect
     ↓              ↓                ↓                ↓                ↓              ↓
Login Form → Controller → User.findOne() → bcrypt.compare() → req.session → Home Page
```

### 3. Superhero Search Flow
```
User Query → Route Handler → Database Search → API Fallback → Database Save → Template Render
     ↓              ↓              ↓              ↓              ↓              ↓
Search Form → Controller → Superhero.find() → API Call → Superhero.save() → EJS Template
```

### 4. Favorites Management Flow
```
User Action → Authentication Check → Database Update → Session Update → Redirect
     ↓              ↓                    ↓              ↓              ↓
Favorite Button → Middleware → User.updateOne() → req.session → Profile Page
```

---

## 🗄️ Database Schema Design

### User Collection Schema
```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  favorites: [{
    heroId: String,           // Superhero API ID
    reason: { 
      type: String, 
      default: '' 
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

### Superhero Collection Schema
```javascript
const superheroSchema = new mongoose.Schema({
  apiId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  powerstats: {
    intelligence: Number,
    strength: Number,
    speed: Number,
    durability: Number,
    power: Number,
    combat: Number
  },
  biography: {
    fullName: String,
    alterEgos: String,
    aliases: [String],
    placeOfBirth: String,
    publisher: String,
    alignment: String
  },
  appearance: {
    gender: String,
    race: String,
    height: [String],
    weight: [String],
    eyeColor: String,
    hairColor: String
  },
  work: {
    occupation: String,
    base: String
  },
  connections: {
    groupAffiliation: String,
    relatives: String
  }
}, {
  timestamps: true
});
```

### Database Indexes
```javascript
// User collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "favorites.heroId": 1 });

// Superhero collection indexes
db.superheroes.createIndex({ "apiId": 1 }, { unique: true });
db.superheroes.createIndex({ "name": 1 });
db.superheroes.createIndex({ "biography.publisher": 1 });
```

---

## 🔌 API Endpoints Specification

### Authentication Endpoints

#### POST /auth/register
**Purpose**: User registration
**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```
**Response**: Redirect to home page or error page
**Validation**:
- Username: 3-20 characters, unique
- Email: Valid email format, unique
- Password: 6+ characters, matches confirmPassword

#### POST /auth/login
**Purpose**: User authentication
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**: Redirect to home page or error page
**Validation**:
- Email: Must exist in database
- Password: Must match hashed password

#### GET /auth/logout
**Purpose**: User logout
**Response**: Redirect to home page
**Action**: Destroys user session

### Superhero Endpoints

#### GET /
**Purpose**: Home page with superheroes
**Query Parameters**:
- `page`: Page number for pagination (default: 1)
**Response**: Rendered EJS template with superhero data
**Data Included**:
- Superheroes (paginated)
- User's favorite IDs
- Top 10 most favorited superheroes
- Pagination information

#### GET /superhero/search
**Purpose**: Search superheroes
**Query Parameters**:
- `q`: Search query string
**Response**: Rendered EJS template with search results
**Search Logic**:
1. Search local database by name or full name
2. If no results, search external API
3. Save API results to database
4. Return results

#### GET /superhero/:id
**Purpose**: View single superhero
**Path Parameters**:
- `id`: Superhero API ID
**Response**: Rendered EJS template with superhero details
**Logic**:
1. Find superhero in database
2. If not found, fetch from API and save
3. Return superhero data

#### POST /superhero/:id/favorite
**Purpose**: Toggle favorite status
**Path Parameters**:
- `id`: Superhero API ID
**Request Body**:
- `reason`: Optional reason for favoriting
- `fromHome`: Boolean (if coming from home page)
- `fromProfile`: Boolean (if coming from profile page)
**Response**: Redirect with success message
**Logic**:
1. Check if user is authenticated
2. Find superhero in database (or fetch from API)
3. Toggle favorite status in user's favorites array
4. Save user document
5. Redirect to appropriate page

#### GET /superhero/favorites
**Purpose**: View user's favorites
**Response**: Rendered EJS template with user's favorites
**Data Included**:
- User's favorite superheroes with reasons
- Superhero details for each favorite

### Profile Endpoints

#### GET /profile
**Purpose**: User profile page
**Response**: Rendered EJS template with user data and favorites
**Data Included**:
- User information
- User's favorite superheroes with reasons
- Edit forms for favorite reasons

#### POST /profile/favorite/:id
**Purpose**: Remove favorite from profile
**Path Parameters**:
- `id`: Superhero API ID
**Request Body**:
- `fromProfile`: Boolean (true)
**Response**: Redirect to profile page
**Logic**: Remove superhero from user's favorites array

#### POST /profile/favorite/reason
**Purpose**: Update favorite reason
**Request Body**:
- `heroId`: Superhero API ID
- `reason`: New reason text
**Response**: Redirect to profile page
**Logic**: Update reason for specific favorite in user's favorites array

---

## 🔐 Security Implementation

### Password Security
```javascript
// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password verification method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### Session Security
```javascript
// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true for HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### Authentication Middleware
```javascript
// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
};

// Check if user is not authenticated (for login/register pages)
exports.isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  next();
};
```

### Input Validation
```javascript
// Registration validation
const { username, email, password, confirmPassword } = req.body;

// Validate password match
if (password !== confirmPassword) {
  return res.render('auth/register', {
    title: 'Register',
    messages: { error: 'Passwords do not match' }
  });
}

// Check if user already exists
const existingUser = await User.findOne({
  $or: [
    { email: email.toLowerCase() },
    { username: username }
  ]
});
```

---

## 🎨 Frontend Implementation

### Template Engine (EJS)
```ejs
<!-- Layout template structure -->
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <%- include('partials/nav') %>
  <main>
    <%- body %>
  </main>
  <%- include('partials/footer') %>
</body>
</html>
```

### Dynamic Content Rendering
```ejs
<!-- Superhero cards with favorite buttons -->
<% superheroes.forEach(hero => { %>
  <div class="card">
    <img src="<%= hero.image %>" alt="<%= hero.name %>">
    <div class="card-body">
      <h5><%= hero.name %></h5>
      <% if (user) { %>
        <form action="/superhero/<%= hero.apiId %>/favorite" method="POST">
          <input type="hidden" name="fromHome" value="1">
          <button type="submit" class="btn">
            <i class="bi bi-star<%= userFavoriteIds.includes(hero.apiId) ? '-fill' : '' %>"></i>
            <%= userFavoriteIds.includes(hero.apiId) ? 'Unfavorite' : 'Favorite' %>
          </button>
        </form>
      <% } %>
    </div>
  </div>
<% }); %>
```

### Form Handling
```ejs
<!-- Search form -->
<form action="/superhero/search" method="GET">
  <input type="text" name="q" value="<%= locals.query || '' %>" placeholder="Search superheroes...">
  <button type="submit">Search</button>
</form>

<!-- Favorite reason form -->
<form action="/profile/favorite/reason" method="POST">
  <input type="hidden" name="heroId" value="<%= fav.apiId %>">
  <input type="text" name="reason" value="<%= fav.reason || '' %>" placeholder="Why is this your favorite?">
  <button type="submit">Save</button>
</form>
```

---

## 🔄 External API Integration

### API Client Implementation
```javascript
// services/superheroApi.js
const getSuperhero = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Superhero not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching superhero:', error);
    throw error;
  }
};

const searchSuperheroes = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/${query}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching superheroes:', error);
    throw error;
  }
};
```

### Caching Strategy
```javascript
// Controller logic for superhero retrieval
let superhero = await Superhero.findOne({ apiId: id });

// If not in database, fetch from API and save
if (!superhero) {
  const apiHero = await superheroApi.getSuperhero(id);
  superhero = new Superhero({
    apiId: apiHero.id,
    name: apiHero.name,
    image: apiHero.image.url,
    powerstats: apiHero.powerstats,
    biography: apiHero.biography,
    appearance: apiHero.appearance,
    work: apiHero.work,
    connections: apiHero.connections
  });
  await superhero.save();
}
```

---

## 📊 Data Aggregation (Top 10 Favorites)

### MongoDB Aggregation Pipeline
```javascript
// Get top 10 most favorited superheroes
const topFavoritesAgg = await User.aggregate([
  // Step 1: Unwind favorites array to create separate documents
  { $unwind: "$favorites" },
  
  // Step 2: Group by heroId and count occurrences
  { 
    $group: { 
      _id: "$favorites.heroId", 
      count: { $sum: 1 } 
    } 
  },
  
  // Step 3: Sort by count in descending order
  { $sort: { count: -1 } },
  
  // Step 4: Limit to top 10
  { $limit: 10 }
]);

// Get superhero details for top favorites
const topFavoriteIds = topFavoritesAgg.map(f => f._id);
const topFavoriteHeroes = await Superhero.find({ 
  apiId: { $in: topFavoriteIds } 
});

// Combine aggregation results with superhero data
const topFavoritesWithCount = topFavorites.map((hero, i) => ({ 
  hero, 
  count: topFavoritesAgg.find(f => f._id === hero.apiId)?.count || 0 
}));
```

### Frontend Display
```ejs
<!-- Top 10 Most Favorited Section -->
<% if (topFavorites && topFavorites.length > 0) { %>
  <div class="top-favorites">
    <h2>Top 10 Most Favorited Superheroes</h2>
    <div class="favorites-grid">
      <% topFavorites.forEach(({ hero, count }) => { %>
        <div class="favorite-card">
          <img src="<%= hero.image %>" alt="<%= hero.name %>">
          <h6><%= hero.name %></h6>
          <span>⭐ <%= count %> favorites</span>
        </div>
      <% }); %>
    </div>
  </div>
<% } %>
```

---

## 🚀 Performance Optimizations

### Database Optimizations
```javascript
// Efficient queries with projection
const superheroes = await Superhero.find()
  .select('apiId name image biography.publisher powerstats.power')
  .skip(skip)
  .limit(limit)
  .sort({ name: 1 });

// Indexed queries for favorites
const userFavoriteIds = user.favorites.map(f => f.heroId);
const favoriteSuperheroes = await Superhero.find({
  apiId: { $in: userFavoriteIds }
}).select('apiId name image biography.publisher');
```

### Caching Strategy
```javascript
// In-memory caching for frequently accessed data
const cache = new Map();

const getCachedSuperhero = async (id) => {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const superhero = await Superhero.findOne({ apiId: id });
  if (superhero) {
    cache.set(id, superhero);
  }
  return superhero;
};
```

### Pagination Implementation
```javascript
// Efficient pagination
const page = parseInt(req.query.page) || 1;
const limit = 20;
const skip = (page - 1) * limit;

const superheroes = await Superhero.find()
  .skip(skip)
  .limit(limit)
  .sort({ name: 1 });

const total = await Superhero.countDocuments();
const totalPages = Math.ceil(total / limit);
```

---

## 🔧 Error Handling

### Global Error Handler
```javascript
// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong. Please try again.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Not Found',
    message: 'The page you are looking for does not exist.'
  });
});
```

### Controller Error Handling
```javascript
// Try-catch blocks in controllers
exports.getSuperhero = async (req, res) => {
  try {
    const { id } = req.params;
    let superhero = await Superhero.findOne({ apiId: id });
    
    if (!superhero) {
      const apiHero = await superheroApi.getSuperhero(id);
      superhero = new Superhero(/* ... */);
      await superhero.save();
    }
    
    res.render('superhero', { title: superhero.name, superhero });
  } catch (error) {
    console.error('Error in getSuperhero:', error);
    res.status(404).render('error', {
      title: 'Error',
      message: 'Superhero not found'
    });
  }
};
```

---

## 📈 Monitoring and Logging

### Application Logging
```javascript
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error logging
console.error('Error in superheroController:', error);
console.error('Error stack:', error.stack);
```

### PM2 Process Monitoring
```bash
# Check application status
pm2 status

# View application logs
pm2 logs superhero-app

# Monitor resource usage
pm2 monit

# Restart application
pm2 restart superhero-app
```

### Database Monitoring
```javascript
// MongoDB connection monitoring
mongoose.connection.on('connected', () => {
  console.log('MongoDB Connected:', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

---

This technical architecture provides a comprehensive understanding of how the superhero website is built, how data flows through the system, and how different components interact with each other. It serves as both documentation for developers and a guide for explaining the system during presentations or exams. 
# API Documentation - Superhero Website

## 📋 Overview

This document provides comprehensive documentation for all API endpoints in the Superhero Website application. The application uses a RESTful API design with server-side rendering (EJS templates) rather than a separate frontend API.

### Base URL
```
http://superhelt.werewolf.ikt-fag.no
```

### Content Type
- **Request**: `application/x-www-form-urlencoded` (forms)
- **Response**: `text/html` (rendered EJS templates)

---

## 🔐 Authentication Endpoints

### POST /auth/register
**Description**: Register a new user account

**Request Body**:
```
username=ramish&email=ramish@example.com&password=password123&confirmPassword=password123
```

**Validation Rules**:
- `username`: 3-20 characters, alphanumeric, unique
- `email`: Valid email format, unique
- `password`: Minimum 6 characters
- `confirmPassword`: Must match password

**Success Response**:
- **Status**: 302 Redirect
- **Location**: `/` (home page)
- **Session**: User session created

**Error Response**:
- **Status**: 200 (rendered error page)
- **Body**: Registration form with error message

**Example Usage**:
```html
<form action="/auth/register" method="POST">
  <input type="text" name="username" required>
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <input type="password" name="confirmPassword" required>
  <button type="submit">Register</button>
</form>
```

---

### POST /auth/login
**Description**: Authenticate existing user

**Request Body**:
```
email=ramish@example.com&password=password123
```

**Validation Rules**:
- `email`: Must exist in database
- `password`: Must match hashed password

**Success Response**:
- **Status**: 302 Redirect
- **Location**: `/` (home page)
- **Session**: User session created

**Error Response**:
- **Status**: 200 (rendered error page)
- **Body**: Login form with error message

**Example Usage**:
```html
<form action="/auth/login" method="POST">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Login</button>
</form>
```

---

### GET /auth/logout
**Description**: Logout current user

**Request**: No body required

**Response**:
- **Status**: 302 Redirect
- **Location**: `/` (home page)
- **Session**: Destroyed

**Example Usage**:
```html
<a href="/auth/logout">Logout</a>
```

---

## 🦸 Superhero Endpoints

### GET /
**Description**: Home page with superheroes

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)

**Example Request**:
```
GET /?page=2
```

**Response Data**:
```javascript
{
  title: "Home",
  superheroes: [
    {
      apiId: "644",
      name: "Superman",
      image: "https://www.superheroapi.com/api/644/image.jpg",
      biography: {
        publisher: "DC Comics"
      },
      powerstats: {
        power: 100
      }
    }
    // ... more superheroes
  ],
  pagination: {
    currentPage: 2,
    totalPages: 5,
    hasNext: true,
    hasPrev: true
  },
  userFavoriteIds: ["644", "149"], // If user is logged in
  topFavorites: [
    {
      hero: { /* superhero object */ },
      count: 15
    }
    // ... top 10 most favorited
  ]
}
```

**Example Usage**:
```html
<!-- Pagination links -->
<a href="/?page=1">1</a>
<a href="/?page=2">2</a>
<a href="/?page=3">3</a>

<!-- Favorite buttons (if logged in) -->
<form action="/superhero/644/favorite" method="POST">
  <input type="hidden" name="fromHome" value="1">
  <button type="submit">
    <i class="bi bi-star-fill"></i> Unfavorite
  </button>
</form>
```

---

### GET /superhero/search
**Description**: Search superheroes by name

**Query Parameters**:
- `q` (required): Search query string

**Example Request**:
```
GET /superhero/search?q=batman
```

**Response Data**:
```javascript
{
  title: "Search Results",
  superheroes: [
    {
      apiId: "720",
      name: "Batman",
      image: "https://www.superheroapi.com/api/720/image.jpg",
      biography: {
        publisher: "DC Comics"
      },
      powerstats: {
        power: 47
      }
    }
    // ... search results
  ],
  query: "batman",
  pagination: {
    currentPage: 1,
    totalPages: 1
  },
  userFavoriteIds: ["720"], // If user is logged in
  topFavorites: [/* top 10 favorites */]
}
```

**Search Logic**:
1. Search local database by name or full name
2. If no results, search external superhero API
3. Save API results to database
4. Return results

**Example Usage**:
```html
<form action="/superhero/search" method="GET">
  <input type="text" name="q" placeholder="Search superheroes...">
  <button type="submit">Search</button>
</form>
```

---

### GET /superhero/:id
**Description**: View single superhero details

**Path Parameters**:
- `id` (required): Superhero API ID

**Example Request**:
```
GET /superhero/644
```

**Response Data**:
```javascript
{
  title: "Superman",
  superhero: {
    apiId: "644",
    name: "Superman",
    image: "https://www.superheroapi.com/api/644/image.jpg",
    powerstats: {
      intelligence: 94,
      strength: 100,
      speed: 100,
      durability: 100,
      power: 100,
      combat: 85
    },
    biography: {
      fullName: "Clark Kent",
      alterEgos: "Superman",
      aliases: ["Man of Steel", "The Last Son of Krypton"],
      placeOfBirth: "Krypton",
      publisher: "DC Comics",
      alignment: "good"
    },
    appearance: {
      gender: "Male",
      race: "Kryptonian",
      height: ["6'3", "191 cm"],
      weight: ["225 lb", "101 kg"],
      eyeColor: "Blue",
      hairColor: "Black"
    },
    work: {
      occupation: "Reporter",
      base: "Metropolis"
    },
    connections: {
      groupAffiliation: "Justice League",
      relatives: "Lois Lane (wife), Jonathan Kent (father)"
    }
  },
  user: { /* user object if logged in */ },
  userFavoriteIds: ["644"] // If user is logged in
}
```

**Example Usage**:
```html
<!-- Favorite button (if logged in) -->
<form action="/superhero/644/favorite" method="POST">
  <button type="submit">
    <i class="bi bi-star-fill"></i> Unfavorite
  </button>
</form>

<!-- Power stats display -->
<div class="power-stats">
  <div class="stat">
    <span>Intelligence</span>
    <div class="progress">
      <div class="progress-bar" style="width: 94%">94</div>
    </div>
  </div>
  <!-- ... more stats -->
</div>
```

---

### POST /superhero/:id/favorite
**Description**: Toggle favorite status for a superhero

**Path Parameters**:
- `id` (required): Superhero API ID

**Request Body**:
```
reason=Because he's awesome!&fromHome=1
```

**Form Fields**:
- `reason` (optional): User's reason for favoriting
- `fromHome` (optional): Boolean indicating request from home page
- `fromProfile` (optional): Boolean indicating request from profile page

**Authentication**: Required (user must be logged in)

**Success Response**:
- **Status**: 302 Redirect
- **Location**: Previous page or superhero detail page
- **Session**: Success message added

**Error Response**:
- **Status**: 401 Unauthorized (if not logged in)
- **Body**: Error message

**Example Usage**:
```html
<!-- From home page -->
<form action="/superhero/644/favorite" method="POST">
  <input type="hidden" name="fromHome" value="1">
  <button type="submit">
    <i class="bi bi-star"></i> Favorite
  </button>
</form>

<!-- From profile page -->
<form action="/superhero/644/favorite" method="POST">
  <input type="hidden" name="fromProfile" value="1">
  <button type="submit">
    <i class="bi bi-star-fill"></i> Unfavorite
  </button>
</form>
```

---

### GET /superhero/favorites
**Description**: View user's favorite superheroes

**Authentication**: Required (user must be logged in)

**Response Data**:
```javascript
{
  title: "My Favorites",
  superheroes: [
    {
      apiId: "644",
      name: "Superman",
      image: "https://www.superheroapi.com/api/644/image.jpg",
      biography: {
        publisher: "DC Comics"
      },
      powerstats: {
        power: 100
      },
      reason: "Because he's awesome!" // User's reason
    }
    // ... more favorites
  ],
  message: null // or error message
}
```

**Example Usage**:
```html
<!-- Display favorites -->
<% superheroes.forEach(hero => { %>
  <div class="favorite-card">
    <img src="<%= hero.image %>" alt="<%= hero.name %>">
    <h5><%= hero.name %></h5>
    <p>Reason: <%= hero.reason %></p>
    <form action="/superhero/<%= hero.apiId %>/favorite" method="POST">
      <button type="submit">Remove</button>
    </form>
  </div>
<% }); %>
```

---

## 👤 Profile Endpoints

### GET /profile
**Description**: User profile page with favorites management

**Authentication**: Required (user must be logged in)

**Response Data**:
```javascript
{
  user: {
    _id: "user_id",
    username: "ramish",
    email: "ramish@example.com"
  },
  favorites: [
    {
      apiId: "644",
      name: "Superman",
      image: "https://www.superheroapi.com/api/644/image.jpg",
      biography: {
        publisher: "DC Comics"
      },
      powerstats: {
        power: 100
      },
      reason: "Because he's awesome!"
    }
    // ... more favorites
  ]
}
```

**Example Usage**:
```html
<!-- User info -->
<div class="user-info">
  <h3>Profile</h3>
  <p><strong>Username:</strong> <%= user.username %></p>
  <p><strong>Email:</strong> <%= user.email %></p>
</div>

<!-- Favorites with reason editing -->
<% favorites.forEach(fav => { %>
  <div class="favorite-item">
    <img src="<%= fav.image %>" alt="<%= fav.name %>">
    <div class="favorite-details">
      <h5><%= fav.name %></h5>
      <p><strong>Publisher:</strong> <%= fav.biography.publisher %></p>
      <p><strong>Power:</strong> <%= fav.powerstats.power %></p>
      
      <!-- Remove favorite -->
      <form action="/profile/favorite/<%= fav.apiId %>" method="POST">
        <input type="hidden" name="fromProfile" value="1">
        <button type="submit">Remove</button>
      </form>
      
      <!-- Update reason -->
      <form action="/profile/favorite/reason" method="POST">
        <input type="hidden" name="heroId" value="<%= fav.apiId %>">
        <input type="text" name="reason" value="<%= fav.reason || '' %>" placeholder="Why is this your favorite?">
        <button type="submit">Save</button>
      </form>
    </div>
  </div>
<% }); %>
```

---

### POST /profile/favorite/:id
**Description**: Remove favorite from profile page

**Path Parameters**:
- `id` (required): Superhero API ID

**Request Body**:
```
fromProfile=1
```

**Authentication**: Required (user must be logged in)

**Success Response**:
- **Status**: 302 Redirect
- **Location**: `/profile`
- **Session**: Success message added

**Example Usage**:
```html
<form action="/profile/favorite/644" method="POST">
  <input type="hidden" name="fromProfile" value="1">
  <button type="submit">Remove from Favorites</button>
</form>
```

---

### POST /profile/favorite/reason
**Description**: Update reason for a favorite

**Request Body**:
```
heroId=644&reason=Updated reason here
```

**Form Fields**:
- `heroId` (required): Superhero API ID
- `reason` (required): New reason text

**Authentication**: Required (user must be logged in)

**Success Response**:
- **Status**: 302 Redirect
- **Location**: `/profile`
- **Session**: Success message added

**Example Usage**:
```html
<form action="/profile/favorite/reason" method="POST">
  <input type="hidden" name="heroId" value="644">
  <input type="text" name="reason" value="Current reason" placeholder="Why is this your favorite?">
  <button type="submit">Update Reason</button>
</form>
```

---

## 🔍 Search and Filtering

### Search Functionality
The search endpoint supports:
- **Name matching**: Exact and partial name matches
- **Full name matching**: Search by alter ego names
- **Case insensitive**: Search works regardless of case
- **External API fallback**: Searches external API if no local results

### Pagination
All list endpoints support pagination:
- **Default page size**: 20 items per page
- **Page parameter**: `?page=2`
- **Navigation**: Previous/Next links
- **Page numbers**: Direct page links

### Sorting
- **Default sort**: Alphabetical by name
- **Custom sorting**: Can be implemented for power stats, popularity, etc.

---

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String,        // Unique, 3-20 chars
  email: String,          // Unique, valid email
  password: String,       // bcrypt hashed
  favorites: [
    {
      heroId: String,     // Superhero API ID
      reason: String      // User's reason (optional)
    }
  ],
  createdAt: Date
}
```

### Superhero Model
```javascript
{
  _id: ObjectId,
  apiId: String,          // External API ID (unique)
  name: String,           // Superhero name
  image: String,          // Image URL
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
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication and Security

### Session Management
- **Session storage**: In-memory (production: Redis/database)
- **Session secret**: Environment variable
- **Session expiry**: 24 hours
- **Secure cookies**: HTTP-only, secure flags

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **No plain text**: Passwords never stored in plain text
- **Secure comparison**: Timing-safe password comparison

### Access Control
- **Authentication middleware**: Protects private routes
- **Route protection**: Unauthorized users redirected to login
- **CSRF protection**: Form-based CSRF protection

---

## 🚨 Error Handling

### Common Error Responses

#### 401 Unauthorized
```
Status: 401
Body: "Please log in to access this feature"
```

#### 404 Not Found
```
Status: 404
Body: Rendered error page with "Superhero not found" message
```

#### 500 Internal Server Error
```
Status: 500
Body: Rendered error page with "Something went wrong" message
```

### Error Page Template
```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <h1>Oops!</h1>
  <p><%= message %></p>
  <a href="/">Go to Home Page</a>
</body>
</html>
```

---

## 📈 Performance Considerations

### Database Optimizations
- **Indexes**: On frequently queried fields (apiId, name, email)
- **Projection**: Select only needed fields
- **Pagination**: Limit result sets
- **Connection pooling**: Efficient database connections

### Caching Strategy
- **API response caching**: Store superhero data locally
- **Session caching**: Fast session lookups
- **Static file caching**: CSS/JS files cached

### Query Optimization
```javascript
// Efficient superhero query with projection
const superheroes = await Superhero.find()
  .select('apiId name image biography.publisher powerstats.power')
  .skip(skip)
  .limit(limit)
  .sort({ name: 1 });

// Efficient favorites query
const userFavoriteIds = user.favorites.map(f => f.heroId);
const favoriteSuperheroes = await Superhero.find({
  apiId: { $in: userFavoriteIds }
}).select('apiId name image biography.publisher');
```

---

## 🔧 Development and Testing

### Local Development
```bash
# Start development server
npm run dev

# Access application
http://localhost:3000
```

### Testing Endpoints
```bash
# Test search endpoint
curl "http://localhost:3000/superhero/search?q=batman"

# Test superhero detail endpoint
curl "http://localhost:3000/superhero/644"

# Test with authentication (requires session)
curl -b cookies.txt "http://localhost:3000/profile"
```

### Environment Variables
```bash
# Required environment variables
PORT=3000
SESSION_SECRET=your_secret_key_here
MONGODB_URI=mongodb://localhost:27017/superhero-db
SUPERHERO_API_KEY=your_api_key_here
NODE_ENV=development
```

---

This API documentation provides a comprehensive guide to all endpoints, their usage, and the data structures used throughout the application. It serves as both a reference for developers and a guide for understanding the application's functionality. 
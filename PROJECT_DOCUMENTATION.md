# Superhero Website - Project Documentation

## 📋 Project Overview

**Superhero Website** is a full-stack web application that allows users to browse, search, and manage their favorite superheroes. The application integrates with an external superhero API, provides user authentication, and features a comprehensive favorites system with social features.

### 🎯 Key Features
- **User Authentication**: Secure registration and login with password hashing
- **Superhero Browsing**: Browse and search superheroes with pagination
- **Favorites System**: Add/remove favorites with personal reasons
- **Social Features**: View top 10 most favorited superheroes across all users
- **External API Integration**: Fetches superhero data from superheroapi.com
- **Responsive Design**: Modern UI with Bootstrap and custom styling

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DNS Server    │    │   Web Server    │    │  Database VM    │
│   (10.12.83.92) │    │  (10.12.83.90)  │    │  (10.12.83.91)  │
│                 │    │                 │    │                 │
│   BIND9 DNS     │◄──►│  Nginx + Node.js│◄──►│    MongoDB      │
│   (Port 53)     │    │  (Port 80/3000) │    │   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   Domain Resolution      Web Application         Data Storage
superhelt.werewolf.ikt-fag.no
```

### 🔄 Request Flow
1. **DNS Resolution**: `superhelt.werewolf.ikt-fag.no` → `10.12.83.90`
2. **Nginx**: Receives HTTP request and forwards to Node.js
3. **Express.js**: Routes request to appropriate controller
4. **Controller**: Processes business logic and database operations
5. **Database**: Stores/retrieves data (users, superheroes, favorites)
6. **Response**: Renders EJS template and sends HTML to user

---

## 🗄️ Database Design

### User Collection
```javascript
{
  _id: ObjectId("..."),
  username: "ramish",
  email: "ramish@example.com",
  password: "$2a$10$hashed_password_here", // bcrypt hashed
  favorites: [
    {
      heroId: "644",           // Superhero API ID
      reason: "Because he's awesome!" // User's reason
    },
    {
      heroId: "149",
      reason: "Best superhero ever!"
    }
  ],
  createdAt: ISODate("2024-12-18T...")
}
```

### Superhero Collection
```javascript
{
  _id: ObjectId("..."),
  apiId: "644",              // External API ID
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
  },
  createdAt: ISODate("2024-12-18T..."),
  updatedAt: ISODate("2024-12-18T...")
}
```

### 🔗 Database Relationships
- **One-to-Many**: User → Favorites (one user can have many favorites)
- **Many-to-One**: Favorites → Superhero (many users can favorite the same superhero)
- **No Direct Relationships**: Superheroes are independent entities

---

## 🌐 API Endpoints

### Authentication Routes
```
POST   /auth/register     - User registration
POST   /auth/login        - User login
GET    /auth/logout       - User logout
```

### Superhero Routes
```
GET    /                   - Home page with superheroes
GET    /superhero/search   - Search superheroes
GET    /superhero/:id      - View single superhero
POST   /superhero/:id/favorite - Toggle favorite status
GET    /superhero/favorites - View user's favorites
```

### Profile Routes
```
GET    /profile            - User profile page
POST   /profile/favorite/:id - Remove favorite from profile
POST   /profile/favorite/reason - Update favorite reason
```

### 🔍 Route Parameters
- `:id` - Superhero API ID (e.g., "644" for Superman)
- `q` - Search query parameter
- `page` - Pagination page number

---

## 🎨 Frontend Architecture

### Template Engine: EJS (Embedded JavaScript)
- **Server-side rendering**: HTML generated on server
- **Dynamic content**: Data injected into templates
- **Layout system**: Consistent header/footer across pages

### Key Templates
```
views/
├── layout.ejs           # Base layout (header, nav, footer)
├── index.ejs            # Home page with superhero grid
├── superhero.ejs        # Individual superhero details
├── profile.ejs          # User profile and favorites
├── favorites.ejs        # Dedicated favorites page
├── error.ejs            # Error page
└── auth/
    ├── login.ejs        # Login form
    └── register.ejs     # Registration form
```

### 🎯 Frontend Features
- **Responsive Grid**: Bootstrap-based superhero cards
- **Search Bar**: Real-time search functionality
- **Pagination**: Navigate through superhero pages
- **Favorite Buttons**: Toggle favorite status with visual feedback
- **Top 10 Section**: Display most popular superheroes
- **Form Validation**: Client and server-side validation

---

## ⚙️ Backend Architecture

### MVC Pattern (Model-View-Controller)

#### Models (Data Layer)
```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{
    heroId: String,
    reason: { type: String, default: '' }
  }],
  createdAt: { type: Date, default: Date.now }
});
```

#### Controllers (Business Logic)
```javascript
// controllers/superheroController.js
exports.getHome = async (req, res) => {
  // 1. Get superheroes from database
  // 2. Calculate top 10 favorites
  // 3. Get user's favorite IDs
  // 4. Render page with data
};

exports.favoriteSuperhero = async (req, res) => {
  // 1. Validate user authentication
  // 2. Check if already favorited
  // 3. Add/remove from favorites
  // 4. Save to database
  // 5. Redirect with success message
};
```

#### Routes (URL Mapping)
```javascript
// routes/superhero.js
router.get('/', superheroController.getHome);
router.get('/search', superheroController.searchSuperheroes);
router.post('/:id/favorite', superheroController.favoriteSuperhero);
```

### 🔐 Authentication System
- **Session-based**: Uses Express sessions
- **Password Hashing**: bcrypt with salt rounds
- **Middleware Protection**: `isAuthenticated` middleware
- **Session Storage**: In-memory (production: Redis/database)

---

## 🔌 External API Integration

### Superhero API (superheroapi.com)
```javascript
// services/superheroApi.js
const getSuperhero = async (id) => {
  const response = await fetch(`https://superheroapi.com/api/${API_KEY}/${id}`);
  return response.json();
};

const searchSuperheroes = async (query) => {
  const response = await fetch(`https://superheroapi.com/api/${API_KEY}/search/${query}`);
  return response.json();
};
```

### 🔄 API Integration Flow
1. **User searches for superhero**
2. **Check local database first**
3. **If not found, call external API**
4. **Save API response to database**
5. **Return superhero data to user**

### 📊 Data Caching Strategy
- **First-time access**: Fetch from API, save to database
- **Subsequent access**: Serve from database
- **Benefits**: Faster response times, reduced API calls

---

## ⭐ Favorites System

### Core Features
1. **Add/Remove Favorites**: Toggle favorite status
2. **Personal Reasons**: Users can add why they like a superhero
3. **Profile Management**: View and edit favorites on profile page
4. **Top 10 Display**: Show most popular superheroes

### Database Aggregation
```javascript
// Get top 10 most favorited superheroes
const topFavoritesAgg = await User.aggregate([
  { $unwind: "$favorites" },           // Flatten favorites arrays
  { $group: { _id: "$favorites.heroId", count: { $sum: 1 } } }, // Count by heroId
  { $sort: { count: -1 } },            // Sort by count descending
  { $limit: 10 }                       // Get top 10
]);
```

### User Experience Flow
1. **Browse superheroes** → See favorite/unfavorite buttons
2. **Click favorite** → Adds to user's favorites with optional reason
3. **View profile** → See all favorites with reasons
4. **Edit reasons** → Update why you like each superhero
5. **Remove favorites** → Delete from favorites list

---

## 🛡️ Security Features

### Password Security
- **bcrypt Hashing**: 10 salt rounds
- **No Plain Text**: Passwords never stored in plain text
- **Secure Comparison**: Timing-safe password comparison

### Session Security
- **Session Secret**: Environment variable
- **Secure Cookies**: HTTP-only, secure flags
- **Session Expiry**: 24-hour timeout

### Input Validation
- **Server-side Validation**: All inputs validated
- **SQL Injection Protection**: MongoDB ODM prevents injection
- **XSS Protection**: EJS auto-escapes output

### Access Control
- **Authentication Middleware**: Protects private routes
- **Route Protection**: Unauthorized users redirected to login
- **CSRF Protection**: Form-based CSRF protection

---

## 🚀 Deployment Architecture

### VM Configuration
```
VM 1: DNS Server (10.12.83.92)
├── BIND9 DNS Server
├── Zone: werewolf.ikt-fag.no
└── Records: superhelt.werewolf.ikt-fag.no → 10.12.83.90

VM 2: Web Server (10.12.83.90)
├── Nginx (Reverse Proxy)
├── Node.js Application
├── PM2 Process Manager
└── Static Files

VM 3: Database (10.12.83.91)
├── MongoDB Database
├── Authentication (Optional)
└── Backup Scripts
```

### Process Management
- **PM2**: Keeps Node.js app running
- **Auto-restart**: App restarts on crashes
- **Log Management**: Centralized logging
- **Environment Variables**: Secure configuration

### Network Security
- **Firewall Rules**: Only necessary ports open
- **Internal Communication**: VMs communicate on private network
- **External Access**: Only web server accessible from internet

---

## 📊 Performance Optimizations

### Database Optimizations
- **Indexes**: On frequently queried fields
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Minimal database queries

### Caching Strategy
- **API Response Caching**: Store superhero data locally
- **Session Caching**: Fast session lookups
- **Static File Caching**: CSS/JS files cached

### Frontend Optimizations
- **Lazy Loading**: Load images as needed
- **Pagination**: Limit data per page
- **Minified Assets**: Compressed CSS/JS

---

## 🔧 Configuration Management

### Environment Variables
```bash
# .env file
PORT=3000
SESSION_SECRET=your_secret_key_here
MONGODB_URI=mongodb://10.12.83.91:27017/superhero-db
SUPERHERO_API_KEY=your_api_key_here
NODE_ENV=production
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name superhelt.werewolf.ikt-fag.no;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'superhero-app',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 🧪 Testing Strategy

### Manual Testing
- **User Registration/Login**: Test authentication flow
- **Superhero Browsing**: Test search and pagination
- **Favorites System**: Test add/remove/update reasons
- **Responsive Design**: Test on different screen sizes

### Error Handling
- **404 Errors**: Superhero not found
- **500 Errors**: Server errors with user-friendly messages
- **Validation Errors**: Form validation with helpful messages
- **API Errors**: Graceful handling of external API failures

---

## 📈 Scalability Considerations

### Horizontal Scaling
- **Load Balancer**: Distribute traffic across multiple web servers
- **Database Replication**: Read replicas for better performance
- **Session Storage**: Redis for shared session storage

### Vertical Scaling
- **Resource Monitoring**: Monitor CPU, memory, disk usage
- **Database Optimization**: Index optimization, query tuning
- **Caching Layers**: Redis for frequently accessed data

---

## 🎯 Business Value

### User Benefits
- **Discover Superheroes**: Browse and learn about superheroes
- **Personal Collection**: Build and manage favorite superheroes
- **Social Features**: See what others are favoriting
- **Mobile Friendly**: Access from any device

### Technical Benefits
- **Modern Stack**: Node.js, Express, MongoDB
- **Scalable Architecture**: Separate VMs for different services
- **Security Focus**: Proper authentication and validation
- **Maintainable Code**: Clean MVC architecture

### Educational Value
- **Full-Stack Development**: Frontend, backend, database, infrastructure
- **API Integration**: Working with external APIs
- **DevOps Skills**: Deployment, monitoring, troubleshooting
- **Security Best Practices**: Authentication, validation, security

---

## 🔮 Future Enhancements

### Potential Features
- **User Profiles**: Extended user information
- **Superhero Reviews**: User reviews and ratings
- **Social Features**: Follow other users, share favorites
- **Advanced Search**: Filter by publisher, powers, etc.
- **Mobile App**: Native mobile application
- **Real-time Features**: Live updates, notifications

### Technical Improvements
- **GraphQL API**: More efficient data fetching
- **Microservices**: Break into smaller services
- **Containerization**: Docker deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Application performance monitoring

---

## 📚 Learning Outcomes

### Technical Skills
- **Full-Stack Development**: Complete web application
- **Database Design**: MongoDB schema design and relationships
- **API Integration**: External API consumption and caching
- **Authentication**: Secure user authentication system
- **Deployment**: Production deployment with multiple VMs
- **DNS Configuration**: Domain name system setup

### Soft Skills
- **Problem Solving**: Debugging and troubleshooting
- **Documentation**: Comprehensive project documentation
- **Project Management**: Organizing and completing a complex project
- **Communication**: Explaining technical concepts clearly

---

**This project demonstrates a complete, production-ready web application with modern technologies, proper architecture, and comprehensive features suitable for both learning and real-world deployment.** 
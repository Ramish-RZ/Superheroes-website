# Deployment Guide: Web Server VM (Node.js + Nginx)

This guide explains how to deploy the web server and application on one Ubuntu VM, with the database running on a separate VM. The app will be accessible via your VM's IP or domain.

---

## Project Structure Overview

This is a **monolithic application** where the frontend (EJS views) and backend (Node.js/Express) run together in the same process. This is the recommended approach for this project.

### File Organization
```
superhero-website/
├── app.js                 # Main application entry point
├── package.json           # Node.js dependencies
├── .env                   # Environment variables
├── views/                 # Frontend (EJS templates)
│   ├── layout.ejs        # Main layout template
│   ├── index.ejs         # Home page with superhero cards
│   ├── superhero.ejs     # Superhero detail page
│   ├── profile.ejs       # User profile page
│   ├── error.ejs         # Error page
│   └── auth/             # Authentication pages
│       ├── login.ejs     # Login form
│       └── register.ejs  # Registration form
├── public/               # Static assets (CSS, JS, images)
│   └── css/
│       └── style.css     # Custom styling
├── controllers/          # Backend logic (MVC)
├── models/              # Database models (MongoDB)
├── routes/              # API routes
├── middleware/          # Authentication middleware
├── services/            # External API services
├── config/              # Configuration files
└── scripts/             # Database seeding scripts
```

### Why This Structure?
- ✅ **Single Deployment**: Everything runs on one VM
- ✅ **No CORS Issues**: Frontend and backend are together
- ✅ **Simple Setup**: No complex API management
- ✅ **Perfect for Assignment**: Meets all requirements efficiently

---

## 1. SSH into Your Web Server VM
```
ssh <your-username>@<your-web-vm-ip>
```

---

## 2. Update and Install Dependencies
```
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential nginx
```

---

## 3. Install Node.js (LTS) and npm
```
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 4. Clone Your Project from GitHub
```
git clone <your-repo-url>
cd <your-project-folder>
```

---

## 5. Set Up Environment Variables
Create a `.env` file in your project root:
```
PORT=3000
SESSION_SECRET=your_secret_key
SUPERHERO_API_KEY=your_superheroapi_key
MONGODB_URI=mongodb://<database-vm-ip>:27017/superhero-db
```
Replace `<database-vm-ip>` with the IP address of your database VM.

---

## 6. Install Project Dependencies
```
npm install
```

---

## 7. Seed the Database (First Time Only)
```
npm run seed
```
This will connect to your database VM and populate it with superhero data.

---

## 8. Install and Configure PM2 (Process Manager)
```
sudo npm install -g pm2
pm2 start app.js --name superhero-app
pm2 save
pm2 startup
```
Follow the instructions to enable PM2 on boot.

---

## 9. Configure Nginx as a Reverse Proxy
```
sudo nano /etc/nginx/sites-available/superhero
```
Paste the following config (replace `your_domain_or_ip` with your web VM's IP or domain):
```
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the config and restart Nginx:
```
sudo ln -s /etc/nginx/sites-available/superhero /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 10. Configure Firewall (Local Security)
```
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 11. (Optional) Secure with HTTPS (Let's Encrypt)
```
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain_or_ip
```

---

## 12. Access Your App
- Visit `http://your_web_vm_ip` in your browser.
- The Node.js app (frontend and backend) is now running behind Nginx.
- It will connect to your database VM for data storage.

---

## 13. Useful PM2 Commands
```
pm2 status
pm2 logs superhero-app
pm2 restart superhero-app
pm2 stop superhero-app
```

---

## Notes
- This VM runs the web server (Node.js/Express) and serves the frontend (EJS views).
- The database runs on a separate VM (see DATABASE_DEPLOYMENT.md).
- Make sure your database VM is running and accessible before starting the web server.
- For production, always use strong secrets and secure both VMs.

---

**You are now ready to deploy and run your web server!** 
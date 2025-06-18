# Database VM Deployment Guide (MongoDB)

This guide explains how to set up a dedicated database VM running MongoDB for your superhero website.

---

## 1. SSH into Your Database VM
```
ssh <your-username>@<your-database-vm-ip>
```

---

## 2. Update and Install Dependencies
```
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg
```

---

## 3. Install MongoDB
```
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org
```

---

## 4. Start and Enable MongoDB
```
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

---

## 5. Configure MongoDB for Network Access
```
sudo nano /etc/mongod.conf
```

Find the `net` section and update it:
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0  # Allow connections from any IP (restrict this in production)
```

Save and restart MongoDB:
```
sudo systemctl restart mongod
```

---

## 6. Configure Firewall (Local Security)
```
sudo ufw allow ssh
sudo ufw allow from <web-vm-ip> to any port 27017  # Allow only web VM to connect
sudo ufw enable
```

Replace `<web-vm-ip>` with the IP address of your web server VM.

---

## 7. Create Database User (Optional but Recommended)
```
mongosh
```

In the MongoDB shell:
```javascript
use superhero-db
db.createUser({
  user: "superhero_user",
  pwd: "your_secure_password",
  roles: ["readWrite"]
})
exit
```

If you create a user, update your web server's `.env` file:
```
MONGODB_URI=mongodb://superhero_user:your_secure_password@<database-vm-ip>:27017/superhero-db
```

---

## 8. Test Database Connection
From your web server VM, test the connection:
```
telnet <database-vm-ip> 27017
```

Or use MongoDB Compass to connect to `mongodb://<database-vm-ip>:27017`

---

## 9. Monitor MongoDB
```
# Check MongoDB status
sudo systemctl status mongod

# View MongoDB logs
sudo journalctl -u mongod -f

# Check MongoDB is listening
sudo netstat -tlnp | grep 27017
```

---

## 10. Backup Configuration (Optional)
Create a backup script:
```
sudo nano /home/<username>/backup_mongo.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db superhero-db --out /home/<username>/backups/$DATE
```

Make it executable:
```
chmod +x /home/<username>/backup_mongo.sh
mkdir -p /home/<username>/backups
```

---

## Notes
- This VM runs only MongoDB database service.
- The web server VM connects to this database VM.
- Make sure both VMs are on the same network or can communicate.
- For production, use strong passwords and consider MongoDB authentication.
- Regular backups are recommended.

---

**Your database VM is now ready to serve your superhero website!** 
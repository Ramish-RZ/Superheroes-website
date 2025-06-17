# Deployment Checklist

Use this checklist to ensure your superhero website is properly deployed across all three VMs.

---

## Pre-Deployment Checklist

### [ ] vSphere Setup
- [ ] Created Web Server VM (`superhero-web-server`)
- [ ] Created Database VM (`superhero-database`)
- [ ] Created DNS Server VM (`superhero-dns-server`)
- [ ] All VMs are on the same network
- [ ] Assigned static IPs to all VMs
- [ ] Tested network connectivity between VMs

### [ ] Network Configuration
- [ ] Web Server VM IP: `192.168.1.10`
- [ ] Database VM IP: `192.168.1.11`
- [ ] DNS Server VM IP: `192.168.1.12`
- [ ] Can ping between all VMs
- [ ] Port 27017 accessible from web to database VM
- [ ] Port 53 accessible from all VMs to DNS server
- [ ] Firewall rules configured on all VMs

---

## DNS Server VM Checklist

### [ ] BIND9 Installation
- [ ] BIND9 installed and running
- [ ] BIND9 service enabled on boot
- [ ] Configuration files backed up
- [ ] Zone files created and configured

### [ ] DNS Configuration
- [ ] Forward zone file (`superhero.local.db`) created
- [ ] Reverse zone file (`192.168.1.rev`) created
- [ ] Zone files have correct permissions
- [ ] BIND9 configuration syntax is valid
- [ ] Zone files syntax is valid

### [ ] Security Configuration
- [ ] Firewall allows SSH from management network
- [ ] Firewall allows DNS (53 TCP/UDP) from all VMs
- [ ] Zone transfers disabled
- [ ] Proper file permissions set

### [ ] Testing
- [ ] `sudo systemctl status bind9` shows running
- [ ] `sudo netstat -tlnp | grep :53` shows BIND9 listening
- [ ] Can resolve `www.superhero.local` to `192.168.1.10`
- [ ] Can resolve `db.superhero.local` to `192.168.1.11`
- [ ] Can resolve `ns1.superhero.local` to `192.168.1.12`
- [ ] Can resolve external domains (e.g., google.com)

---

## Database VM Checklist

### [ ] MongoDB Installation
- [ ] MongoDB 7.0 installed and running
- [ ] MongoDB service enabled on boot
- [ ] MongoDB configured for network access (`bindIp: 0.0.0.0`)
- [ ] MongoDB listening on port 27017

### [ ] Security Configuration
- [ ] Firewall allows SSH from management network
- [ ] Firewall allows MongoDB (27017) from web server VM only
- [ ] Database user created (optional but recommended)
- [ ] Strong password set for database user

### [ ] Testing
- [ ] `sudo systemctl status mongod` shows running
- [ ] `sudo netstat -tlnp | grep 27017` shows MongoDB listening
- [ ] Can connect from web server VM: `telnet 192.168.1.11 27017`
- [ ] Can resolve hostname: `nslookup db.superhero.local 192.168.1.12`

---

## Web Server VM Checklist

### [ ] System Setup
- [ ] Ubuntu 22.04 LTS installed
- [ ] System updated: `sudo apt update && sudo apt upgrade`
- [ ] Node.js LTS installed and working
- [ ] Git installed

### [ ] Application Setup
- [ ] Project cloned from GitHub
- [ ] Dependencies installed: `npm install`
- [ ] Environment variables configured in `.env`
- [ ] MongoDB connection string points to database VM hostname

### [ ] Environment Variables Check
```bash
PORT=3000
SESSION_SECRET=your_secure_secret
SUPERHERO_API_KEY=your_api_key
MONGODB_URI=mongodb://db.superhero.local:27017/superhero-db
# OR with authentication:
# MONGODB_URI=mongodb://user:password@db.superhero.local:27017/superhero-db
```

### [ ] Database Seeding
- [ ] Database seeded: `npm run seed`
- [ ] Superhero data populated in database
- [ ] Can verify data in MongoDB

### [ ] Process Management
- [ ] PM2 installed globally
- [ ] Application started with PM2: `pm2 start app.js --name superhero-app`
- [ ] PM2 configured to start on boot: `pm2 startup` and `pm2 save`
- [ ] Application running: `pm2 status`

### [ ] Web Server Configuration
- [ ] Nginx installed and configured
- [ ] Nginx reverse proxy configured for port 3000
- [ ] Nginx service enabled and running
- [ ] Firewall allows HTTP (80) and HTTPS (443)

### [ ] SSL/HTTPS (Optional)
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Nginx configured for HTTPS
- [ ] HTTP to HTTPS redirect configured

---

## DNS Integration Testing

### [ ] DNS Resolution Testing
- [ ] Web server can resolve `db.superhero.local`
- [ ] Database server can resolve `www.superhero.local`
- [ ] All VMs can resolve external domains
- [ ] DNS queries are working from all VMs

### [ ] Application DNS Testing
- [ ] Application can connect to database using hostname
- [ ] No DNS resolution errors in application logs
- [ ] Database connection string uses hostname instead of IP

---

## Integration Testing

### [ ] End-to-End Testing
- [ ] Website accessible via web server VM IP
- [ ] Website accessible via `www.superhero.local` (if DNS configured)
- [ ] Home page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Superhero search works
- [ ] Superhero detail pages load
- [ ] Pagination works
- [ ] User profile pages work

### [ ] Database Connection Testing
- [ ] Web app can read from database
- [ ] Web app can write to database (user registration)
- [ ] Database connection remains stable
- [ ] No connection timeouts
- [ ] Connection uses hostname resolution

### [ ] Performance Testing
- [ ] Pages load within reasonable time (< 3 seconds)
- [ ] Database queries are fast
- [ ] No memory leaks in Node.js app
- [ ] Nginx handles concurrent requests
- [ ] DNS resolution is fast

---

## Security Verification

### [ ] Network Security
- [ ] Database VM not accessible from internet
- [ ] Only web server VM can access database
- [ ] DNS server accessible only from internal network
- [ ] SSH access restricted to necessary IPs
- [ ] Firewall rules properly configured on all VMs

### [ ] Application Security
- [ ] Strong session secrets used
- [ ] Passwords hashed properly
- [ ] No sensitive data in logs
- [ ] Environment variables not committed to Git

### [ ] System Security
- [ ] All VMs updated with latest security patches
- [ ] Unnecessary services disabled
- [ ] Strong passwords set for all users
- [ ] SSH key authentication configured (recommended)

---

## Monitoring Setup

### [ ] Log Monitoring
- [ ] Application logs accessible: `pm2 logs superhero-app`
- [ ] Nginx logs accessible: `sudo tail -f /var/log/nginx/access.log`
- [ ] MongoDB logs accessible: `sudo journalctl -u mongod -f`
- [ ] BIND9 logs accessible: `sudo tail -f /var/log/bind/named.log`

### [ ] System Monitoring
- [ ] CPU and memory usage monitored on all VMs
- [ ] Disk space monitored on all VMs
- [ ] Network connectivity monitored
- [ ] Database performance monitored
- [ ] DNS query monitoring

---

## Backup Configuration

### [ ] Database Backups
- [ ] Backup script created and tested
- [ ] Automated backup schedule configured
- [ ] Backup storage location configured
- [ ] Backup restoration tested

### [ ] Application Backups
- [ ] Code repository backed up (GitHub)
- [ ] Configuration files backed up
- [ ] Environment variables documented
- [ ] Deployment scripts backed up

### [ ] DNS Backups
- [ ] Zone files backed up
- [ ] BIND9 configuration backed up
- [ ] DNS configuration documented

---

## Documentation

### [ ] Deployment Documentation
- [ ] Network diagram created with all three VMs
- [ ] IP addresses and hostnames documented
- [ ] Configuration steps documented
- [ ] Troubleshooting guide created

### [ ] Maintenance Procedures
- [ ] Update procedures documented
- [ ] Backup procedures documented
- [ ] Monitoring procedures documented
- [ ] Emergency contact procedures documented

---

## Final Verification

### [ ] Production Readiness
- [ ] All tests pass
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Documentation complete

### [ ] Go-Live Checklist
- [ ] DNS configured and working
- [ ] SSL certificate active (if using HTTPS)
- [ ] External access configured
- [ ] Team notified of deployment
- [ ] Rollback plan prepared

---

**Once all items are checked, your superhero website is ready for production!**

## Quick Commands for Verification

```bash
# Check all VMs are running
ssh user@192.168.1.10 "pm2 status"
ssh user@192.168.1.11 "sudo systemctl status mongod"
ssh user@192.168.1.12 "sudo systemctl status bind9"

# Test website access
curl http://192.168.1.10
curl http://www.superhero.local

# Test database connection
ssh user@192.168.1.10 "telnet db.superhero.local 27017"

# Test DNS resolution
nslookup www.superhero.local 192.168.1.12
nslookup db.superhero.local 192.168.1.12
``` 
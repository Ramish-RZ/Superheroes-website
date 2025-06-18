# DNS Server VM Deployment Guide (BIND9)

This guide explains how to set up a dedicated DNS server VM running BIND9 for your superhero website deployment.

---

## VM Architecture Overview

```
Internet
    ↓
[DNS Server VM] ←→ [Web Server VM] ←→ [Database VM]
     ↑                    ↑                    ↑
   BIND9              Nginx              MongoDB
   (Port 53)         (Port 80/443)      (Port 27017)
```

---

## 1. Create DNS Server VM in vSphere

### DNS Server VM Specifications
- **Name**: `superhero-dns-server`
- **OS**: Ubuntu Server 22.04 LTS
- **Resources**: 1 vCPU, 2GB RAM, 20GB Storage
- **Network**: Same network as other VMs
- **IP Address**: `192.168.1.12` (static)

---

## 2. SSH into Your DNS Server VM
```bash
ssh <your-username>@192.168.1.12
```

---

## 3. Update and Install BIND9
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install BIND9 DNS server
sudo apt install -y bind9 bind9utils bind9-doc

# Install additional tools
sudo apt install -y dnsutils net-tools
```

---

## 4. Configure BIND9

### 4.1 Backup Original Configuration
```bash
sudo cp /etc/bind/named.conf /etc/bind/named.conf.backup
sudo cp /etc/bind/named.conf.options /etc/bind/named.conf.options.backup
sudo cp /etc/bind/named.conf.local /etc/bind/named.conf.local.backup
```

### 4.2 Configure Main BIND9 Options
```bash
sudo nano /etc/bind/named.conf.options
```

Replace the content with:
```conf
options {
        directory "/var/cache/bind";

        // Listen on all interfaces
        listen-on { any; };
        listen-on-v6 { any; };

        // Allow queries from your network
        allow-query { 
                localhost; 
                192.168.1.0/24;  // Your network
        };

        // Forward queries to external DNS servers
        forwarders {
                8.8.8.8;     // Google DNS
                8.8.4.4;     // Google DNS secondary
        };

        // Enable recursion
        recursion yes;

        // Security settings
        allow-recursion { localhost; 192.168.1.0/24; };
        allow-transfer { none; };

        // DNSSEC settings
        dnssec-validation auto;

        // Logging
        logging {
                channel default_log {
                        file "/var/log/bind/named.log" versions 3 size 5m;
                        severity info;
                        print-time yes;
                        print-severity yes;
                        print-category yes;
                };
                category default { default_log; };
        };
};
```

### 4.3 Create Zone Configuration
```bash
sudo nano /etc/bind/named.conf.local
```

Add your zone configuration:
```conf
// Include zone files
include "/etc/bind/zones.rfc1918";

// Forward zone for superhero.local
zone "superhero.local" {
        type master;
        file "/etc/bind/zones/superhero.local.db";
        allow-transfer { none; };
};

// Reverse zone for 192.168.1.x network
zone "1.168.192.in-addr.arpa" {
        type master;
        file "/etc/bind/zones/192.168.1.rev";
        allow-transfer { none; };
};
```

---

## 5. Create Zone Files

### 5.1 Create Zones Directory
```bash
sudo mkdir -p /etc/bind/zones
```

### 5.2 Create Forward Zone File
```bash
sudo nano /etc/bind/zones/superhero.local.db
```

Add the following content:
```conf
; Zone file for superhero.local
$TTL    86400
@       IN      SOA     ns1.superhero.local. admin.superhero.local. (
                        2023120101      ; Serial
                        3600            ; Refresh
                        1800            ; Retry
                        1209600         ; Expire
                        86400 )         ; Negative Cache TTL

; Name servers
@       IN      NS      ns1.superhero.local.

; A records
ns1     IN      A       192.168.1.12
www     IN      A       192.168.1.10    ; Web server
db      IN      A       192.168.1.11    ; Database server
dns     IN      A       192.168.1.12    ; DNS server

; CNAME records
superhero.local. IN     CNAME   www.superhero.local.
```

### 5.3 Create Reverse Zone File
```bash
sudo nano /etc/bind/zones/192.168.1.rev
```

Add the following content:
```conf
; Reverse zone file for 192.168.1.x network
$TTL    86400
@       IN      SOA     ns1.superhero.local. admin.superhero.local. (
                        2023120101      ; Serial
                        3600            ; Refresh
                        1800            ; Retry
                        1209600         ; Expire
                        86400 )         ; Negative Cache TTL

; Name servers
@       IN      NS      ns1.superhero.local.

; PTR records
10      IN      PTR     www.superhero.local.
11      IN      PTR     db.superhero.local.
12      IN      PTR     ns1.superhero.local.
```

---

## 6. Set Proper Permissions
```bash
# Set ownership
sudo chown -R bind:bind /etc/bind/zones

# Set permissions
sudo chmod 644 /etc/bind/zones/*.db
sudo chmod 644 /etc/bind/zones/*.rev

# Create log directory
sudo mkdir -p /var/log/bind
sudo chown bind:bind /var/log/bind
```

---

## 7. Test BIND9 Configuration
```bash
# Test configuration syntax
sudo named-checkconf /etc/bind/named.conf

# Test zone files
sudo named-checkzone superhero.local /etc/bind/zones/superhero.local.db
sudo named-checkzone 1.168.192.in-addr.arpa /etc/bind/zones/192.168.1.rev

# If all tests pass, restart BIND9
sudo systemctl restart bind9
sudo systemctl enable bind9
```

---

## 8. Configure Firewall
```bash
# Allow DNS traffic
sudo ufw allow 53/tcp
sudo ufw allow 53/udp

# Allow SSH
sudo ufw allow ssh

# Enable firewall
sudo ufw enable
```

---

## 9. Test DNS Resolution

### 9.1 Test from DNS Server
```bash
# Test forward lookup
nslookup www.superhero.local 127.0.0.1

# Test reverse lookup
nslookup 192.168.1.10 127.0.0.1

# Test external resolution
nslookup google.com 127.0.0.1
```

### 9.2 Test from Other VMs
From your web server VM:
```bash
# Test DNS resolution
nslookup www.superhero.local 192.168.1.12
nslookup db.superhero.local 192.168.1.12
```

---

## 10. Configure Other VMs to Use DNS Server

### 10.1 Update Web Server VM
```bash
# Edit network configuration
sudo nano /etc/netplan/01-netcfg.yaml
```

Add DNS server:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: no
      addresses:
        - 192.168.1.10/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [192.168.1.12, 8.8.8.8]  # Your DNS server first
```

Apply changes:
```bash
sudo netplan apply
```

### 10.2 Update Database VM
```bash
# Edit network configuration
sudo nano /etc/netplan/01-netcfg.yaml
```

Add DNS server:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: no
      addresses:
        - 192.168.1.11/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [192.168.1.12, 8.8.8.8]  # Your DNS server first
```

Apply changes:
```bash
sudo netplan apply
```

---

## 11. Update Application Configuration

### 11.1 Update Web Server Environment Variables
In your web server's `.env` file:
```bash
# Use hostnames instead of IP addresses
MONGODB_URI=mongodb://db.superhero.local:27017/superhero-db
```

### 11.2 Test Application Connectivity
```bash
# From web server VM
ping db.superhero.local
telnet db.superhero.local 27017
```

---

## 12. DNS Monitoring and Maintenance

### 12.1 Check BIND9 Status
```bash
# Check service status
sudo systemctl status bind9

# View logs
sudo tail -f /var/log/bind/named.log

# Check listening ports
sudo netstat -tlnp | grep :53
```

### 12.2 Update Zone Files
When you need to add new records:
```bash
# Edit zone file
sudo nano /etc/bind/zones/superhero.local.db

# Increment serial number (YYYYMMDDNN format)
# Add new records

# Test zone file
sudo named-checkzone superhero.local /etc/bind/zones/superhero.local.db

# Reload BIND9
sudo systemctl reload bind9
```

### 12.3 Backup Configuration
```bash
# Create backup directory
sudo mkdir -p /home/<username>/dns-backup

# Backup configuration files
sudo cp -r /etc/bind /home/<username>/dns-backup/
sudo cp /etc/netplan/01-netcfg.yaml /home/<username>/dns-backup/
```

---

## 13. Security Considerations

### 13.1 Restrict Zone Transfers
Zone transfers are already disabled in the configuration.

### 13.2 Monitor DNS Queries
```bash
# View DNS query logs
sudo tail -f /var/log/bind/named.log | grep query
```

### 13.3 Regular Updates
```bash
# Keep BIND9 updated
sudo apt update && sudo apt upgrade bind9
```

---

## 14. Troubleshooting

### 14.1 Common Issues

**BIND9 won't start:**
```bash
# Check configuration
sudo named-checkconf /etc/bind/named.conf

# Check logs
sudo journalctl -u bind9 -f
```

**DNS resolution not working:**
```bash
# Test from DNS server
nslookup www.superhero.local 127.0.0.1

# Check firewall
sudo ufw status

# Check BIND9 is listening
sudo netstat -tlnp | grep :53
```

**Zone file errors:**
```bash
# Test zone files
sudo named-checkzone superhero.local /etc/bind/zones/superhero.local.db
sudo named-checkzone 1.168.192.in-addr.arpa /etc/bind/zones/192.168.1.rev
```

---

## Notes
- This DNS server provides internal name resolution for your VMs
- External DNS queries are forwarded to Google DNS (8.8.8.8)
- Zone files are configured for the `superhero.local` domain
- All VMs should use this DNS server as their primary nameserver
- Regular backups of zone files are recommended

---

**Your DNS server is now configured and ready to serve your superhero website deployment!** 
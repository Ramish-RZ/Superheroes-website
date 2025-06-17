# Network Setup Guide for vSphere VMs

This guide explains how to configure your VMs in vSphere for the superhero website deployment with proper network isolation and DNS services.

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

## 1. Create Three VMs in vSphere

### Web Server VM
- **Name**: `superhero-web-server`
- **OS**: Ubuntu Server 22.04 LTS
- **Resources**: 2 vCPU, 4GB RAM, 20GB Storage
- **Network**: VM Network (or create a custom network)
- **IP Address**: `192.168.1.10`

### Database VM
- **Name**: `superhero-database`
- **OS**: Ubuntu Server 22.04 LTS
- **Resources**: 1 vCPU, 2GB RAM, 50GB Storage
- **Network**: Same network as web server VM
- **IP Address**: `192.168.1.11`

### DNS Server VM
- **Name**: `superhero-dns-server`
- **OS**: Ubuntu Server 22.04 LTS
- **Resources**: 1 vCPU, 2GB RAM, 20GB Storage
- **Network**: Same network as other VMs
- **IP Address**: `192.168.1.12`

---

## 2. Network Configuration

### Option A: Using Default VM Network
All VMs will be on the same network and can communicate directly.

### Option B: Create Custom Network (Recommended)
1. In vSphere, go to **Networking**
2. Create a new **Distributed Port Group**
3. Name it `superhero-network`
4. Assign all three VMs to this network

---

## 3. IP Addressing Plan

### Static IP Assignment (Recommended)
Configure static IPs in each VM:

**Web Server VM**:
```
IP: 192.168.1.10
Gateway: 192.168.1.1
DNS: 192.168.1.12, 8.8.8.8
```

**Database VM**:
```
IP: 192.168.1.11
Gateway: 192.168.1.1
DNS: 192.168.1.12, 8.8.8.8
```

**DNS Server VM**:
```
IP: 192.168.1.12
Gateway: 192.168.1.1
DNS: 8.8.8.8, 8.8.4.4
```

### Configure Static IPs
On each VM, edit `/etc/netplan/01-netcfg.yaml`:

**Web Server VM**:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:  # Your network interface name
      dhcp4: no
      addresses:
        - 192.168.1.10/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [192.168.1.12, 8.8.8.8]
```

**Database VM**:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:  # Your network interface name
      dhcp4: no
      addresses:
        - 192.168.1.11/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [192.168.1.12, 8.8.8.8]
```

**DNS Server VM**:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:  # Your network interface name
      dhcp4: no
      addresses:
        - 192.168.1.12/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply changes on each VM:
```bash
sudo netplan apply
```

---

## 4. DNS Configuration

### 4.1 Domain Name Plan
- **Domain**: `superhero.local`
- **Web Server**: `www.superhero.local` (192.168.1.10)
- **Database**: `db.superhero.local` (192.168.1.11)
- **DNS Server**: `ns1.superhero.local` (192.168.1.12)

### 4.2 DNS Records
The DNS server will provide these records:
```
www.superhero.local.    IN A    192.168.1.10
db.superhero.local.     IN A    192.168.1.11
ns1.superhero.local.    IN A    192.168.1.12
superhero.local.        IN CNAME www.superhero.local.
```

---

## 5. Network Security

### Firewall Rules

**Web Server VM** (Allow incoming):
- SSH (Port 22)
- HTTP (Port 80)
- HTTPS (Port 443)
- Outgoing to Database VM (Port 27017)
- Outgoing to DNS Server (Port 53)

**Database VM** (Restrict access):
- SSH (Port 22) - from management network only
- MongoDB (Port 27017) - from Web Server VM only

**DNS Server VM** (Allow DNS queries):
- SSH (Port 22) - from management network only
- DNS (Port 53 TCP/UDP) - from all VMs in network

### vSphere Security Groups (if available)
Create security groups to restrict traffic between VMs.

---

## 6. DNS Resolution Testing

### 6.1 Test from Web Server VM
```bash
# Test DNS resolution
nslookup www.superhero.local 192.168.1.12
nslookup db.superhero.local 192.168.1.12

# Test connectivity
ping db.superhero.local
telnet db.superhero.local 27017
```

### 6.2 Test from Database VM
```bash
# Test DNS resolution
nslookup www.superhero.local 192.168.1.12
nslookup ns1.superhero.local 192.168.1.12

# Test connectivity
ping www.superhero.local
```

### 6.3 Test from DNS Server VM
```bash
# Test internal resolution
nslookup www.superhero.local 127.0.0.1
nslookup db.superhero.local 127.0.0.1

# Test external resolution
nslookup google.com 127.0.0.1
```

---

## 7. Application Configuration

### 7.1 Update Environment Variables
In your web server's `.env` file:
```bash
# Use hostnames instead of IP addresses
MONGODB_URI=mongodb://db.superhero.local:27017/superhero-db
```

### 7.2 Test Application Connectivity
```bash
# From web server VM
ping db.superhero.local
telnet db.superhero.local 27017

# Test DNS resolution
nslookup db.superhero.local
```

---

## 8. External Access

### For Internet Access
Configure your web server VM to be accessible from the internet:
- Set up port forwarding in vSphere
- Configure external firewall rules
- Use a public IP or domain name

### For Development/Testing
- Use vSphere console access
- Set up VPN if needed
- Use SSH tunneling for secure access

---

## 9. Monitoring and Troubleshooting

### Network Commands
```bash
# Check network interfaces
ip addr show

# Check routing table
ip route show

# Test connectivity
ping <target-ip>

# Check open ports
sudo netstat -tlnp

# Monitor network traffic
sudo tcpdump -i any

# Test DNS resolution
nslookup <hostname> <dns-server>
```

### vSphere Network Tools
- Use vSphere's network monitoring
- Check VM network adapter settings
- Verify network connectivity between VMs

---

## 10. Backup Network Configuration

### Document Your Setup
Create a network diagram showing:
- VM IP addresses and hostnames
- Network topology
- Firewall rules
- DNS configuration

### Backup Network Configs
```bash
# Backup network configuration on each VM
sudo cp /etc/netplan/01-netcfg.yaml /home/<username>/backup/
sudo cp /etc/hosts /home/<username>/backup/
```

---

## Notes
- All VMs are on the same network for easy communication
- DNS server provides internal name resolution
- Use hostnames instead of IP addresses in applications
- Restrict database access to only the web server VM
- Document all network configurations
- Test connectivity before deploying applications

---

**Your network is now configured for the superhero website deployment with DNS services!** 
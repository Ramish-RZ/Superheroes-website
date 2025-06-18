# SSH Key Setup Guide for All VMs

This guide will help you securely set up SSH key authentication for all your VMs. **For simplicity and security, use one SSH key pair for your user and copy the public key to each VM.**

---

## 1. Generate an SSH Key Pair (on your local machine)

If you don't already have an SSH key, generate one:

### On Windows (PowerShell or Command Prompt):
```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```
- Press Enter to accept the default file location (`C:\Users\<your-username>\.ssh\id_ed25519`)
- Enter a passphrase for extra security (optional, but recommended)

### On Linux/macOS:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
- Press Enter to accept the default file location (`~/.ssh/id_ed25519`)
- Enter a passphrase for extra security (optional, but recommended)

---

## 2. Copy Your Public Key to Each VM

Repeat this step for each VM (`superhero-web-server`, `superhero-database`, `superhero-dns-server`).

### Using `ssh-copy-id` (Linux/macOS, or Windows with WSL):
```bash
ssh-copy-id <your-username>@<vm-ip>
```

### Or Manually (All Platforms):
1. **Show your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   or on Windows:
   ```powershell
   type $env:USERPROFILE\.ssh\id_ed25519.pub
   ```
2. **Copy the output.**
3. **SSH into your VM:**
   ```bash
   ssh <your-username>@<vm-ip>
   ```
4. **On the VM, run:**
   ```bash
   mkdir -p ~/.ssh
   nano ~/.ssh/authorized_keys
   ```
   Paste your public key on a new line, save and exit (Ctrl+O, Enter, Ctrl+X in nano).
5. **Set correct permissions:**
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

---

## 3. Test SSH Key Authentication

On your local machine, run:
```bash
ssh <your-username>@<vm-ip>
```
- You should **not** be prompted for a password (unless you set a passphrase for your key).
- Repeat for each VM.

---

## 4. (Optional) Disable Password Authentication (for extra security)
**Do this only after confirming key-based login works!**

On each VM:
```bash
sudo nano /etc/ssh/sshd_config
```
- Find and set:
  ```
  PasswordAuthentication no
  PermitRootLogin no
  ```
- Save and exit, then restart SSH:
  ```bash
  sudo systemctl restart ssh
  ```

---

## 5. Tips
- **Keep your private key safe!** Never share it.
- **Use one key pair for all VMs** for simplicity. (If you want, you can generate separate keys for each VM, but it's not necessary for most student projects.)
- **Back up your private key** in a secure location.
- **If you lose your private key,** you will lose access to your VMs unless password login is still enabled.

---

**You now have secure, passwordless SSH access to all your VMs!** 
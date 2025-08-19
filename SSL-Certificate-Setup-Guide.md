# SSL Certificate Setup Guide for tms.aarohisewing.com

**Domain**: tms.aarohisewing.com  
**Server**: 119.18.55.169  
**SSL Provider**: Let's Encrypt (Free SSL Certificate)  
**Web Server**: Nginx  

---

## 📋 Prerequisites

- ✅ Domain pointing to your server IP (119.18.55.169)
- ✅ Nginx installed and running
- ✅ Port 80 and 443 open in firewall
- ✅ Root/sudo access to server

---

## 🔐 Step 1: Install Certbot (Let's Encrypt Client)

```bash
# Update package manager
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
nginx -v
```

---

## 🌐 Step 2: Obtain SSL Certificate

### Method A: Automatic Nginx Configuration (Recommended)
```bash
# This automatically configures Nginx for you
sudo certbot --nginx -d tms.aarohisewing.com

# During setup, you'll be prompted for:
# 1. Email address (for renewal notifications)
# 2. Agree to terms of service (Type: A)
# 3. Share email with EFF (Type: Y or N)
# 4. Redirect HTTP to HTTPS? (Select: 2 - Redirect)
```

### Method B: Certificate Only (Manual Configuration)
```bash
# Get certificate only, configure Nginx manually
sudo certbot certonly --nginx -d tms.aarohisewing.com
```

---

## 🔧 Step 3: Manual Nginx Configuration (If Method B Used)

If certbot couldn't automatically configure Nginx, create manual configuration:

```bash
# Create SSL-enabled Nginx configuration
sudo tee /etc/nginx/sites-available/aarohi-tms-ssl > /dev/null <<'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name tms.aarohisewing.com aarohisewing.com 119.18.55.169;
    return 301 https://tms.aarohisewing.com$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name tms.aarohisewing.com;
    
    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/tms.aarohisewing.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tms.aarohisewing.com/privkey.pem;
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Frontend Configuration
    root /opt/aarohi-tms/frontend;
    index index.html index.htm;
    
    # Frontend - React Build Files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Additional proxy settings for WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Static assets with aggressive caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;
}
EOF

# Enable the SSL configuration
sudo rm -f /etc/nginx/sites-enabled/aarohi-tms
sudo ln -sf /etc/nginx/sites-available/aarohi-tms-ssl /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx if configuration is valid
sudo systemctl restart nginx
```

---

## 🔥 Step 4: Configure Firewall

```bash
# Allow HTTPS port
sudo ufw allow 443

# Allow HTTP port (for redirects and certbot renewal)
sudo ufw allow 80

# Check firewall status
sudo ufw status

# Expected output should show:
# 22/tcp     ALLOW       Anywhere
# 80/tcp     ALLOW       Anywhere  
# 443/tcp    ALLOW       Anywhere
# 3306/tcp   ALLOW       Anywhere
# 8080/tcp   ALLOW       Anywhere
```

---

## 🔄 Step 5: Set Up Auto-Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal:

```bash
# Create renewal hook to reload nginx after renewal
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy

sudo tee /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh > /dev/null <<'EOF'
#!/bin/bash
# Reload nginx after certificate renewal
systemctl reload nginx
echo "$(date): Nginx reloaded after SSL certificate renewal" >> /var/log/ssl-renewal.log
EOF

# Make the script executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

# Test auto-renewal process (dry run - no actual renewal)
sudo certbot renew --dry-run

# Check if certbot timer is enabled for automatic renewal
sudo systemctl status certbot.timer

# Enable certbot timer if not already enabled
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Check when next renewal is scheduled
sudo certbot certificates
```

---

## ✅ Step 6: Verification and Testing

### Test SSL Certificate Installation

```bash
# Test HTTPS access (should return 200 OK)
curl -I https://tms.aarohisewing.com/

# Test HTTP to HTTPS redirect (should return 301 redirect)
curl -I http://tms.aarohisewing.com/

# Test backend API over HTTPS
curl https://tms.aarohisewing.com/api/health

# Check SSL certificate details
openssl s_client -connect tms.aarohisewing.com:443 -servername tms.aarohisewing.com < /dev/null

# View certificate information via certbot
sudo certbot certificates
```

### Browser Testing

1. **Visit**: https://tms.aarohisewing.com/
2. **Check**: Green padlock icon in address bar
3. **Verify**: Certificate details show "Let's Encrypt" as issuer
4. **Test**: HTTP version redirects to HTTPS automatically

### SSL Strength Testing

```bash
# Test SSL configuration (external tool)
# Visit: https://www.ssllabs.com/ssltest/
# Enter: tms.aarohisewing.com
# Expected Grade: A or A+
```

---

## 📊 Step 7: Monitoring and Maintenance

### Check Certificate Status

```bash
# View all certificates
sudo certbot certificates

# Check certificate expiry
sudo openssl x509 -in /etc/letsencrypt/live/tms.aarohisewing.com/cert.pem -noout -dates

# Check renewal timer status
sudo systemctl list-timers | grep certbot

# View renewal logs
sudo journalctl -u certbot.timer
```

### Manual Renewal (if needed)

```bash
# Force renewal (only if certificate expires in <30 days)
sudo certbot renew --force-renewal

# Renew specific certificate
sudo certbot renew --cert-name tms.aarohisewing.com

# Test renewal without actually renewing
sudo certbot renew --dry-run
```

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Certificate Creation Failed
```bash
# Check if domain points to your server
nslookup tms.aarohisewing.com
ping tms.aarohisewing.com

# Ensure port 80 is accessible
sudo netstat -tlnp | grep :80
curl -I http://tms.aarohisewing.com/
```

#### 2. Nginx Configuration Errors
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload nginx
sudo systemctl reload nginx
```

#### 3. Certificate Installation Issues
```bash
# Check certificate files exist
sudo ls -la /etc/letsencrypt/live/tms.aarohisewing.com/

# Verify permissions
sudo chmod 644 /etc/letsencrypt/live/tms.aarohisewing.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/tms.aarohisewing.com/privkey.pem
```

#### 4. Auto-Renewal Issues
```bash
# Check certbot timer status
sudo systemctl status certbot.timer

# View certbot logs
sudo journalctl -u certbot

# Manual test renewal
sudo certbot renew --dry-run --verbose
```

---

## 📋 Final Checklist

After SSL installation, verify these items:

- [ ] **HTTPS Access**: https://tms.aarohisewing.com/ loads correctly
- [ ] **HTTP Redirect**: http://tms.aarohisewing.com/ redirects to HTTPS
- [ ] **API Access**: https://tms.aarohisewing.com/api/health returns API response
- [ ] **Green Padlock**: Browser shows secure connection
- [ ] **Certificate Valid**: Certificate shows Let's Encrypt issuer
- [ ] **Auto-Renewal**: `sudo certbot renew --dry-run` succeeds
- [ ] **Nginx Test**: `sudo nginx -t` passes
- [ ] **Services Running**: nginx, certbot.timer active
- [ ] **Firewall**: Ports 80, 443 allowed
- [ ] **Performance**: SSL Labs grade A/A+

---

## 📈 Performance Optimization (Optional)

### Enable HTTP/2 and Additional Optimizations

```bash
# Add these to your nginx server block for better performance
# (Already included in the configuration above)

# HTTP/2 support
listen 443 ssl http2;

# SSL session caching
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;

# Security headers (already included above)
# Gzip compression (already included above)
```

---

## 🔄 Certificate Renewal Schedule

- **Certificate Lifetime**: 90 days
- **Auto-Renewal Check**: Daily (via systemd timer)
- **Renewal Threshold**: 30 days before expiry
- **Renewal Log**: `/var/log/letsencrypt/letsencrypt.log`
- **Reload Hook**: Automatically reloads nginx after renewal

---

## 📞 Support Resources

- **Let's Encrypt Documentation**: https://letsencrypt.org/docs/
- **Certbot Documentation**: https://certbot.eff.org/docs/
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **Community Support**: https://community.letsencrypt.org/

---

## ✅ Success Confirmation

Your SSL certificate is successfully installed when:

1. **Browser Access**: https://tms.aarohisewing.com/ shows green padlock
2. **API Access**: https://tms.aarohisewing.com/api/health returns JSON response
3. **Automatic Redirect**: http://tms.aarohisewing.com/ → https://tms.aarohisewing.com/
4. **SSL Grade**: A or A+ rating on SSL Labs test
5. **Auto-Renewal**: `sudo certbot renew --dry-run` completes successfully

**Certificate Details:**
- **Issuer**: Let's Encrypt Authority X3
- **Validity**: 90 days from issue date
- **Encryption**: RSA 2048-bit or ECDSA 256-bit
- **Protocols**: TLS 1.2, TLS 1.3
- **Auto-Renewal**: Enabled via systemd timer

---

**🎉 Congratulations! Your application is now secured with HTTPS!**

**Final URLs:**
- **Main App**: https://tms.aarohisewing.com/
- **API Health**: https://tms.aarohisewing.com/api/health
- **Swagger UI**: https://tms.aarohisewing.com/api/swagger-ui.html

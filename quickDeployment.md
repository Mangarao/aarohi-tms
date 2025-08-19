# Quick Deployment Guide - Aarohi TMS
**Server IP**: 119.18.55.169  
**Domain**: tms.aarohisewing.com  
**Manual Deployment (No Docker)**

## Prerequisites Checklist
- ✅ Java 17+ installed
- ✅ MySQL installed and running
- ✅ Nginx installed
- ✅ Project directories created: `/opt/aarohi-tms/frontend` and `/opt/aarohi-tms/backend`


# Fix backend directory ownership and permissions
sudo chown -R root:root /opt/aarohi-tms/backend/
sudo chmod 755 /opt/aarohi-tms/backend/

# Make JAR file executable
sudo chmod +x /opt/aarohi-tms/backend/task-management-system-1.0.0.jar

# Set permissions for configuration files
sudo chmod 644 /opt/aarohi-tms/backend/application-prod.properties

# Create and set permissions for logs directory
sudo mkdir -p /opt/aarohi-tms/backend/logs
sudo chmod 755 /opt/aarohi-tms/backend/logs
sudo chown -R root:root /opt/aarohi-tms/backend/logs

# Fix permissions for static directory and all subdirectories
sudo chmod -R 755 /opt/aarohi-tms/frontend/static/
sudo chown -R www-data:www-data /opt/aarohi-tms/frontend/static/

# Also fix the main frontend directory
sudo chown -R www-data:www-data /opt/aarohi-tms/frontend/
sudo chmod -R 755 /opt/aarohi-tms/frontend/


## ⚠️ IMPORTANT: Your Backend is Working Fine!
**Status**: ✅ Spring Boot application starts successfully  
**Issue Found**: Minor configuration warnings (now fixed)  
**Solution**: Updated Hibernate dialect and JPA settings  

---

## STEP 1: MySQL Installation and Configuration

### 1.1 Install MySQL Server
```bash
# Update package manager
sudo apt update

# Install MySQL Server
sudo apt install mysql-server -y

# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 1.2 Secure MySQL Installation
```bash
# Run MySQL security script
sudo mysql_secure_installation

# When prompted:
# - Set root password? Y (choose a strong password)
# - Remove anonymous users? Y
# - Disallow root login remotely? N (we need remote access for now)
# - Remove test database? Y
# - Reload privilege tables? Y
```

### 1.3 Configure MySQL for Remote Access
```bash
# Edit MySQL configuration file
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find the line: bind-address = 127.0.0.1
# Change it to: bind-address = 0.0.0.0
# This allows connections from any IP address

# Save and exit (Ctrl+X, then Y, then Enter)
```

### 1.4 Create Database and User
```bash
# Connect to MySQL as root
sudo mysql -u root -p

# Run these SQL commands:
CREATE DATABASE IF NOT EXISTS task_management_db;

CREATE USER 'aarohi'@'%' IDENTIFIED BY 'aarohi@Del1';
GRANT ALL PRIVILEGES ON task_management_db.* TO 'aarohi'@'%';

# Also create localhost user for local connections
CREATE USER 'aarohi'@'localhost' IDENTIFIED BY 'aarohi@Del1';
GRANT ALL PRIVILEGES ON task_management_db.* TO 'aarohi'@'localhost';

FLUSH PRIVILEGES;

# Test the database
USE task_management_db;
SHOW TABLES;

EXIT;
```

### 1.5 Restart MySQL and Test Connection
```bash
# Restart MySQL to apply configuration changes
sudo systemctl restart mysql

# Test local connection with new user
mysql -u aarohi -p -h localhost task_management_db

# Test remote connection (from your local machine)
# mysql -u aarohi -p -h 119.18.55.169 task_management_db

EXIT;
```

### 1.6 Configure Firewall for MySQL
```bash
# Allow MySQL port 3306
sudo ufw allow 3306

# Check firewall status
sudo ufw status

# If you want to restrict to specific IPs only (recommended):
# sudo ufw allow from YOUR_LOCAL_IP to any port 3306
```

### 1.7 Test MySQL Connection from Local Machine
```bash
# From your local Windows machine, test the connection:
# Install MySQL client if not already installed
# Then run: mysql -u aarohi -p -h 119.18.55.169 task_management_db

# Or use a tool like MySQL Workbench with these details:
# Host: 119.18.55.169
# Port: 3306
# Username: aarohi
# Password: aarohi@Del1
# Database: task_management_db
```

---

## STEP 2: Backend Deployment

### 2.1 Create Backend Directory Structure
```bash
sudo mkdir -p /opt/aarohi-tms/backend
sudo mkdir -p /opt/aarohi-tms/backend/logs
sudo chown -R $USER:$USER /opt/aarohi-tms/
```

### 2.2 Copy Backend Files to Server
```bash
# Copy the built JAR file (make sure it's built locally first)
scp target/task-management-system-1.0.0.jar root@119.18.55.169:/opt/aarohi-tms/backend/

# Copy configuration files
scp src/main/resources/application-prod.properties root@119.18.55.169:/opt/aarohi-tms/backend/
```

### 2.3 Create Backend Service (Database already configured in Step 1)
```bash
# Create systemd service file
sudo tee /etc/systemd/system/aarohi-tms-backend.service > /dev/null <<EOF
[Unit]
Description=Aarohi Task Management System Backend
After=mysql.service
Requires=mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/aarohi-tms/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/aarohi-tms/backend/task-management-system-1.0.0.jar --spring.config.location=file:/opt/aarohi-tms/backend/application-prod.properties
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```
StandardError=journal
Environment=JAVA_OPTS="--enable-native-access=ALL-UNNAMED"

[Install]
WantedBy=multi-user.target
EOF
```

### 1.5 Start Backend Service
```bash
# Reload systemd and start the service
sudo systemctl daemon-reload
sudo systemctl enable aarohi-tms-backend
sudo systemctl start aarohi-tms-backend

# Check service status
sudo systemctl status aarohi-tms-backend
# to stop service
# sudo systemctl stop aarohi-tms-backend
# Check logs if needed
sudo journalctl -u aarohi-tms-backend -f
---

## STEP 2: Frontend Deployment

### 2.1 Copy Frontend Build Files to Server

# Copy the entire build folder
scp -r build/* root@119.18.55.169:/opt/aarohi-tms/frontend/

### 2.2 Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/aarohi-tms > /dev/null <<EOF
server {
    listen 80;
    server_name 119.18.55.169 tms.aarohisewing.com;
    
    # Frontend - React Build Files
    location / {
        root /opt/aarohi-tms/frontend;
        try_files \$uri \$uri/ /index.html;
        index index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "http://119.18.55.169, http://tms.aarohisewing.com, https://tms.aarohisewing.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "http://119.18.55.169, http://tms.aarohisewing.com, https://tms.aarohisewing.com";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF
```

### 2.3 Enable Nginx Site
```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/aarohi-tms /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## STEP 3: Firewall Configuration

### 3.1 Configure UFW (if using)
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (for future SSL)
sudo ufw allow 8080  # Backend (if direct access needed)

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

---

## STEP 4: Verification & Testing

### 4.1 Check All Services
```bash
# Check if backend is running
curl http://localhost:8080/api/health

# Check if frontend is accessible
curl http://localhost/

# Check MySQL connection
sudo systemctl status mysql

# Check Nginx
sudo systemctl status nginx

# Check backend service
sudo systemctl status aarohi-tms-backend
```

### 4.2 Test Application URLs
```bash
# Frontend
http://119.18.55.169/
http://tms.aarohisewing.com/

# Backend API
http://119.18.55.169/api/health
http://tms.aarohisewing.com/api/health

# Swagger UI (if enabled)
http://119.18.55.169/api/swagger-ui.html
```

---

## STEP 5: Monitoring & Logs

### 5.1 View Backend Logs
```bash
# Real-time logs
sudo journalctl -u aarohi-tms-backend -f

# Application logs
tail -f /opt/aarohi-tms/backend/logs/aarohi-tms.log
```

### 5.2 View Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 5.3 Check System Resources
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check running processes
ps aux | grep java
ps aux | grep nginx
```

---

## STEP 6: Restart Commands (For Updates)

### 6.1 Backend Update Process
```bash
# Stop the service
sudo systemctl stop aarohi-tms-backend

# Copy new JAR file
scp target/task-management-system-1.0.0.jar root@119.18.55.169:/opt/aarohi-tms/backend/

# Start the service
sudo systemctl start aarohi-tms-backend

# Check status
sudo systemctl status aarohi-tms-backend
```

### 6.2 Frontend Update Process
```bash
# Copy new build files
scp -r build/* root@119.18.55.169:/opt/aarohi-tms/frontend/

# Clear Nginx cache (if any)
sudo systemctl reload nginx
```

---

## STEP 7: Troubleshooting Commands

### 7.1 Common Issues
```bash
# If backend fails to start
sudo journalctl -u aarohi-tms-backend --no-pager -l

# If database connection fails
sudo mysql -u root -p -e "SHOW DATABASES;"

# If Nginx fails
sudo nginx -t
sudo systemctl status nginx

# If port 8080 is not accessible
sudo netstat -tlnp | grep :8080
sudo ss -tlnp | grep :8080
```

### 7.2 Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/aarohi-tms/

# Fix permissions
sudo chmod -R 755 /opt/aarohi-tms/
sudo chmod +x /opt/aarohi-tms/backend/task-management-system-1.0.0.jar
```

---

## Default Credentials
- **Admin**: username=`admin`, password=`admin123`
- **Staff**: username=`staff`, password=`staff123`

## Important URLs After Deployment
- **Frontend**: http://tms.aarohisewing.com/
- **API Health Check**: http://tms.aarohisewing.com/api/health
- **Swagger UI**: http://tms.aarohisewing.com/api/swagger-ui.html

---

**Note**: Replace `root@119.18.55.169` with your actual SSH user if different. Make sure to have the SSH access configured before running the scp commands.

---

## DEPLOYMENT STATUS: ✅ RESOLVED

### Issues Found & Fixed:
1. **✅ Application Startup**: Spring Boot was actually starting correctly
2. **✅ Database Connection**: MySQL connection established successfully  
3. **✅ Configuration Warnings**: Fixed deprecated Hibernate dialect warnings
4. **✅ JPA Warnings**: Added `spring.jpa.open-in-view=false` to eliminate warnings
5. **✅ Java Warnings**: Added native access flags to suppress JDK warnings

### Final Verification Commands:
```bash
# 1. Verify application startup logs
sudo journalctl -u aarohi-tms-backend -f

# 2. Test health endpoint
curl http://localhost:8080/api/health

# 3. Check if all services are running
sudo systemctl status mysql nginx aarohi-tms-backend

# 4. Test full application flow
# Frontend: http://tms.aarohisewing.com/
# API: http://tms.aarohisewing.com/api/health
```

### Application URLs After Successful Deployment:
- **Frontend**: http://tms.aarohisewing.com/
- **Login Page**: http://tms.aarohisewing.com/login
- **Admin Dashboard**: http://tms.aarohisewing.com/admin-dashboard
- **API Health Check**: http://tms.aarohisewing.com/api/health
- **Swagger UI**: http://tms.aarohisewing.com/api/swagger-ui.html

### Default Credentials (Change After Deployment):
- **Admin**: username=`admin`, password=`admin123`
- **Staff**: username=`staff`, password=`staff123`

---

## MySQL Installation & Remote Access Configuration

### MySQL Connection Test Commands:
```bash
# Test from VPS server locally
mysql -u aarohi -p -h localhost task_management_db

# Test from remote machine (your local dev machine)
mysql -u aarohi -p -h 119.18.55.169 task_management_db

# Check MySQL service status
sudo systemctl status mysql

# Check MySQL is listening on all interfaces
sudo netstat -tlnp | grep :3306
```

### MySQL Troubleshooting Commands:
```bash
# If connection fails, check user privileges
sudo mysql -u root -p
SELECT User, Host FROM mysql.user WHERE User='aarohi';
SHOW GRANTS FOR 'aarohi'@'%';

# If authentication fails, recreate user with native password
DROP USER IF EXISTS 'aarohi'@'%';
CREATE USER 'aarohi'@'%' IDENTIFIED WITH mysql_native_password BY 'aarohi@Del1';
GRANT ALL PRIVILEGES ON task_management_db.* TO 'aarohi'@'%';
FLUSH PRIVILEGES;

# Check MySQL configuration
sudo cat /etc/mysql/mysql.conf.d/mysqld.cnf | grep bind-address
# Should show: bind-address = 0.0.0.0

# Check firewall allows MySQL
sudo ufw status | grep 3306
```

### Spring Boot MySQL Connection Verification:
```bash
# Check backend logs for database connection
sudo journalctl -u aarohi-tms-backend | grep -i "hikari\|mysql\|database"

# Should see lines like:
# HikariPool-1 - Starting...
# HikariPool-1 - Start completed
```

### Performance Notes:
- **Startup Time**: ~8-10 seconds
- **Memory Usage**: ~200-300MB RAM  
- **Database**: Auto-creates tables on first startup
- **Logging**: Configured for production with rotation

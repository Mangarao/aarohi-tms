-- Task Management System Database Setup
-- Run this script to create the database

CREATE DATABASE IF NOT EXISTS task_management_db;
USE task_management_db;

-- The tables will be automatically created by Spring Boot JPA
-- This script is just for creating the database

-- Grant permissions (adjust as needed for your MySQL setup)
-- GRANT ALL PRIVILEGES ON task_management_db.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;

-- Sample data will be automatically inserted by the DataInitializer component
-- Default users:
-- Admin: username=admin, password=admin123
-- Staff: username=staff, password=staff123

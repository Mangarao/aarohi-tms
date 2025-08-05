# Backend - Task Management System

Spring Boot backend for the Task Management System.

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Database Configuration
1. Create a MySQL database:
   ```sql
   CREATE DATABASE task_management_db;
   ```

2. Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/task_management_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### Running the Application
1. Install dependencies:
   ```bash
   mvn clean install
   ```

2. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080`

### Default Users
The application automatically creates default users on first run:
- Admin: username=`admin`, password=`admin123`
- Staff: username=`staff`, password=`staff123`

### API Documentation
Base URL: `http://localhost:8080/api`

#### Authentication Endpoints
- `POST /auth/signin` - Login
- `POST /auth/signup` - Register new user

#### Complaint Endpoints
- `GET /complaints` - Get all complaints
- `POST /complaints` - Create complaint
- `GET /complaints/{id}` - Get complaint by ID
- `PUT /complaints/{id}` - Update complaint
- `DELETE /complaints/{id}` - Delete complaint

#### User Endpoints
- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Building for Production
```bash
mvn clean package
java -jar target/task-management-system-1.0.0.jar
```

### Testing
```bash
mvn test
```

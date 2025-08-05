# Task Management System

A full-stack web application for managing complaints and service requests for machine repair and maintenance services.

## Features

### User Roles
- **Admin**: Can manage users, view all complaints, assign complaints to staff
- **Staff**: Can view assigned complaints, update status, add expenses

### Core Functionality
- Complaint management (Create, Read, Update, Delete)
- User authentication and authorization
- Role-based access control
- Real-time dashboard with statistics
- Complaint assignment and tracking
- Expense management
- Mobile-responsive design

## Technology Stack

### Backend
- **Spring Boot** - Java web framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **MySQL** - Database
- **JWT** - Token-based authentication
- **Maven** - Dependency management

### Frontend
- **React** - Frontend framework
- **React Router** - Client-side routing
- **Bootstrap** - CSS framework
- **Axios** - HTTP client

## Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Database Setup
1. Create a MySQL database named `task_management_db`
2. Update database credentials in `backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/task_management_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## Default Login Credentials

### Admin Account
- **Username**: admin
- **Password**: admin123

### Staff Account
- **Username**: staff
- **Password**: staff123

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Complaints
- `GET /api/complaints` - Get all complaints (Admin only)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/{id}` - Get complaint by ID
- `PUT /api/complaints/{id}` - Update complaint
- `DELETE /api/complaints/{id}` - Delete complaint (Admin only)
- `PUT /api/complaints/{id}/assign/{staffId}` - Assign complaint to staff
- `PUT /api/complaints/{id}/status` - Update complaint status

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (Admin only)

### Expenses
- `GET /api/expenses` - Get all expenses (Admin only)
- `POST /api/expenses/complaint/{complaintId}` - Create expense for complaint
- `GET /api/expenses/complaint/{complaintId}` - Get expenses by complaint ID
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- full_name
- mobile_number (Unique)
- password (Encrypted)
- role (ADMIN/STAFF)
- is_active
- created_date

### Complaints Table
- id (Primary Key)
- customer_name
- mobile_number
- email
- address
- city
- state
- machine_name_model
- problem_description
- created_date
- under_warranty
- machine_purchase_date
- complaint_type
- status
- priority
- assigned_staff_id (Foreign Key)
- resolution_notes
- updated_date

### Expenses Table
- id (Primary Key)
- complaint_id (Foreign Key)
- added_by_user_id (Foreign Key)
- description
- amount
- expense_date
- receipt_number
- vendor_name
- notes

## Security Features
- JWT-based authentication
- Password encryption using BCrypt
- Role-based access control
- CORS configuration
- Input validation

## Development

### Code Structure
```
backend/
├── src/main/java/com/aarohi/tms/
│   ├── controller/     # REST controllers
│   ├── entity/         # JPA entities
│   ├── repository/     # Data repositories
│   ├── service/        # Business logic
│   ├── security/       # Security configuration
│   ├── dto/           # Data transfer objects
│   └── config/        # Configuration classes
└── src/main/resources/
    └── application.properties

frontend/
├── public/            # Static files
└── src/
    ├── components/    # React components
    ├── pages/         # Page components
    ├── services/      # API services
    └── App.js         # Main application
```

### Building for Production

#### Backend
```bash
cd backend
mvn clean package
java -jar target/task-management-system-1.0.0.jar
```

#### Frontend
```bash
cd frontend
npm run build
# Deploy the build folder to your web server
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Support
For support and questions, please contact the development team.

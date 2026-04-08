# Student ID Management System

A full-stack, comprehensive web application built on the MVC pattern to manage students and handle ID card lifecycles.

## Tech Stack
- **Frontend**: Pure HTML, CSS (Vanilla, Premium Design), JavaScript
- **Backend API**: Node.js, Express.js
- **Database**: MySQL 

## Features
- **Dashboard**: High-level statistical overview of operations.
- **Student Management**: Add, update, and manage student details (featuring auto age calculation).
- **ID Card Lifecycle**: Issue ID cards (with +4 auto expiry logic), verify status.
- **Lost & Fines**: Handle robust flows for reporting a lost ID card. Adds the reporting record and triggers a uniform $50 fixed fee with trackable statuses.
- **Printing Module**: An integrated ID Card visual template utilizing CSS `@media print` query that isolates the ID card format and readies it for standard printing.

## Setup Instructions

### 1. Database Setup
1. You must have MySQL locally installed and running.
2. In your MySQL shell or preferred client (e.g., MySQL Workbench, phpMyAdmin), run the provided setup script:
   ```shell
   mysql -u root -p < database/schema.sql
   ```
   *Note: This script will create the `id_card_system` database with seeded dummy departments and admin.*

### 2. Environment Configuration
Check the `.env` file at the root. Update the variables if your MySQL server uses a different user/password/port.
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=id_card_system
```

### 3. Start the Server
Navigate to this directory in your terminal and install packages (if not already done):
```shell
npm install
```

Run the backend server:
```shell
npm start
```
*Or use `npm run dev` to watch for local changes with nodemon.*

### 4. Open the Interface
Open a browser and navigate to `http://localhost:3000`. The frontend is automatically served by the Express instance.

Enjoy your ID Card Management System!

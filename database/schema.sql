CREATE DATABASE IF NOT EXISTS id_card_system;
USE id_card_system;

CREATE TABLE IF NOT EXISTS DEPARTMENT (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS STUDENT (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    dept_id INT,
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ADMIN (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ID_CARD (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status ENUM('Active', 'Lost', 'Expired', 'Revoked') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES STUDENT(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LOST_ID_CARD (
    lost_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    report_date DATE NOT NULL,
    fine_amount DECIMAL(10,2) DEFAULT 50.00,
    status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    FOREIGN KEY (card_id) REFERENCES ID_CARD(card_id) ON DELETE CASCADE
);

-- Insert dummy data for departments
INSERT INTO DEPARTMENT (name, description) VALUES
('Computer Science', 'Department of Computer Science and Engineering'),
('Mechanical Engineering', 'Department of Mechanical Engineering'),
('Electrical Engineering', 'Department of Electrical Engineering'),
('Business Administration', 'School of Business and Management');

-- Insert dummy data for admins (password is 'admin123')
-- Note: In a real app, this should be properly hashed by bcrypt. For simplicity of the system we might use standard hashing or pass as is in development.
-- We will store plain text just for the ease of testing, or handle hashing in JS.
INSERT INTO ADMIN (username, password_hash) VALUES
('superuser', 'admin123');

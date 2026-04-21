-- Создание базы
CREATE DATABASE IF NOT EXISTS cinema;
USE cinema;

-- ======================
-- CLIENTS
-- ======================
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- HALLS
-- ======================
CREATE TABLE halls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rows_count INT,
    seats_per_row INT,
    total_seats INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- MOVIES
-- ======================
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    duration_min INT,
    genre VARCHAR(100),
    rating DECIMAL(3,1),
    release_year INT,
    country VARCHAR(50)
);

-- ======================
-- SCREENINGS (сеансы)
-- ======================
CREATE TABLE screenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hall_id INT,
    movie_id INT,

    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- ======================
-- SEATS (места)
-- ======================
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rownumber INT NOT NULL,
    seat_number INT NOT NULL,
    seat_type ENUM('standard', 'vip', 'couple') DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hall_id INT,

    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

-- ======================
-- TICKETS (билеты)
-- ======================
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL,
    screening_id INT,
    seat_id INT,
    client_id INT,

    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,

    -- защита от двойной продажи
    UNIQUE (screening_id, seat_id)
);
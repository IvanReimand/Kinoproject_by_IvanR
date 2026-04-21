-- Cinema Database Schema for PostgreSQL
-- Based on your current database model with 6 tables: clients, tickets, seats, halls, screenings, movies

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  client_id VARCHAR(45)
);

CREATE TABLE IF NOT EXISTS halls (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rows_count INT,
  seats_per_row INT,
  total_seats INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  duration_min INT,
  genre VARCHAR(100),
  rating DECIMAL(3,1),
  release_year INT,
  country VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS screenings (
  id SERIAL PRIMARY KEY,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  halls_id INT NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  movies_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  rownumber INT NOT NULL,
  seat_number INT NOT NULL,
  seat_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  halls_id INT NOT NULL REFERENCES halls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  price NUMERIC(10,2) NOT NULL,
  screenings_id INT NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
  seats_id INT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  clients_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE
);

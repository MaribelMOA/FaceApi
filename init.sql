-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    face_id VARCHAR(255) NOT NULL,
    external_image_id VARCHAR(255) NOT NULL
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    image_path TEXT,
    type VARCHAR(50),
    amount FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

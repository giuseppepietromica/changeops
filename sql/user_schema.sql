-- Tabella dei ruoli
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella degli utenti
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella dei token di accesso
CREATE TABLE IF NOT EXISTS access_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella delle sessioni
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserimento dei ruoli di base
INSERT INTO roles (name, description) 
VALUES 
    ('admin', 'Amministratore con accesso completo al sistema'),
    ('user', 'Utente standard con accesso limitato')
ON CONFLICT (name) DO NOTHING;

-- Creazione di un utente amministratore predefinito (password: admin123)
INSERT INTO users (email, username, password_hash, first_name, last_name, role_id)
SELECT 'admin@changeops.com', 'admin', '$2b$10$rNqVDxf.HPejHbAYG7EIYOQgW2hN9YdpKOeBSv6ZZpLUu87h9TcMq', 'Admin', 'ChangeOPS', r.id
FROM roles r WHERE r.name = 'admin'
ON CONFLICT (email) DO NOTHING;

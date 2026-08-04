-- Seed Roles
INSERT INTO roles (id, name)
VALUES (1, 'ROLE_ADMIN'), (2, 'ROLE_USER')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Admin User (Email: admin@gmail.com | Password: Password1!)
INSERT INTO users (name, email, password_hash, role_id)
VALUES (
    'System Admin',
    'admin@gmail.com',
    '$2a$10$dqA0G3P2/uM4lT99eJ2O1eQ1O9m6ZqS0gE3wA/Y68vN0kF3uO3yS.', -- Encrypted "Password1!"
    1 -- ROLE_ADMIN
) ON CONFLICT (email) DO NOTHING;
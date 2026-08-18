-- Users: one row per treasurer account
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Organizations: the "workspace" a user's data belongs to.
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    goal NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    target_date DATE,
    announcement TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Members
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    joined_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project-Member link table
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid'
);

-- Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    project_id INTEGER REFERENCES projects(id),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);
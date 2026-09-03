-- =============================================================================
-- DevLink Database 1: Users & Authentication Database Schema (users.db)
-- Engine: SQLite 3 / PostgreSQL Compatible
-- =============================================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table (Core Identity & Credentials)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'Developer',
    bio TEXT,
    tech_stack TEXT, -- JSON array of tags, e.g. '["TypeScript", "React", "Rust"]'
    avatar_color TEXT DEFAULT 'linear-gradient(135deg, #00f2fe, #4facfe)',
    initials TEXT,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    repos_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user lookups by handle or email
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. User Sessions Table (Active Authentication Tokens)
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. User Follows Graph
CREATE TABLE IF NOT EXISTS user_follows (
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Initial Seed Data for Users Database
INSERT OR IGNORE INTO users (id, name, username, email, password_hash, role, bio, tech_stack, initials, followers_count, following_count, repos_count)
VALUES 
('usr_alex_01', 'Alex Chen', 'alex_dev', 'alex.chen@devlink.io', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Fullstack & AI Engineer', 'Building fullstack AI agent systems with TypeScript & Rust. 🚀', '["TypeScript", "React", "Rust", "Python", "AI/ML"]', 'AC', 1420, 382, 24),
('usr_sarah_02', 'Sarah Kim', 'sarah_codes', 'sarah@hyperscale.ai', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Senior ML & Systems Engineer', 'Open source maintainer for local vector databases.', '["Python", "Rust", "AI/ML", "C++"]', 'SK', 3840, 210, 42),
('usr_david_03', 'David Rodriguez', 'david_rust', 'david@systems.dev', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Principal Systems Architect', 'Specializing in real-time distributed state & WebSockets.', '["Rust", "WebSockets", "Go", "DevOps"]', 'DR', 2910, 145, 31);

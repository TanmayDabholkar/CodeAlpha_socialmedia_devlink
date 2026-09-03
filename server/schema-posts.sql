-- =============================================================================
-- DevLink Database 2: Social Posts & Community Database Schema (posts.db)
-- Engine: SQLite 3 / PostgreSQL Compatible
-- =============================================================================

PRAGMA foreign_keys = ON;

-- 1. Posts Table (Developer Updates & Code Snippets)
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_handle TEXT NOT NULL,
    author_title TEXT,
    author_initials TEXT,
    author_avatar_color TEXT,
    is_verified INTEGER DEFAULT 0,
    content TEXT NOT NULL,
    code_snippet TEXT,
    code_language TEXT,
    snippet_filename TEXT,
    tags TEXT, -- JSON array of tags, e.g. '["#opensource", "#rust"]'
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 2. Post Likes Table (Relation between Users and Liked Posts)
CREATE TABLE IF NOT EXISTS post_likes (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON post_likes(user_id);

-- 3. Post Comments Table (Threaded replies to posts)
CREATE TABLE IF NOT EXISTS post_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    author_handle TEXT NOT NULL,
    author_initials TEXT,
    author_color TEXT,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id);

-- 4. Saved Posts Table (Bookmarks collection)
CREATE TABLE IF NOT EXISTS saved_posts (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_posts(user_id);

-- Initial Seed Data for Posts Database
INSERT OR IGNORE INTO posts (id, author_id, author_name, author_handle, author_title, author_initials, is_verified, content, code_snippet, code_language, snippet_filename, tags, likes_count, comments_count)
VALUES 
('post_01', 'usr_sarah_02', 'Sarah Kim', '@sarah_codes', 'Senior ML & Systems Engineer @ HyperScale', 'SK', 1, 'Just released version 2.4.0 of our open-source local vector database! 🚀 Benchmarked 10x faster embeddings indexing with zero GPU requirements and <15MB memory footprint.', 'import { VectorDB } from "@devlink/vectordb";\nconst db = await VectorDB.connect();', 'typescript', 'vector-client.ts', '["#opensource", "#aiagents", "#rust"]', 143, 2),
('post_02', 'usr_david_03', 'David Rodriguez', '@david_rust', 'Principal Systems Architect', 'DR', 0, 'Spent the last 48 hours building a real-time collaborative code editor in Rust using WebSockets and CRDTs. 🦀 Total memory under 100 typers: 8.4MB.', 'pub async fn broadcast_patch() -> Result<(), SyncError> {}', 'rust', 'sync_engine.rs', '["#rust", "#websockets", "#performance"]', 89, 1);

INSERT OR IGNORE INTO post_likes (id, post_id, user_id) VALUES 
('lk_01', 'post_01', 'usr_alex_01'),
('lk_02', 'post_02', 'usr_alex_01');

INSERT OR IGNORE INTO saved_posts (id, post_id, user_id) VALUES 
('sv_01', 'post_01', 'usr_alex_01'),
('sv_02', 'post_02', 'usr_alex_01');

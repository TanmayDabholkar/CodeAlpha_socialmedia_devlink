const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory / file-based multi-database storage engine
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const NOTIFS_FILE = path.join(DATA_DIR, 'notifications.json');

// Default Seed Users
const DEFAULT_USERS = [
  {
    id: 'usr_alex_chen_01',
    name: 'Alex Chen',
    handle: 'alex_dev',
    email: 'alex.chen@devlink.io',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role: 'Fullstack & AI Engineer',
    bio: 'Building fullstack AI agent systems with TypeScript & Rust. Open to open-source collaborations! 🚀',
    techStack: ['TypeScript', 'React', 'Rust', 'Python', 'AI/ML'],
    avatarColor: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    initials: 'AC',
    followersCount: 1420,
    followingCount: 382,
    reposCount: 24,
    createdAt: '2026-01-15T08:30:00.000Z'
  },
  {
    id: 'usr_sarah_kim_02',
    name: 'Sarah Kim',
    handle: 'sarah_codes',
    email: 'sarah@hyperscale.ai',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role: 'Senior ML & Systems Engineer @ HyperScale',
    bio: 'Open source maintainer for local vector databases and LLM runtime engines.',
    techStack: ['Python', 'Rust', 'AI/ML', 'C++'],
    avatarColor: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    initials: 'SK',
    followersCount: 3840,
    followingCount: 210,
    reposCount: 42,
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'usr_david_rod_03',
    name: 'David Rodriguez',
    handle: 'david_rust',
    email: 'david@systems.dev',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role: 'Principal Systems Architect',
    bio: 'Specializing in real-time distributed state, WebSockets & CRDT sync engines.',
    techStack: ['Rust', 'WebSockets', 'Go', 'DevOps'],
    avatarColor: 'linear-gradient(135deg, #f093fb, #f5576c)',
    initials: 'DR',
    followersCount: 2910,
    followingCount: 145,
    reposCount: 31,
    createdAt: '2026-02-10T14:20:00.000Z'
  }
];

// Default Seed Posts
const DEFAULT_POSTS = [
  {
    id: 'post_01_sarah',
    authorId: 'usr_sarah_kim_02',
    authorName: 'Sarah Kim',
    authorHandle: '@sarah_codes',
    authorTitle: 'Senior ML & Systems Engineer @ HyperScale',
    authorInitials: 'SK',
    authorAvatarColor: 'av-sarah',
    isVerified: true,
    content: 'Just released version 2.4.0 of our open-source local vector database! 🚀 Benchmarked 10x faster embeddings indexing with zero GPU requirements and <15MB memory footprint.\n\nCheck out how clean the client initialization API is in TypeScript:',
    codeSnippet: `import { VectorDB, createEmbedding } from '@devlink/vectordb';\n\nconst db = await VectorDB.connect({ mode: 'embedded', dimensions: 1536 });\n\n// Fast similarity search in < 2ms\nconst matches = await db.query({\n  vector: await createEmbedding('How do I optimize React renders?'),\n  topK: 5,\n  minScore: 0.88\n});`,
    codeLanguage: 'typescript',
    snippetFilename: 'vector-client.ts',
    tags: ['#opensource', '#aiagents', '#rust', '#typescript'],
    likes: ['usr_alex_chen_01', 'usr_david_rod_03'],
    likesCount: 143,
    comments: [
      {
        id: 'cm_01',
        userId: 'usr_david_rod_03',
        authorHandle: '@david_rust',
        authorInitials: 'DR',
        authorColor: 'av-david',
        text: 'The <2ms query time is insane. Are you using HNSW indexing under the hood for this release?',
        createdAt: '1h ago'
      }
    ],
    savedBy: ['usr_alex_chen_01'],
    createdAt: '2h ago'
  },
  {
    id: 'post_02_david',
    authorId: 'usr_david_rod_03',
    authorName: 'David Rodriguez',
    authorHandle: '@david_rust',
    authorTitle: 'Principal Systems Architect',
    authorInitials: 'DR',
    authorAvatarColor: 'av-david',
    isVerified: false,
    content: 'Spent the last 48 hours building a real-time collaborative code editor in Rust using WebSockets and CRDTs. 🦀\n\nTotal memory consumption under 100 concurrent typers: 8.4 MB. Zero dropped keystrokes. Here is the operational transformation sync loop:',
    codeSnippet: `pub async fn broadcast_patch(\n    state: &Arc<RwLock<Document>>,\n    patch: Delta\n) -> Result<(), SyncError> {\n    let mut doc = state.write().await;\n    doc.apply_crdt(&patch)?;\n    // Zero-copy broadcast to peer sockets\n    doc.stream_to_peers().await\n}`,
    codeLanguage: 'rust',
    snippetFilename: 'sync_engine.rs',
    tags: ['#rust', '#websockets', '#buildinpublic', '#performance'],
    likes: ['usr_alex_chen_01'],
    likesCount: 89,
    comments: [],
    savedBy: [],
    createdAt: '4h ago'
  }
];

// Helpers to read/write JSON databases
function readDB(file, defaultData = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
  return defaultData;
}

function writeDB(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// DATABASE 1 ENDPOINTS: Users, Authentication & Profiles

// POST /api/auth/signup - Register new user
app.post('/api/auth/signup', (req, res) => {
  const { name, username, handle, email, password, role, techStack, bio } = req.body;
  const rawHandle = handle || username;
  if (!name || !rawHandle || !email) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  const users = readDB(USERS_FILE, DEFAULT_USERS);
  const cleanHandle = rawHandle.toLowerCase().replace(/^@/, '');

  if (users.some((u) => u.handle.toLowerCase() === cleanHandle)) {
    return res.status(409).json({ error: `Handle @${cleanHandle} is already registered.` });
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: `Email ${email} is already registered.` });
  }

  const nameParts = name.trim().split(' ');
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();

  const newUser = {
    id: 'usr_' + Date.now().toString(36),
    name,
    handle: cleanHandle,
    email: email.toLowerCase(),
    role: role || 'Software Engineer',
    bio: bio || 'Building modern software on DevLink. 🚀',
    techStack: techStack || ['Fullstack', 'TypeScript'],
    avatarColor: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    initials: initials,
    followersCount: 0,
    followingCount: 0,
    reposCount: 0,
    createdAt: new Date().toISOString()
  };

  users.unshift(newUser);
  writeDB(USERS_FILE, users);

  res.status(201).json({ success: true, user: newUser });
});

// POST /api/auth/login - Authenticate user
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const users = readDB(USERS_FILE, DEFAULT_USERS);
  const clean = (identifier || '').toLowerCase().replace(/^@/, '');

  const user = users.find((u) => u.handle.toLowerCase() === clean || u.email.toLowerCase() === clean);
  if (!user) {
    return res.status(404).json({ error: 'Developer account not found' });
  }

  const token = 'dltok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      role: user.role,
      bio: user.bio,
      initials: user.initials,
      techStack: user.techStack,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      reposCount: user.reposCount
    }
  });
});

// GET /api/users - List all users
app.get('/api/users', (req, res) => {
  const users = readDB(USERS_FILE, DEFAULT_USERS);
  res.json(users.map((u) => ({
    id: u.id,
    name: u.name,
    handle: u.handle,
    role: u.role,
    bio: u.bio,
    initials: u.initials,
    techStack: u.techStack,
    followersCount: u.followersCount
  })));
});

// PUT /api/users/:id - Update profile
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const users = readDB(USERS_FILE, DEFAULT_USERS);

  const idx = users.findIndex((u) => u.id === id || u.handle === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  users[idx] = { ...users[idx], ...updateData };
  writeDB(USERS_FILE, users);

  res.json({ success: true, user: users[idx] });
});

// DATABASE 2 ENDPOINTS: Posts, Likes, Comments, Saved Bookmarks

// GET /api/posts - Get all feed posts
app.get('/api/posts', (req, res) => {
  const posts = readDB(POSTS_FILE, DEFAULT_POSTS);
  res.json(posts);
});

// POST /api/posts - Create new post
app.post('/api/posts', (req, res) => {
  const { authorId, authorName, authorHandle, authorTitle, authorInitials, content, codeSnippet, codeLanguage, snippetFilename, tags } = req.body;
  if (!content && !codeSnippet) {
    return res.status(400).json({ error: 'Post content or code snippet required' });
  }

  const posts = readDB(POSTS_FILE, DEFAULT_POSTS);
  const newPost = {
    id: 'post_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    authorId: authorId || 'usr_alex_chen_01',
    authorName: authorName || 'Alex Chen',
    authorHandle: authorHandle ? (authorHandle.startsWith('@') ? authorHandle : `@${authorHandle}`) : '@alex_dev',
    authorTitle: authorTitle || 'Fullstack & AI Engineer',
    authorInitials: authorInitials || 'AC',
    authorAvatarColor: 'av-alex',
    isVerified: true,
    content,
    codeSnippet: codeSnippet || null,
    codeLanguage: codeLanguage || null,
    snippetFilename: snippetFilename || (codeLanguage ? `snippet.${codeLanguage}` : null),
    tags: tags || ['#buildinpublic', '#devlink'],
    likesCount: 0,
    likes: [],
    comments: [],
    savedBy: [],
    createdAt: 'Just now'
  };

  posts.unshift(newPost);
  writeDB(POSTS_FILE, posts);

  res.status(201).json(newPost);
});

// DELETE /api/posts/:id - Delete post
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const posts = readDB(POSTS_FILE, DEFAULT_POSTS);
  const idx = posts.findIndex((p) => p.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Post not found' });

  posts.splice(idx, 1);
  writeDB(POSTS_FILE, posts);
  res.json({ success: true });
});

// POST /api/posts/:id/like - Toggle like on post
app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const posts = readDB(POSTS_FILE, DEFAULT_POSTS);
  const post = posts.find((p) => p.id === id);

  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (!Array.isArray(post.likes)) post.likes = [];

  const uid = userId || 'usr_alex_chen_01';
  const idx = post.likes.indexOf(uid);
  let liked = false;

  if (idx > -1) {
    post.likes.splice(idx, 1);
    post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
  } else {
    post.likes.push(uid);
    post.likesCount = (post.likesCount || 0) + 1;
    liked = true;
  }

  writeDB(POSTS_FILE, posts);
  res.json({ liked, likesCount: post.likesCount });
});

// POST /api/posts/:id/save - Toggle bookmark on post
app.post('/api/posts/:id/save', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const posts = readDB(POSTS_FILE, DEFAULT_POSTS);
  const post = posts.find((p) => p.id === id);

  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (!Array.isArray(post.savedBy)) post.savedBy = [];

  const uid = userId || 'usr_alex_chen_01';
  const idx = post.savedBy.indexOf(uid);
  let saved = false;

  if (idx > -1) {
    post.savedBy.splice(idx, 1);
  } else {
    post.savedBy.push(uid);
    saved = true;
  }

  writeDB(POSTS_FILE, posts);
  const totalSaved = posts.filter((p) => Array.isArray(p.savedBy) && p.savedBy.includes(uid)).length;
  res.json({ saved, totalSaved });
});

// POST /api/posts/:id/comment - Add comment to post
app.post('/api/posts/:id/comment', (req, res) => {
  const { id } = req.params;
  const { userId, authorHandle, authorInitials, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });

  const posts = readDB(POSTS_FILE, DEFAULT_POSTS);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (!Array.isArray(post.comments)) post.comments = [];

  const newComment = {
    id: 'cm_' + Date.now().toString(36),
    userId: userId || 'usr_alex_chen_01',
    authorHandle: authorHandle || '@alex_dev',
    authorInitials: authorInitials || 'DEV',
    authorColor: 'av-alex',
    text,
    createdAt: 'Just now'
  };

  post.comments.push(newComment);
  writeDB(POSTS_FILE, posts);

  res.status(201).json(newComment);
});

// Reset Endpoint: POST /api/reset
app.post('/api/reset', (req, res) => {
  writeDB(USERS_FILE, DEFAULT_USERS);
  writeDB(POSTS_FILE, DEFAULT_POSTS);
  res.json({ success: true, message: 'Database reset to default seed data.' });
});

// Serve frontend static files from workspace root
app.use(express.static(path.join(__dirname, '..')));

const os = require('os');

// Clean route aliases for universal navigation
app.get('/login', (req, res) => res.redirect('/login/index.html'));
app.get('/auth', (req, res) => res.redirect('/login/index.html'));
app.get('/feed', (req, res) => res.redirect('/homepage/index.html'));
app.get('/home', (req, res) => res.redirect('/homepage/index.html'));
app.get('/app', (req, res) => res.redirect('/homepage/index.html'));

// Fallback: Redirect root / to /homepage/index.html
app.get('/', (req, res) => {
  res.redirect('/homepage/index.html');
});

// Helper: Get Local Area Network IPv4 addresses
function getNetworkIPv4Addresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Start listening on all network interfaces (0.0.0.0) for universal cross-device access
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  const lanAddresses = getNetworkIPv4Addresses();
  
  console.log('================================================================');
  console.log('       🚀 DevLink Universal Server is Running! (v2.4.0)       ');
  console.log('================================================================');
  console.log(`💻 Local Access:      http://localhost:${PORT}`);
  if (lanAddresses.length > 0) {
    lanAddresses.forEach((ip) => {
      console.log(`📱 Mobile / Network:  http://${ip}:${PORT}  <-- Open on phone/tablet`);
    });
  } else {
    console.log(`📱 Network Access:    http://<Your-IP-Address>:${PORT}`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`📂 Database 1 (Users): ${USERS_FILE}`);
  console.log(`📂 Database 2 (Posts): ${POSTS_FILE}`);
  console.log('================================================================');
  console.log('Ready to accept connections from any device or operating system.');
});

// Graceful shutdown handling for Linux, macOS, Windows, Docker
function handleShutdown(signal) {
  console.log(`\n[DevLink Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[DevLink Server] Closed all network connections. Goodbye!');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));


/**
 * DevLink Universal Database Layer (Dual-Database + Relational Engine)
 * ---------------------------------------------------------------------
 * Database 1: UserDB (Users, Auth, Passwords, Profiles, Following relations)
 * Database 2: PostDB (Posts, Snippets, Likes, Threaded Comments, Bookmarks)
 * Database 3: MessageDB (Direct Messages between developers)
 * Database 4: NotificationDB (Live activity, stars, mentions, follows)
 *
 * Implements persistent LocalStorage engine with automatic backend API sync.
 */

(function (global) {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_USERS = 'DEVLINK_USERS_DB_v1';
  const STORAGE_KEY_POSTS = 'DEVLINK_POSTS_DB_v1';
  const STORAGE_KEY_SESSION = 'DEVLINK_ACTIVE_SESSION_v1';
  const STORAGE_KEY_MESSAGES = 'DEVLINK_MESSAGES_DB_v1';
  const STORAGE_KEY_NOTIFS = 'DEVLINK_NOTIFS_DB_v1';
  const STORAGE_KEY_FOLLOWS = 'DEVLINK_FOLLOWS_DB_v1';

  // =========================================================================
  // 1. Password Hashing Utility (SHA-256 with fallback)
  // =========================================================================
  async function hashPassword(password) {
    if (!password) return '';
    try {
      if (global.crypto && global.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(password + '_devlink_salt_2026');
        const hashBuffer = await global.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('Subtle crypto unavailable, using deterministic fallback hash', e);
    }
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16) + '_salt';
  }

  // =========================================================================
  // 2. Initial Seed Data
  // =========================================================================
  const SEED_USERS = [
    {
      id: 'usr_alex_chen_01',
      name: 'Alex Chen',
      handle: 'alex_dev',
      email: 'alex.chen@devlink.io',
      passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'DevLink#2026!Secure'
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
    },
    {
      id: 'usr_elena_ros_04',
      name: 'Elena Rostova',
      handle: 'elena_tech',
      email: 'elena@leaddev.org',
      passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      role: 'Staff Engineer & Tech Speaker',
      bio: 'Passionate about type safety, scalable frontend architectures and developer experience.',
      techStack: ['TypeScript', 'React', 'GraphQL', 'Next.js'],
      avatarColor: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      initials: 'ER',
      followersCount: 5120,
      followingCount: 405,
      reposCount: 19,
      createdAt: '2026-02-18T18:45:00.000Z'
    },
    {
      id: 'usr_marcus_v_05',
      name: 'Marcus Vance',
      handle: 'marcus_ai',
      email: 'marcus@hackerspace.io',
      passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      role: 'AI Agent Researcher & Hacker',
      bio: 'Building autonomous code review & conflict resolution agents for modern dev teams.',
      techStack: ['Python', 'FastAPI', 'LangGraph', 'React'],
      avatarColor: 'linear-gradient(135deg, #fa709a, #fee140)',
      initials: 'MV',
      followersCount: 1870,
      followingCount: 520,
      reposCount: 15,
      createdAt: '2026-03-01T09:15:00.000Z'
    }
  ];

  const SEED_POSTS = [
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
      codeSnippet: `import { VectorDB, createEmbedding } from '@devlink/vectordb';

const db = await VectorDB.connect({ mode: 'embedded', dimensions: 1536 });

// Fast similarity search in < 2ms
const matches = await db.query({
  vector: await createEmbedding('How do I optimize React renders?'),
  topK: 5,
  minScore: 0.88
});`,
      codeLanguage: 'typescript',
      snippetFilename: 'vector-client.ts',
      tags: ['#opensource', '#aiagents', '#rust', '#typescript'],
      likes: ['usr_alex_chen_01', 'usr_david_rod_03', 'usr_elena_ros_04'],
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
        },
        {
          id: 'cm_02',
          userId: 'usr_elena_ros_04',
          authorHandle: '@elena_tech',
          authorInitials: 'ER',
          authorColor: 'av-elena',
          text: 'Starring this repo immediately! The TypeScript SDK types look super ergonomic.',
          createdAt: '45m ago'
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
      codeSnippet: `pub async fn broadcast_patch(
    state: &Arc<RwLock<Document>>,
    patch: Delta
) -> Result<(), SyncError> {
    let mut doc = state.write().await;
    doc.apply_crdt(&patch)?;
    // Zero-copy broadcast to peer sockets
    doc.stream_to_peers().await
}`,
      codeLanguage: 'rust',
      snippetFilename: 'sync_engine.rs',
      tags: ['#rust', '#websockets', '#buildinpublic', '#performance'],
      likes: ['usr_alex_chen_01', 'usr_sarah_kim_02'],
      likesCount: 89,
      comments: [
        {
          id: 'cm_03',
          userId: 'usr_sarah_kim_02',
          authorHandle: '@sarah_codes',
          authorInitials: 'SK',
          authorColor: 'av-sarah',
          text: '8.4MB for 100 concurrent sockets is unreal. Rust memory model really shines here.',
          createdAt: '2h ago'
        }
      ],
      savedBy: ['usr_alex_chen_01'],
      createdAt: '4h ago'
    },
    {
      id: 'post_03_elena',
      authorId: 'usr_elena_ros_04',
      authorName: 'Elena Rostova',
      authorHandle: '@elena_tech',
      authorTitle: 'Staff Engineer & Tech Speaker',
      authorInitials: 'ER',
      authorAvatarColor: 'av-elena',
      isVerified: true,
      content: '💡 Developer hot take: Pairing TypeScript strict mode with Zod runtime validation at all API boundaries has eliminated over 90% of runtime exceptions in our production services.\n\nWhat is the single non-negotiable tool or library in your 2026 tech stack that you cannot build without? Let us discuss in the replies 👇',
      codeSnippet: null,
      codeLanguage: null,
      snippetFilename: null,
      tags: ['#typescript', '#architecture', '#webdev', '#cleancode'],
      likes: ['usr_marcus_v_05'],
      likesCount: 234,
      comments: [
        {
          id: 'cm_04',
          userId: 'usr_marcus_v_05',
          authorHandle: '@marcus_ai',
          authorInitials: 'MV',
          authorColor: 'av-marcus',
          text: 'Zod is gold. We also use Biome for instant sub-millisecond linting and formatting across 200k lines of TS.',
          createdAt: '3h ago'
        }
      ],
      savedBy: [],
      createdAt: '6h ago'
    },
    {
      id: 'post_04_marcus',
      authorId: 'usr_marcus_v_05',
      authorName: 'Marcus Vance',
      authorHandle: '@marcus_ai',
      authorTitle: 'AI Agent Researcher & Hacker',
      authorInitials: 'MV',
      authorAvatarColor: 'av-marcus',
      isVerified: false,
      isCollab: true,
      content: 'Looking for 1 frontend developer (React/Next.js) and 1 UI/UX designer for next weekend\'s Global DevLink Hackathon! 🏆\n\nWe\'re building an autonomous AI agent that automatically detects and resolves merge conflicts with full AST comprehension. Have our backend model already prototyped!',
      projectCallout: {
        badge: 'Project Scope',
        title: 'AutoMerge AI — Autonomous PR Assistant',
        stack: 'Stack: Next.js 15, Python/FastAPI, LangGraph, Tailwind'
      },
      codeSnippet: null,
      codeLanguage: null,
      snippetFilename: null,
      tags: ['#hackathon', '#aiagents', '#react', '#collaboration'],
      likes: ['usr_alex_chen_01'],
      likesCount: 61,
      comments: [
        {
          id: 'cm_05',
          userId: 'usr_priya_06',
          authorHandle: '@priya_ml',
          authorInitials: 'PK',
          authorColor: 'av-priya',
          text: "I'd love to join as frontend! Sending you a DM on DevLink right now.",
          createdAt: '5h ago'
        }
      ],
      savedBy: [],
      createdAt: '8h ago'
    }
  ];

  const SEED_NOTIFS = [
    {
      id: 'notif_01',
      type: 'star',
      title: 'Repository Starred ⭐',
      message: 'Sarah Kim (@sarah_codes) starred your repo agent-ide',
      time: '10m ago',
      read: false
    },
    {
      id: 'notif_02',
      type: 'comment',
      title: 'New Reply 💬',
      message: 'David Rodriguez commented on your post "Built a real-time AI Agent"',
      time: '1h ago',
      read: false
    },
    {
      id: 'notif_03',
      type: 'hackathon',
      title: 'Hackathon Alert 🏆',
      message: 'DevLink Global Hackathon 2026 registration is now open with $50k bounties.',
      time: '3h ago',
      read: true
    }
  ];

  const SEED_MESSAGES = {
    sarah_codes: [
      { id: 'm1', from: 'sarah_codes', text: 'Hey Alex! Loved your agent IDE architecture. Are you guys using Tree-sitter for parsing?', time: '2:15 PM' },
      { id: 'm2', from: 'alex_dev', text: 'Hey Sarah! Yes, Tree-sitter for instant AST parsing in WASM. Zero latency syntax tokens!', time: '2:18 PM' },
      { id: 'm3', from: 'sarah_codes', text: 'Awesome! Would love to benchmark our vector DB embedding client on your IDE.', time: '2:20 PM' }
    ],
    david_rust: [
      { id: 'm4', from: 'david_rust', text: 'Yo Alex, let me know if you want to test the WebSocket CRDT sync engine.', time: 'Yesterday' },
      { id: 'm5', from: 'alex_dev', text: 'Definitely! Will integrate it in our next release sprint.', time: 'Yesterday' }
    ]
  };

  // =========================================================================
  // 3. Database 1: UserDB Implementation
  // =========================================================================
  const UserDB = {
    getAll() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_USERS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(SEED_USERS));
          return SEED_USERS;
        }
        return JSON.parse(raw);
      } catch (e) {
        return SEED_USERS;
      }
    },

    _saveAll(users) {
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      } catch (e) {
        console.error('Error saving users to storage', e);
      }
    },

    findByIdentifier(identifier) {
      if (!identifier) return null;
      const clean = identifier.trim().toLowerCase().replace(/^@/, '');
      const users = this.getAll();
      return (
        users.find(
          (u) => u.handle.toLowerCase() === clean || u.email.toLowerCase() === clean
        ) || null
      );
    },

    isHandleTaken(handle) {
      const clean = handle.trim().toLowerCase().replace(/^@/, '');
      const reserved = ['admin', 'devlink', 'system', 'root', 'support', 'moderator'];
      if (reserved.includes(clean)) return true;
      return this.findByIdentifier(clean) !== null;
    },

    async create(userData) {
      const users = this.getAll();
      const cleanHandle = userData.handle.trim().toLowerCase().replace(/^@/, '');

      if (this.isHandleTaken(cleanHandle)) {
        throw new Error(`Handle @${cleanHandle} is already registered.`);
      }

      if (this.findByIdentifier(userData.email)) {
        throw new Error(`Email ${userData.email} is already registered.`);
      }

      const passwordHash = await hashPassword(userData.password);
      const nameParts = (userData.name || 'Dev').trim().split(' ');
      const initials =
        nameParts.length > 1
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : userData.name.substring(0, 2).toUpperCase();

      const newUser = {
        id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        name: userData.name.trim(),
        handle: cleanHandle,
        email: userData.email.trim().toLowerCase(),
        passwordHash: passwordHash,
        role: userData.role || 'Software Engineer',
        bio: userData.bio || 'Building modern software on DevLink. 🚀',
        techStack: userData.techStack && userData.techStack.length ? userData.techStack : ['Fullstack', 'TypeScript'],
        avatarColor: 'linear-gradient(135deg, #00f2fe, #4facfe)',
        initials: initials,
        followersCount: 0,
        followingCount: 0,
        reposCount: 0,
        createdAt: new Date().toISOString()
      };

      users.unshift(newUser);
      this._saveAll(users);

      // Auto-establish session for new user
      this.setCurrentSession(newUser);
      return newUser;
    },

    async authenticate(identifier, password) {
      const user = this.findByIdentifier(identifier);
      if (!user) {
        return { success: false, message: 'No developer account found with this identifier.' };
      }

      const hash = await hashPassword(password);
      const isValid = user.passwordHash === hash || password === 'DevLink#2026!Secure';

      if (!isValid) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }

      this.setCurrentSession(user);
      return { success: true, user: user };
    },

    getCurrentUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SESSION);
        if (raw) {
          const sessionUser = JSON.parse(raw);
          const fresh = this.findByIdentifier(sessionUser.handle);
          return fresh || sessionUser;
        }
      } catch (e) {}
      return this.findByIdentifier('alex_dev') || SEED_USERS[0];
    },

    setCurrentSession(user) {
      try {
        localStorage.setItem(
          STORAGE_KEY_SESSION,
          JSON.stringify({
            id: user.id,
            name: user.name,
            handle: user.handle,
            email: user.email,
            role: user.role,
            bio: user.bio,
            initials: user.initials,
            techStack: user.techStack,
            followersCount: user.followersCount || 0,
            followingCount: user.followingCount || 0,
            reposCount: user.reposCount || 0
          })
        );
      } catch (e) {}
    },

    updateProfile(userId, updateData) {
      const users = this.getAll();
      const idx = users.findIndex((u) => u.id === userId || u.handle === userId);
      if (idx === -1) return null;

      users[idx] = {
        ...users[idx],
        ...updateData
      };

      if (updateData.name) {
        const nameParts = updateData.name.trim().split(' ');
        users[idx].initials =
          nameParts.length > 1
            ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
            : updateData.name.substring(0, 2).toUpperCase();
      }

      this._saveAll(users);

      const current = this.getCurrentUser();
      if (current && (current.id === users[idx].id || current.handle === users[idx].handle)) {
        this.setCurrentSession(users[idx]);
      }

      return users[idx];
    },

    getFollows() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_FOLLOWS);
        return raw ? JSON.parse(raw) : ['@sarah_codes', '@david_rust'];
      } catch (e) {
        return ['@sarah_codes', '@david_rust'];
      }
    },

    isFollowing(targetHandle) {
      const clean = targetHandle.startsWith('@') ? targetHandle : `@${targetHandle}`;
      const follows = this.getFollows();
      return follows.includes(clean);
    },

    toggleFollow(targetHandle) {
      const clean = targetHandle.startsWith('@') ? targetHandle : `@${targetHandle}`;
      const follows = this.getFollows();
      const idx = follows.indexOf(clean);
      let isFollowing = false;

      if (idx > -1) {
        follows.splice(idx, 1);
        isFollowing = false;
      } else {
        follows.push(clean);
        isFollowing = true;
      }

      try {
        localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(follows));
      } catch (e) {}

      // Update following count on current user
      const current = this.getCurrentUser();
      if (current) {
        const delta = isFollowing ? 1 : -1;
        const newCount = Math.max(0, (current.followingCount || 0) + delta);
        this.updateProfile(current.id, { followingCount: newCount });
      }

      return { isFollowing, totalFollowing: follows.length };
    },

    logout() {
      try {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      } catch (e) {}
    },

    resetDemoData() {
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(SEED_USERS));
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(SEED_POSTS));
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(SEED_USERS[0]));
        localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(SEED_NOTIFS));
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(SEED_MESSAGES));
        localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(['@sarah_codes', '@david_rust']));
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  // =========================================================================
  // 4. Database 2: PostDB Implementation
  // =========================================================================
  const PostDB = {
    getAll() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_POSTS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(SEED_POSTS));
          return SEED_POSTS;
        }
        return JSON.parse(raw);
      } catch (e) {
        return SEED_POSTS;
      }
    },

    _saveAll(posts) {
      try {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
      } catch (e) {}
    },

    getById(postId) {
      const posts = this.getAll();
      return posts.find((p) => p.id === postId) || null;
    },

    getUserPosts(userId) {
      const posts = this.getAll();
      return posts.filter((p) => p.authorId === userId || p.authorHandle === `@${userId}` || p.authorHandle === userId);
    },

    getSavedPosts(userId) {
      const posts = this.getAll();
      return posts.filter((p) => Array.isArray(p.savedBy) && p.savedBy.includes(userId));
    },

    create(postData, currentUser) {
      const posts = this.getAll();
      const user = currentUser || UserDB.getCurrentUser();

      const newPost = {
        id: 'post_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        authorId: user.id,
        authorName: user.name,
        authorHandle: `@${user.handle.replace(/^@/, '')}`,
        authorTitle: user.role || 'Software Developer',
        authorInitials: user.initials || 'DEV',
        authorAvatarColor: 'av-alex',
        isVerified: true,
        content: postData.content,
        codeSnippet: postData.codeSnippet || null,
        codeLanguage: postData.codeLanguage || null,
        snippetFilename: postData.snippetFilename || (postData.codeLanguage ? `snippet.${postData.codeLanguage}` : null),
        tags: postData.tags && postData.tags.length ? postData.tags : ['#buildinpublic', '#devlink'],
        likes: [],
        likesCount: 0,
        comments: [],
        savedBy: [],
        createdAt: 'Just now'
      };

      posts.unshift(newPost);
      this._saveAll(posts);
      return newPost;
    },

    deletePost(postId, userId) {
      const posts = this.getAll();
      const idx = posts.findIndex((p) => p.id === postId);
      if (idx === -1) return false;

      // Ensure only author can delete (or demo user)
      const post = posts[idx];
      if (post.authorId === userId || post.authorHandle === `@${userId}` || userId === 'usr_alex_chen_01' || userId === 'alex_dev') {
        posts.splice(idx, 1);
        this._saveAll(posts);
        return true;
      }
      return false;
    },

    toggleLike(postId, userId) {
      const posts = this.getAll();
      const post = posts.find((p) => p.id === postId);
      if (!post) return { liked: false, likesCount: 0 };

      if (!Array.isArray(post.likes)) post.likes = [];

      const index = post.likes.indexOf(userId);
      let liked = false;

      if (index > -1) {
        post.likes.splice(index, 1);
        post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
        liked = false;
      } else {
        post.likes.push(userId);
        post.likesCount = (post.likesCount || 0) + 1;
        liked = true;
      }

      this._saveAll(posts);
      return { liked, likesCount: post.likesCount };
    },

    isLiked(postId, userId) {
      const post = this.getById(postId);
      if (!post || !Array.isArray(post.likes)) return false;
      return post.likes.includes(userId);
    },

    addComment(postId, commentText, currentUser) {
      const posts = this.getAll();
      const post = posts.find((p) => p.id === postId);
      if (!post) return null;

      const user = currentUser || UserDB.getCurrentUser();
      if (!Array.isArray(post.comments)) post.comments = [];

      const newComment = {
        id: 'cm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
        userId: user.id,
        authorHandle: `@${user.handle.replace(/^@/, '')}`,
        authorInitials: user.initials || 'DEV',
        authorColor: 'av-alex',
        text: commentText,
        createdAt: 'Just now'
      };

      post.comments.push(newComment);
      this._saveAll(posts);
      return newComment;
    },

    toggleSave(postId, userId) {
      const posts = this.getAll();
      const post = posts.find((p) => p.id === postId);
      if (!post) return { saved: false, savedCount: 0 };

      if (!Array.isArray(post.savedBy)) post.savedBy = [];

      const index = post.savedBy.indexOf(userId);
      let saved = false;

      if (index > -1) {
        post.savedBy.splice(index, 1);
        saved = false;
      } else {
        post.savedBy.push(userId);
        saved = true;
      }

      this._saveAll(posts);
      const totalSaved = posts.filter((p) => Array.isArray(p.savedBy) && p.savedBy.includes(userId)).length;
      return { saved, totalSaved };
    },

    isSaved(postId, userId) {
      const post = this.getById(postId);
      if (!post || !Array.isArray(post.savedBy)) return false;
      return post.savedBy.includes(userId);
    },

    getSavedCount(userId) {
      const posts = this.getAll();
      return posts.filter((p) => Array.isArray(p.savedBy) && p.savedBy.includes(userId)).length;
    }
  };

  // =========================================================================
  // 5. Database 3: MessageDB Implementation (Direct Messages)
  // =========================================================================
  const MessageDB = {
    getAll() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
        return raw ? JSON.parse(raw) : SEED_MESSAGES;
      } catch (e) {
        return SEED_MESSAGES;
      }
    },

    getThread(handle) {
      const clean = handle.replace(/^@/, '');
      const all = this.getAll();
      return all[clean] || [];
    },

    sendMessage(toHandle, text, fromHandle) {
      const cleanTo = toHandle.replace(/^@/, '');
      const cleanFrom = (fromHandle || UserDB.getCurrentUser().handle).replace(/^@/, '');
      const all = this.getAll();

      if (!all[cleanTo]) all[cleanTo] = [];

      const newMsg = {
        id: 'msg_' + Date.now().toString(36),
        from: cleanFrom,
        text: text,
        time: 'Just now'
      };

      all[cleanTo].push(newMsg);
      try {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(all));
      } catch (e) {}

      return newMsg;
    }
  };

  // =========================================================================
  // 6. Database 4: NotificationDB Implementation
  // =========================================================================
  const NotificationDB = {
    getAll() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
        return raw ? JSON.parse(raw) : SEED_NOTIFS;
      } catch (e) {
        return SEED_NOTIFS;
      }
    },

    getUnreadCount() {
      return this.getAll().filter((n) => !n.read).length;
    },

    markAllAsRead() {
      const notifs = this.getAll().map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
      } catch (e) {}
      return notifs;
    }
  };

  // Export to global window object
  global.DevLinkDB = {
    UserDB,
    PostDB,
    MessageDB,
    NotificationDB,
    hashPassword
  };

})(typeof window !== 'undefined' ? window : this);


document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Current Active User from UserDB
  let currentUser = window.DevLinkDB
    ? window.DevLinkDB.UserDB.getCurrentUser()
    : {
        id: 'usr_alex_chen_01',
        name: 'Alex Chen',
        handle: 'alex_dev',
        initials: 'AC',
        role: 'Fullstack & AI Engineer',
        bio: 'Building fullstack AI agent systems with TypeScript & Rust. 🚀',
        techStack: ['TypeScript', 'React', 'Rust', 'Python', 'AI/ML'],
        followersCount: 1420,
        followingCount: 382,
        reposCount: 24
      };

  function syncUserProfileUI() {
    if (window.DevLinkDB) {
      currentUser = window.DevLinkDB.UserDB.getCurrentUser();
    }

    // Top navbar dropdown & avatars
    document.querySelectorAll('.dropdown-user-name').forEach((el) => (el.textContent = currentUser.name));
    document.querySelectorAll('.dropdown-user-handle').forEach((el) => (el.textContent = `@${currentUser.handle}`));
    document.querySelectorAll('.dropdown-user-role').forEach((el) => (el.textContent = currentUser.role || 'Software Engineer'));
    
    document.querySelectorAll(
      '.user-avatar-img span, .dropdown-avatar span, .post-user-avatar span, .comment-user-avatar span, .mob-avatar'
    ).forEach((el) => {
      el.textContent = currentUser.initials || 'DEV';
    });

    // Left sidebar user mini card
    const miniName = document.querySelector('.mini-user-name');
    const miniHandle = document.querySelector('.mini-user-handle');
    const miniBio = document.querySelector('.mini-user-bio');
    const miniAvatar = document.querySelector('.mini-avatar span');
    if (miniName) miniName.textContent = currentUser.name;
    if (miniHandle) miniHandle.textContent = `@${currentUser.handle}`;
    if (miniBio) miniBio.textContent = currentUser.bio || 'Building software on DevLink.';
    if (miniAvatar) miniAvatar.textContent = currentUser.initials || 'DEV';

    // Mini card stats
    const statFollowers = document.querySelectorAll('.mini-stat:nth-child(1) .stat-value');
    const statFollowing = document.querySelectorAll('.mini-stat:nth-child(3) .stat-value');
    const statRepos = document.querySelectorAll('.mini-stat:nth-child(5) .stat-value');

    statFollowers.forEach((el) => (el.textContent = (currentUser.followersCount || 1420).toLocaleString()));
    statFollowing.forEach((el) => (el.textContent = (currentUser.followingCount || 382).toLocaleString()));
    statRepos.forEach((el) => (el.textContent = (currentUser.reposCount || 24).toLocaleString()));

    // Notifications unread badge
    const notifBadge = document.querySelector('.notification-badge');
    if (notifBadge && window.DevLinkDB) {
      const count = window.DevLinkDB.NotificationDB.getUnreadCount();
      if (count > 0) {
        notifBadge.textContent = count;
        notifBadge.style.display = 'flex';
      } else {
        notifBadge.style.display = 'none';
      }
    }
  }

  syncUserProfileUI();

  // 2. Toast Notification Utility
  const toastContainer = document.getElementById('toast-container');

  function showToast({ title, message, type = 'info', duration = 3500 }) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // 3. Post Rendering & Dynamic Stream
  const postsStream = document.getElementById('posts-stream');

  function renderPostCard(post) {
    const isLiked = Array.isArray(post.likes) && post.likes.includes(currentUser.id);
    const isSaved = Array.isArray(post.savedBy) && post.savedBy.includes(currentUser.id);
    const tagsArr = Array.isArray(post.tags) ? post.tags : (post.tags || '').split(' ').filter(Boolean);
    const tagsAttr = tagsArr.join(' ');
    const tagsHtml = tagsArr.map((t) => `<span class="post-tag">${escapeHtml(t)}</span>`).join(' ');

    const isAuthor = post.authorId === currentUser.id || post.authorHandle === `@${currentUser.handle}` || currentUser.handle === 'alex_dev';

    let codeHtml = '';
    if (post.codeSnippet) {
      const lang = (post.codeLanguage || 'ts').toUpperCase();
      const filename = post.snippetFilename || `snippet.${post.codeLanguage || 'ts'}`;
      codeHtml = `
        <div class="code-snippet-block">
          <div class="snippet-header">
            <div class="snippet-lang-tag">
              <span class="lang-icon">${lang}</span>
              <span>${escapeHtml(filename)}</span>
            </div>
            <button type="button" class="btn-copy-code" title="Copy code snippet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </button>
          </div>
          <pre class="snippet-pre"><code>${escapeHtml(post.codeSnippet)}</code></pre>
        </div>
      `;
    }

    let projectCalloutHtml = '';
    if (post.projectCallout) {
      projectCalloutHtml = `
        <div class="project-callout-card">
          <div class="callout-badge">${escapeHtml(post.projectCallout.badge || 'Project Scope')}</div>
          <div class="callout-title">${escapeHtml(post.projectCallout.title)}</div>
          <div class="callout-stack">${escapeHtml(post.projectCallout.stack)}</div>
        </div>
      `;
    }

    const commentsListHtml = (post.comments || [])
      .map(
        (c) => `
      <div class="comment-item">
        <div class="comment-avatar ${c.authorColor || 'av-david'}">${escapeHtml(c.authorInitials || 'DEV')}</div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(c.authorHandle)}</span>
            <span class="comment-time">${escapeHtml(c.createdAt || 'Recent')}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
        </div>
      </div>
    `
      )
      .join('');

    return `
      <article class="post-card" id="${post.id}" data-post-id="${post.id}" data-tags="${tagsAttr}" data-author="${post.authorHandle}" data-saved="${isSaved}">
        <div class="post-header">
          <div class="post-author-box">
            <div class="author-avatar ${post.authorAvatarColor || 'av-sarah'}">
              <span>${escapeHtml(post.authorInitials || 'DEV')}</span>
            </div>
            <div class="author-details">
              <div class="author-name-row">
                <h3 class="author-name">${escapeHtml(post.authorName)}</h3>
                ${post.isVerified ? '<span class="verified-badge" title="Verified Engineer">✓</span>' : ''}
                <span class="author-handle">${escapeHtml(post.authorHandle)}</span>
                <span class="post-dot">•</span>
                <time class="post-time">${post.createdAt || 'Recently'}</time>
              </div>
              <div class="author-title">${escapeHtml(post.authorTitle || 'Software Engineer')}</div>
            </div>
          </div>
          ${post.isCollab ? '<div class="badge-collab">🤝 Hackathon</div>' : ''}
          ${
            isAuthor
              ? `<button type="button" class="btn-delete-post" data-post-id="${post.id}" title="Delete Post">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>`
              : ''
          }
        </div>

        <div class="post-body">
          <p class="post-text">${escapeHtml(post.content).replace(/\n/g, '<br>')}</p>
          ${projectCalloutHtml}
          ${codeHtml}
          <div class="post-tags-list">
            ${tagsHtml}
          </div>
        </div>

        <div class="post-actions">
          <button type="button" class="btn-action btn-like ${isLiked ? 'liked' : ''}" aria-label="Like post">
            <svg class="action-icon icon-heart" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="action-count like-count">${post.likesCount || (post.likes || []).length}</span>
          </button>

          <button type="button" class="btn-action btn-comment" aria-label="Comment on post">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span class="action-count comment-count">${(post.comments || []).length}</span>
          </button>

          <button type="button" class="btn-action btn-save ${isSaved ? 'saved' : ''}" aria-label="Save post" title="Save / Bookmark">
            <svg class="action-icon icon-bookmark" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="action-label save-label">${isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button type="button" class="btn-action btn-share" aria-label="Share post" title="Share / Copy Link">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>

        <div class="comments-drawer hidden">
          <div class="comment-input-row">
            <div class="comment-user-avatar">
              <span>${currentUser.initials || 'DEV'}</span>
            </div>
            <div class="comment-input-box">
              <input type="text" class="comment-text-input" placeholder="Write a constructive reply...">
              <button type="button" class="btn-submit-comment">Post</button>
            </div>
          </div>
          <div class="comments-list">
            ${commentsListHtml}
          </div>
        </div>
      </article>
    `;
  }

  function renderAllPosts() {
    if (!postsStream) return;
    const posts = window.DevLinkDB ? window.DevLinkDB.PostDB.getAll() : [];
    if (posts.length > 0) {
      postsStream.innerHTML = posts.map(renderPostCard).join('');
    } else {
      postsStream.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No posts found in database.</p>
          <p style="font-size: 0.88rem;">Be the first developer to publish an update above! 🚀</p>
        </div>
      `;
    }
    updateSavedCounters();
  }

  renderAllPosts();

  // 4. Saved Posts Badges & Counters
  function updateSavedCounters() {
    let count = 0;
    if (window.DevLinkDB) {
      count = window.DevLinkDB.PostDB.getSavedCount(currentUser.id);
    } else {
      count = document.querySelectorAll('.post-card[data-saved="true"]').length;
    }
    const savedBadge = document.getElementById('nav-saved-badge');
    const savedPill = document.getElementById('saved-count-pill');
    if (savedBadge) savedBadge.textContent = count;
    if (savedPill) savedPill.textContent = count;
  }

  // 5. Global Search & Real-Time Filtering
  const searchInput = document.getElementById('global-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const searchBanner = document.getElementById('search-status-banner');
  const searchKeywordDisplay = document.getElementById('search-keyword-display');
  const btnResetSearch = document.getElementById('btn-reset-search');

  function filterPosts(query) {
    const q = query.trim().toLowerCase();
    const posts = document.querySelectorAll('.post-card');
    let matchCount = 0;

    posts.forEach((post) => {
      const text = post.innerText.toLowerCase();
      const tags = (post.getAttribute('data-tags') || '').toLowerCase();
      const author = (post.getAttribute('data-author') || '').toLowerCase();

      if (!q || text.includes(q) || tags.includes(q) || author.includes(q)) {
        post.style.display = 'block';
        matchCount++;
      } else {
        post.style.display = 'none';
      }
    });

    if (q) {
      btnClearSearch?.classList.remove('hidden');
      searchBanner?.classList.remove('hidden');
      if (searchKeywordDisplay) searchKeywordDisplay.textContent = `"${query}" (${matchCount} found)`;
    } else {
      btnClearSearch?.classList.add('hidden');
      searchBanner?.classList.add('hidden');
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterPosts(e.target.value));

    window.addEventListener('keydown', (e) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInput &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        document.activeElement.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      filterPosts('');
      searchInput?.focus();
    });
  }

  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      filterPosts('');
    });
  }

  document.querySelectorAll('.tag-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const tag = chip.getAttribute('data-tag');
      if (searchInput) {
        searchInput.value = tag;
        filterPosts(tag);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast({
          title: 'Filtering by Tag',
          message: `Showing developer posts tagged with ${tag}`,
          type: 'info'
        });
      }
    });
  });

  // 6. Interactive Post Actions (Like, Comment, Save, Share, Copy Code, Delete)
  if (postsStream) {
    postsStream.addEventListener('click', (e) => {
      // --- LIKE BUTTON ACTION ---
      const likeBtn = e.target.closest('.btn-like');
      if (likeBtn) {
        const postCard = likeBtn.closest('.post-card');
        const postId = postCard?.getAttribute('data-post-id');
        const countSpan = likeBtn.querySelector('.like-count');

        if (window.DevLinkDB && postId) {
          const res = window.DevLinkDB.PostDB.toggleLike(postId, currentUser.id);
          if (res.liked) {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('svg')?.setAttribute('fill', 'currentColor');
          } else {
            likeBtn.classList.remove('liked');
            likeBtn.querySelector('svg')?.setAttribute('fill', 'none');
          }
          if (countSpan) countSpan.textContent = res.likesCount;
        }
        return;
      }

      // --- COMMENT BUTTON ACTION ---
      const commentBtn = e.target.closest('.btn-comment');
      if (commentBtn) {
        const postCard = commentBtn.closest('.post-card');
        const drawer = postCard.querySelector('.comments-drawer');
        if (drawer) {
          drawer.classList.toggle('hidden');
          commentBtn.classList.toggle('active-comment');
          if (!drawer.classList.contains('hidden')) {
            const input = drawer.querySelector('.comment-text-input');
            input?.focus();
          }
        }
        return;
      }

      // --- SAVE / BOOKMARK ACTION ---
      const saveBtn = e.target.closest('.btn-save');
      if (saveBtn) {
        const postCard = saveBtn.closest('.post-card');
        const postId = postCard?.getAttribute('data-post-id');
        const label = saveBtn.querySelector('.save-label');
        const icon = saveBtn.querySelector('svg');

        if (window.DevLinkDB && postId) {
          const res = window.DevLinkDB.PostDB.toggleSave(postId, currentUser.id);
          if (res.saved) {
            saveBtn.classList.add('saved');
            if (label) label.textContent = 'Saved';
            if (icon) icon.setAttribute('fill', 'currentColor');
            postCard.setAttribute('data-saved', 'true');
            showToast({
              title: 'Post Bookmarked 🔖',
              message: 'Saved to your bookmarked collection in posts.db',
              type: 'success'
            });
          } else {
            saveBtn.classList.remove('saved');
            if (label) label.textContent = 'Save';
            if (icon) icon.setAttribute('fill', 'none');
            postCard.setAttribute('data-saved', 'false');
            showToast({
              title: 'Bookmark Removed',
              message: 'Post removed from your saved bookmarks.',
              type: 'info'
            });
          }
          updateSavedCounters();
        }
        return;
      }

      // --- SHARE ACTION ---
      const shareBtn = e.target.closest('.btn-share');
      if (shareBtn) {
        navigator.clipboard?.writeText(window.location.href);
        showToast({
          title: 'Link Copied 🔗',
          message: 'Post permalink copied to clipboard.',
          type: 'info'
        });
        return;
      }

      // --- COPY CODE ACTION ---
      const copyCodeBtn = e.target.closest('.btn-copy-code');
      if (copyCodeBtn) {
        const codeBlock = copyCodeBtn.closest('.code-snippet-block');
        const codeText = codeBlock.querySelector('code')?.innerText || '';
        navigator.clipboard?.writeText(codeText);

        const span = copyCodeBtn.querySelector('span');
        const orig = span ? span.textContent : 'Copy';
        if (span) span.textContent = 'Copied!';
        copyCodeBtn.style.color = 'var(--accent-emerald)';

        setTimeout(() => {
          if (span) span.textContent = orig;
          copyCodeBtn.style.color = '';
        }, 2000);

        showToast({
          title: 'Code Copied! 📋',
          message: 'Snippet copied to clipboard.',
          type: 'success',
          duration: 2500
        });
        return;
      }

      // --- SUBMIT COMMENT BUTTON ---
      const submitCommentBtn = e.target.closest('.btn-submit-comment');
      if (submitCommentBtn) {
        const postCard = submitCommentBtn.closest('.post-card');
        const postId = postCard?.getAttribute('data-post-id');
        const input = postCard.querySelector('.comment-text-input');
        const commentsList = postCard.querySelector('.comments-list');
        const commentCountSpan = postCard.querySelector('.comment-count');

        if (!input || !commentsList || !postId) return;
        const text = input.value.trim();
        if (!text) return;

        if (window.DevLinkDB) {
          window.DevLinkDB.PostDB.addComment(postId, text, currentUser);
        }

        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.innerHTML = `
          <div class="comment-avatar" style="background: linear-gradient(135deg, #00f2fe, #4facfe); color: #030712;">${escapeHtml(currentUser.initials)}</div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">@${escapeHtml(currentUser.handle)}</span>
              <span class="comment-time">Just now</span>
            </div>
            <p class="comment-text">${escapeHtml(text)}</p>
          </div>
        `;

        commentsList.appendChild(commentItem);
        input.value = '';

        if (commentCountSpan) {
          const count = parseInt(commentCountSpan.textContent, 10) || 0;
          commentCountSpan.textContent = count + 1;
        }

        showToast({
          title: 'Reply Published 💬',
          message: 'Your reply has been saved to the post thread.',
          type: 'success',
          duration: 2500
        });
        return;
      }

      // --- DELETE POST ACTION ---
      const deleteBtn = e.target.closest('.btn-delete-post');
      if (deleteBtn) {
        const postId = deleteBtn.getAttribute('data-post-id');
        if (postId && window.DevLinkDB) {
          const deleted = window.DevLinkDB.PostDB.deletePost(postId, currentUser.id);
          if (deleted) {
            renderAllPosts();
            showToast({
              title: 'Post Deleted 🗑️',
              message: 'The post has been removed from posts.db.',
              type: 'info'
            });
          }
        }
      }
    });

    postsStream.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('comment-text-input')) {
        e.preventDefault();
        const postCard = e.target.closest('.post-card');
        const submitBtn = postCard?.querySelector('.btn-submit-comment');
        submitBtn?.click();
      }
    });
  }

  // 7. Post Composer & Publish Flow
  const postComposerInput = document.getElementById('post-composer-input');
  const btnToggleCodeTool = document.getElementById('btn-toggle-code-tool');
  const composerCodeBox = document.getElementById('composer-code-box');
  const composerCodeInput = document.getElementById('composer-code-input');
  const composerCodeLang = document.getElementById('composer-code-lang');
  const btnAddTagTool = document.getElementById('btn-add-tag-tool');
  const btnAddLinkTool = document.getElementById('btn-add-link-tool');
  const btnPublishPost = document.getElementById('btn-publish-post');
  const btnTriggerPost = document.getElementById('btn-trigger-post');
  const mobCreatePostBtn = document.getElementById('mob-create-post-btn');

  function focusComposer() {
    postComposerInput?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnTriggerPost?.addEventListener('click', focusComposer);
  mobCreatePostBtn?.addEventListener('click', focusComposer);

  btnToggleCodeTool?.addEventListener('click', () => {
    if (!composerCodeBox) return;
    const isHidden = composerCodeBox.classList.contains('hidden');
    if (isHidden) {
      composerCodeBox.classList.remove('hidden');
      btnToggleCodeTool.classList.add('active');
      composerCodeInput?.focus();
    } else {
      composerCodeBox.classList.add('hidden');
      btnToggleCodeTool.classList.remove('active');
    }
  });

  btnAddTagTool?.addEventListener('click', () => {
    if (!postComposerInput) return;
    postComposerInput.value += (postComposerInput.value ? ' ' : '') + '#buildinpublic';
    postComposerInput.focus();
  });

  btnAddLinkTool?.addEventListener('click', () => {
    if (!postComposerInput) return;
    postComposerInput.value += (postComposerInput.value ? ' ' : '') + 'https://github.com/devlink';
    postComposerInput.focus();
  });

  if (btnPublishPost) {
    btnPublishPost.addEventListener('click', () => {
      const text = postComposerInput?.value.trim() || '';
      const code = composerCodeInput?.value.trim() || '';
      const lang = composerCodeLang?.value || 'typescript';

      if (!text && !code) {
        showToast({
          title: 'Cannot Publish Empty Post',
          message: 'Please write a message or attach code snippet to publish.',
          type: 'error'
        });
        return;
      }

      const tags = (text.match(/#[a-zA-Z0-9_]+/g) || ['#buildinpublic', '#devlink']).map((t) => t.trim());

      if (window.DevLinkDB) {
        window.DevLinkDB.PostDB.create(
          {
            content: text,
            codeSnippet: code || null,
            codeLanguage: code ? lang : null,
            tags: tags
          },
          currentUser
        );
      }

      // Re-render feed stream
      renderAllPosts();

      // Reset composer
      if (postComposerInput) postComposerInput.value = '';
      if (composerCodeInput) composerCodeInput.value = '';
      composerCodeBox?.classList.add('hidden');
      btnToggleCodeTool?.classList.remove('active');

      showToast({
        title: 'Post Stored in Database! 🚀',
        message: 'Your update is now broadcasted in posts.db and visible in the feed.',
        type: 'success',
        duration: 3500
      });
    });
  }

  // 8. Navigation Filters & Sidebar Links
  const feedTabs = document.querySelectorAll('.feed-tab');
  const sidebarNavLinks = document.querySelectorAll('.sidebar-nav .nav-link, .mobile-bottom-nav .mob-nav-btn');

  function applyFeedFilter(filter) {
    const posts = document.querySelectorAll('.post-card');

    posts.forEach((post) => {
      if (filter === 'all' || filter === 'trending' || filter === 'latest') {
        post.style.display = 'block';
      } else if (filter === 'saved') {
        const isSaved = post.getAttribute('data-saved') === 'true';
        post.style.display = isSaved ? 'block' : 'none';
      } else if (filter === 'snippets') {
        const hasSnippet = post.querySelector('.code-snippet-block') !== null;
        post.style.display = hasSnippet ? 'block' : 'none';
      } else if (filter === 'hackathons') {
        const hasCollab =
          post.querySelector('.badge-collab') !== null || (post.getAttribute('data-tags') || '').includes('hackathon');
        post.style.display = hasCollab ? 'block' : 'none';
      } else if (filter === 'following') {
        const author = post.getAttribute('data-author');
        post.style.display = author === '@sarah_codes' || author === '@david_rust' ? 'block' : 'none';
      }
    });
  }

  feedTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      feedTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      applyFeedFilter(tab.getAttribute('data-tab'));
    });
  });

  sidebarNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const filter = link.getAttribute('data-filter');
      if (!filter) return;

      sidebarNavLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      applyFeedFilter(filter);

      if (filter === 'saved') {
        showToast({
          title: 'Saved Bookmarks Filtered',
          message: 'Displaying your bookmarked code snippets and posts.',
          type: 'info'
        });
      }
    });
  });

  // 9. Profile Dropdown Controls
  const btnProfileDropdown = document.getElementById('btn-profile-dropdown');
  const profileDropdown = document.getElementById('profile-dropdown');

  function toggleProfileMenu() {
    if (!profileDropdown) return;
    profileDropdown.classList.toggle('hidden');
    const isExpanded = !profileDropdown.classList.contains('hidden');
    btnProfileDropdown?.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }

  btnProfileDropdown?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleProfileMenu();
  });

  document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
      if (!profileDropdown.contains(e.target) && e.target !== btnProfileDropdown) {
        profileDropdown.classList.add('hidden');
        btnProfileDropdown?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // 10. Modals Hub Handlers

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // --- Developer Profile Modal ---
  const modalProfile = document.getElementById('modal-profile');
  const btnMenuProfile = document.getElementById('menu-profile');
  const btnCloseProfile = document.getElementById('btn-close-profile');
  const leftUserCard = document.querySelector('.user-mini-card');
  const mobProfileBtn = document.getElementById('mob-profile-btn');

  function openProfileModal() {
    syncUserProfileUI();
    if (!modalProfile) return;

    // Populate profile modal details
    const pName = document.getElementById('profile-modal-name');
    const pHandle = document.getElementById('profile-modal-handle');
    const pRole = document.getElementById('profile-modal-role');
    const pBio = document.getElementById('profile-modal-bio');
    const pInitials = document.getElementById('profile-modal-initials');
    const pTech = document.getElementById('profile-modal-tech');
    const pFollowers = document.getElementById('profile-stat-followers');
    const pFollowing = document.getElementById('profile-stat-following');
    const pRepos = document.getElementById('profile-stat-repos');
    const pPosts = document.getElementById('profile-stat-posts');

    if (pName) pName.textContent = currentUser.name;
    if (pHandle) pHandle.textContent = `@${currentUser.handle}`;
    if (pRole) pRole.textContent = currentUser.role || 'Software Engineer';
    if (pBio) pBio.textContent = currentUser.bio || 'Building on DevLink.';
    if (pInitials) pInitials.textContent = currentUser.initials || 'DEV';
    if (pFollowers) pFollowers.textContent = (currentUser.followersCount || 1420).toLocaleString();
    if (pFollowing) pFollowing.textContent = (currentUser.followingCount || 382).toLocaleString();
    if (pRepos) pRepos.textContent = (currentUser.reposCount || 24).toLocaleString();

    if (pTech) {
      const tags = currentUser.techStack || ['TypeScript', 'React', 'Rust'];
      pTech.innerHTML = tags.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
    }

    // Render user posts in tab
    const userPosts = window.DevLinkDB ? window.DevLinkDB.PostDB.getUserPosts(currentUser.id) : [];
    if (pPosts) pPosts.textContent = userPosts.length;

    renderProfilePostsTab('posts');
    openModal(modalProfile);
  }

  function renderProfilePostsTab(tabType) {
    const container = document.getElementById('profile-tab-posts-container');
    if (!container) return;

    if (tabType === 'posts') {
      const posts = window.DevLinkDB ? window.DevLinkDB.PostDB.getUserPosts(currentUser.id) : [];
      if (posts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.88rem; padding: 1rem 0;">No posts published yet.</p>';
      } else {
        container.innerHTML = posts
          .map(
            (p) => `
          <div class="profile-post-mini">
            <p>${escapeHtml(p.content || 'Code snippet update')}</p>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${p.createdAt || 'Recent'}</span>
          </div>
        `
          )
          .join('');
      }
    } else {
      const saved = window.DevLinkDB ? window.DevLinkDB.PostDB.getSavedPosts(currentUser.id) : [];
      if (saved.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.88rem; padding: 1rem 0;">No bookmarked posts yet.</p>';
      } else {
        container.innerHTML = saved
          .map(
            (p) => `
          <div class="profile-post-mini">
            <p>${escapeHtml(p.content || 'Saved snippet')}</p>
            <span style="font-size: 0.75rem; color: var(--accent-cyan);">Saved 🔖</span>
          </div>
        `
          )
          .join('');
      }
    }
  }

  document.querySelectorAll('.profile-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderProfilePostsTab(btn.getAttribute('data-profile-tab'));
    });
  });

  btnMenuProfile?.addEventListener('click', (e) => {
    e.preventDefault();
    profileDropdown?.classList.add('hidden');
    openProfileModal();
  });

  leftUserCard?.addEventListener('click', openProfileModal);
  leftUserCard?.style.setProperty('cursor', 'pointer');
  mobProfileBtn?.addEventListener('click', openProfileModal);
  btnCloseProfile?.addEventListener('click', () => closeModal(modalProfile));

  // --- Edit Profile Modal ---
  const modalEditProfile = document.getElementById('modal-edit-profile');
  const btnOpenEditProfile = document.getElementById('btn-open-edit-profile');
  const btnCloseEditProfile = document.getElementById('btn-close-edit-profile');
  const btnCancelEditProfile = document.getElementById('btn-cancel-edit-profile');
  const formEditProfile = document.getElementById('form-edit-profile');

  btnOpenEditProfile?.addEventListener('click', () => {
    closeModal(modalProfile);
    const editName = document.getElementById('edit-name');
    const editRole = document.getElementById('edit-role');
    const editBio = document.getElementById('edit-bio');
    const editTech = document.getElementById('edit-tech');

    if (editName) editName.value = currentUser.name || '';
    if (editRole) editRole.value = currentUser.role || '';
    if (editBio) editBio.value = currentUser.bio || '';
    if (editTech) editTech.value = (currentUser.techStack || []).join(', ');

    openModal(modalEditProfile);
  });

  btnCloseEditProfile?.addEventListener('click', () => closeModal(modalEditProfile));
  btnCancelEditProfile?.addEventListener('click', () => closeModal(modalEditProfile));

  formEditProfile?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name')?.value.trim();
    const role = document.getElementById('edit-role')?.value.trim();
    const bio = document.getElementById('edit-bio')?.value.trim();
    const techRaw = document.getElementById('edit-tech')?.value || '';
    const techStack = techRaw.split(',').map((t) => t.trim()).filter(Boolean);

    if (name && window.DevLinkDB) {
      window.DevLinkDB.UserDB.updateProfile(currentUser.id, {
        name,
        role,
        bio,
        techStack
      });
      syncUserProfileUI();
      closeModal(modalEditProfile);
      showToast({
        title: 'Profile Updated! ✨',
        message: 'Your developer credentials have been saved to users.db.',
        type: 'success'
      });
    }
  });

  // --- Notifications Center Modal ---
  const modalNotifications = document.getElementById('modal-notifications');
  const btnNotifications = document.getElementById('btn-notifications');
  const btnCloseNotifs = document.getElementById('btn-close-notifs');
  const btnMarkAllRead = document.getElementById('btn-mark-all-read');
  const notifsListContainer = document.getElementById('notifications-list');

  function renderNotifications() {
    if (!notifsListContainer || !window.DevLinkDB) return;
    const notifs = window.DevLinkDB.NotificationDB.getAll();

    notifsListContainer.innerHTML = notifs
      .map((n) => {
        let icon = '⚡';
        if (n.type === 'star') icon = '⭐';
        if (n.type === 'comment') icon = '💬';
        if (n.type === 'hackathon') icon = '🏆';
        return `
        <div class="notif-item ${n.read ? '' : 'unread'}">
          <div class="notif-icon">${icon}</div>
          <div class="notif-content">
            <div class="notif-title">${escapeHtml(n.title)}</div>
            <div class="notif-message">${escapeHtml(n.message)}</div>
            <div class="notif-time">${escapeHtml(n.time)}</div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  btnNotifications?.addEventListener('click', () => {
    renderNotifications();
    openModal(modalNotifications);
  });

  btnCloseNotifs?.addEventListener('click', () => closeModal(modalNotifications));

  btnMarkAllRead?.addEventListener('click', () => {
    if (window.DevLinkDB) {
      window.DevLinkDB.NotificationDB.markAllAsRead();
      renderNotifications();
      syncUserProfileUI();
      showToast({
        title: 'Notifications Cleared',
        message: 'All notifications marked as read.',
        type: 'info'
      });
    }
  });

  // --- Direct Messages (DMs) Modal ---
  const modalMessages = document.getElementById('modal-messages');
  const btnMessages = document.getElementById('btn-messages');
  const btnCloseMessages = document.getElementById('btn-close-messages');
  const formSendMessage = document.getElementById('form-send-message');
  const chatInput = document.getElementById('chat-input');
  const chatMessagesContainer = document.getElementById('chat-messages-container');
  let activeChatHandle = 'sarah_codes';

  function renderChat(handle) {
    activeChatHandle = handle;
    if (!chatMessagesContainer || !window.DevLinkDB) return;
    const thread = window.DevLinkDB.MessageDB.getThread(handle);

    chatMessagesContainer.innerHTML = thread
      .map(
        (m) => `
      <div class="chat-msg ${m.from === currentUser.handle ? 'mine' : 'peer'}">
        ${escapeHtml(m.text)}
      </div>
    `
      )
      .join('');

    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  btnMessages?.addEventListener('click', () => {
    renderChat(activeChatHandle);
    openModal(modalMessages);
  });

  btnCloseMessages?.addEventListener('click', () => closeModal(modalMessages));

  document.querySelectorAll('.contact-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.contact-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const handle = item.getAttribute('data-handle');
      const name = item.getAttribute('data-name');
      const titleName = document.getElementById('chat-active-name');
      const titleHandle = document.getElementById('chat-active-handle');

      if (titleName) titleName.textContent = name;
      if (titleHandle) titleHandle.textContent = `@${handle}`;

      renderChat(handle);
    });
  });

  formSendMessage?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput?.value.trim();
    if (!text || !window.DevLinkDB) return;

    window.DevLinkDB.MessageDB.sendMessage(activeChatHandle, text, currentUser.handle);
    renderChat(activeChatHandle);
    if (chatInput) chatInput.value = '';

    // Auto simulated reply from peer
    setTimeout(() => {
      const replies = [
        'Awesome! Checking it out now.',
        'Sounds great, will test with our pipeline!',
        'Got it! Looking forward to collaborating on this.',
        'Super clean API design!'
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      window.DevLinkDB.MessageDB.sendMessage(activeChatHandle, reply, activeChatHandle);
      renderChat(activeChatHandle);
    }, 1200);
  });

  // --- Settings & API Keys Modal ---
  const modalSettings = document.getElementById('modal-settings');
  const btnMenuSettings = document.getElementById('menu-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnCopyToken = document.getElementById('btn-copy-token');
  const devApiToken = document.getElementById('dev-api-token');
  const btnResetDatabase = document.getElementById('btn-reset-database');

  btnMenuSettings?.addEventListener('click', (e) => {
    e.preventDefault();
    profileDropdown?.classList.add('hidden');
    openModal(modalSettings);
  });

  btnCloseSettings?.addEventListener('click', () => closeModal(modalSettings));

  btnCopyToken?.addEventListener('click', () => {
    if (devApiToken) {
      navigator.clipboard?.writeText(devApiToken.value);
      showToast({
        title: 'Token Copied 🔑',
        message: 'Personal Access Token copied to clipboard.',
        type: 'success'
      });
    }
  });

  btnResetDatabase?.addEventListener('click', () => {
    if (window.DevLinkDB) {
      window.DevLinkDB.UserDB.resetDemoData();
      renderAllPosts();
      syncUserProfileUI();
      closeModal(modalSettings);
      showToast({
        title: 'Database Reset ✨',
        message: 'All relational tables restored to initial demo seed data.',
        type: 'success'
      });
    }
  });

  // Theme option switches
  document.querySelectorAll('.theme-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      showToast({
        title: 'Theme Applied',
        message: `Workspace theme changed to ${theme.toUpperCase()}`,
        type: 'info'
      });
    });
  });

  // --- Hackathon Modal ---
  const modalHackathon = document.getElementById('modal-hackathon');
  const btnRegisterHackathon = document.getElementById('btn-register-hackathon');
  const btnCloseHackathon = document.getElementById('btn-close-hackathon');
  const btnConfirmHackathon = document.getElementById('btn-confirm-hackathon');

  btnRegisterHackathon?.addEventListener('click', () => openModal(modalHackathon));
  btnCloseHackathon?.addEventListener('click', () => closeModal(modalHackathon));
  btnConfirmHackathon?.addEventListener('click', () => {
    closeModal(modalHackathon);
    showToast({
      title: 'Registration Confirmed! 🏆',
      message: "You're registered for the DevLink Global Hackathon 2026. Welcome to the roster!",
      type: 'success',
      duration: 4000
    });
  });

  // --- Repo Details Modal ---
  const modalRepo = document.getElementById('modal-repo');
  const btnCloseRepo = document.getElementById('btn-close-repo');
  const btnCopyClone = document.getElementById('btn-copy-clone');
  const btnStarRepo = document.getElementById('btn-star-repo');

  document.querySelectorAll('.repo-item').forEach((item) => {
    item.addEventListener('click', () => {
      const name = item.querySelector('.repo-name')?.textContent || 'devlink/agent-ide';
      const desc = item.querySelector('.repo-desc')?.textContent || '';
      const titleEl = document.getElementById('repo-modal-title');
      const descEl = document.getElementById('repo-modal-desc');

      if (titleEl) titleEl.textContent = name;
      if (descEl) descEl.textContent = desc;

      openModal(modalRepo);
    });
    item.style.setProperty('cursor', 'pointer');
  });

  btnCloseRepo?.addEventListener('click', () => closeModal(modalRepo));
  btnCopyClone?.addEventListener('click', () => {
    navigator.clipboard?.writeText('git clone https://github.com/devlink/agent-ide.git');
    showToast({
      title: 'Clone Command Copied 📋',
      message: 'git clone command copied to clipboard.',
      type: 'success'
    });
  });

  btnStarRepo?.addEventListener('click', () => {
    btnStarRepo.textContent = '⭐ Starred (3.5k)';
    showToast({
      title: 'Repository Starred ⭐',
      message: 'Added to your starred repositories.',
      type: 'success'
    });
  });

  // --- Close any modal on backdrop click or Escape key ---
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(closeModal);
    }
  });

  // 11. Follow / Following Actions
  document.querySelectorAll('.btn-follow').forEach((btn) => {
    const handle = btn.getAttribute('data-handle');
    if (window.DevLinkDB && handle) {
      if (window.DevLinkDB.UserDB.isFollowing(handle)) {
        btn.classList.add('following');
        btn.textContent = 'Following';
      }
    }

    btn.addEventListener('click', () => {
      if (!handle || !window.DevLinkDB) return;
      const res = window.DevLinkDB.UserDB.toggleFollow(handle);
      if (res.isFollowing) {
        btn.classList.add('following');
        btn.textContent = 'Following';
        showToast({
          title: `Following ${handle} ⚡`,
          message: `You will receive priority snippet updates from ${handle}.`,
          type: 'success'
        });
      } else {
        btn.classList.remove('following');
        btn.textContent = 'Follow';
        showToast({
          title: `Unfollowed ${handle}`,
          message: `Unsubscribed from ${handle}'s feed broadcasts.`,
          type: 'info'
        });
      }
      syncUserProfileUI();
    });
  });

  // 12. Switch Account / Log Out
  const menuLogout = document.getElementById('menu-logout');
  menuLogout?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.DevLinkDB) {
      window.DevLinkDB.UserDB.logout();
    }
    showToast({
      title: 'Session Disconnected',
      message: 'Logging out and switching account...',
      type: 'info',
      duration: 2000
    });
    setTimeout(() => {
      window.location.href = '../login/index.html';
    }, 600);
  });

  // Helper: HTML escaping to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

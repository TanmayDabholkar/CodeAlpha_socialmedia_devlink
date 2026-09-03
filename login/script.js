document.addEventListener('DOMContentLoaded', () => {
  // 1. Background Animated Particle Canvas (Developer Theme)
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 18000), 65);
    const codeGlyphs = ['{ }', '</>', '=>', 'git', 'const', '01', 'npm', 'async', 'fn'];

    // Track mouse for subtle interactive particle attraction
    const mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1;
        this.isGlyph = Math.random() > 0.65;
        this.glyph = codeGlyphs[Math.floor(Math.random() * codeGlyphs.length)];
        this.baseAlpha = Math.random() * 0.35 + 0.15;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap edges smoothly
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse proximity interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= Math.cos(angle) * force * 1.5;
            this.y -= Math.sin(angle) * force * 1.5;
            this.alpha = Math.min(0.8, this.baseAlpha + 0.3);
          } else {
            this.alpha = this.baseAlpha;
          }
        }
      }

      draw() {
        ctx.save();
        if (this.isGlyph) {
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(0, 242, 254, ${this.alpha * 0.7})`;
          ctx.fillText(this.glyph, this.x, this.y);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(127, 0, 255, ${this.alpha})`;
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connectLines() {
      const maxDistance = 120;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      connectLines();
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }

  // 2. Tab Switching (Sign In vs Create Account)
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const tabIndicator = document.getElementById('tab-indicator');
  const loginPanel = document.getElementById('login-panel');
  const signupPanel = document.getElementById('signup-panel');

  function switchTab(target) {
    if (target === 'login') {
      tabLogin.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'true');
      tabSignup.classList.remove('active');
      tabSignup.setAttribute('aria-selected', 'false');

      tabIndicator.style.transform = 'translateX(0%)';
      loginPanel.classList.add('active');
      signupPanel.classList.remove('active');
    } else {
      tabSignup.classList.add('active');
      tabSignup.setAttribute('aria-selected', 'true');
      tabLogin.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'false');

      tabIndicator.style.transform = 'translateX(100%)';
      signupPanel.classList.add('active');
      loginPanel.classList.remove('active');
    }
  }

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabSignup.addEventListener('click', () => switchTab('signup'));

  // 3. Password Visibility Toggles
  const pwToggleBtns = document.querySelectorAll('.btn-toggle-pw');

  pwToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
      } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
      }
    });
  });

  // 4. Dynamic Password Strength Meter
  const signupPasswordInput = document.getElementById('signup-password');
  const strengthMeterBox = document.getElementById('strength-meter-box');
  const strengthText = document.getElementById('strength-text');

  function checkPasswordStrength(password) {
    if (!password) {
      return { score: 0, text: 'Enter password', cls: '' };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length < 6) {
      return { score: 1, text: 'Too short (min 8 chars)', cls: 'strength-weak' };
    }

    if (score <= 2) {
      return { score: 1, text: 'Weak (Add numbers & symbols)', cls: 'strength-weak' };
    } else if (score === 3) {
      return { score: 2, text: 'Fair (Add special symbols)', cls: 'strength-fair' };
    } else if (score === 4) {
      return { score: 3, text: 'Good (Strong entropy)', cls: 'strength-good' };
    } else {
      return { score: 4, text: 'Strong / High Entropy ⚡', cls: 'strength-strong' };
    }
  }

  if (signupPasswordInput && strengthMeterBox && strengthText) {
    signupPasswordInput.addEventListener('input', (e) => {
      const val = e.target.value;
      const res = checkPasswordStrength(val);

      strengthMeterBox.className = 'strength-meter-box ' + res.cls;
      strengthText.textContent = res.text;

      // Clear field error if valid
      if (val.length >= 8) {
        document.getElementById('signup-password-group').classList.remove('has-error');
      }
    });
  }

  // 5. Dev Handle Live Validator
  const signupHandleInput = document.getElementById('signup-handle');
  const handleStatusBadge = document.getElementById('handle-status');
  const takenHandles = ['admin', 'devlink', 'moderator', 'root', 'support', 'system'];

  if (signupHandleInput && handleStatusBadge) {
    let handleTimeout;
    signupHandleInput.addEventListener('input', (e) => {
      clearTimeout(handleTimeout);
      const rawVal = e.target.value.trim().toLowerCase().replace(/^@/, '');
      e.target.value = rawVal; // Keep clean without extra @ symbol

      if (rawVal.length < 3) {
        handleStatusBadge.className = 'handle-status-badge';
        handleStatusBadge.textContent = '';
        return;
      }

      handleTimeout = setTimeout(() => {
        const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(rawVal);
        const isTaken = window.DevLinkDB ? window.DevLinkDB.UserDB.isHandleTaken(rawVal) : takenHandles.includes(rawVal);

        if (!isValid) {
          handleStatusBadge.className = 'handle-status-badge taken';
          handleStatusBadge.textContent = 'Invalid format';
        } else if (isTaken) {
          handleStatusBadge.className = 'handle-status-badge taken';
          handleStatusBadge.textContent = 'Taken';
        } else {
          handleStatusBadge.className = 'handle-status-badge available';
          handleStatusBadge.textContent = '✓ Available';
          document.getElementById('signup-handle-group').classList.remove('has-error');
        }
      }, 150);
    });
  }

  // 6. Tech Focus Tag Selector
  const techChips = document.querySelectorAll('.tech-chip');
  techChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
    });
  });

  // 7. Toast Notification Utility

  const toastContainer = document.getElementById('toast-container');

  function showToast({ title, message, type = 'info', duration = 4000 }) {
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
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  // 8. Demo Account Quick Fill
  const btnDemoFill = document.getElementById('btn-demo-fill');
  if (btnDemoFill) {
    btnDemoFill.addEventListener('click', () => {
      switchTab('login');
      const identifierInput = document.getElementById('login-identifier');
      const passwordInput = document.getElementById('login-password');

      identifierInput.value = 'alex.chen@devlink.io';
      passwordInput.value = 'DevLink#2026!Secure';

      // Clear validation errors
      document.getElementById('login-identifier-group').classList.remove('has-error');
      document.getElementById('login-password-group').classList.remove('has-error');

      showToast({
        title: 'Demo Credentials Loaded',
        message: 'Pre-filled demo developer account (@alex_dev). Click "Authenticate" to proceed.',
        type: 'info',
        duration: 3500
      });
    });
  }

  // 9. Login Form Submission & Simulated Authentication
  const formLogin = document.getElementById('form-login');
  const btnSubmitLogin = document.getElementById('btn-submit-login');

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const identifier = document.getElementById('login-identifier').value.trim();
      const password = document.getElementById('login-password').value;
      const groupIdentifier = document.getElementById('login-identifier-group');
      const groupPassword = document.getElementById('login-password-group');

      let hasError = false;

      if (!identifier) {
        groupIdentifier.classList.add('has-error');
        hasError = true;
      } else {
        groupIdentifier.classList.remove('has-error');
      }

      if (!password) {
        groupPassword.classList.add('has-error');
        hasError = true;
      } else {
        groupPassword.classList.remove('has-error');
      }

      if (hasError) {
        showToast({
          title: 'Authentication Required',
          message: 'Please provide both your developer identifier and password.',
          type: 'error'
        });
        return;
      }

      // Show loading state
      const btnText = btnSubmitLogin.querySelector('.btn-text');
      const btnArrow = btnSubmitLogin.querySelector('.btn-arrow');
      const spinner = btnSubmitLogin.querySelector('.spinner');

      btnSubmitLogin.disabled = true;
      btnText.textContent = 'Authenticating Session...';
      btnArrow.classList.add('hidden');
      spinner.classList.remove('hidden');

      try {
        let authResult = { success: true, user: { name: 'Alex Chen', handle: 'alex_dev' } };
        if (window.DevLinkDB && window.DevLinkDB.UserDB) {
          authResult = await window.DevLinkDB.UserDB.authenticate(identifier, password);
        }

        setTimeout(() => {
          btnSubmitLogin.disabled = false;
          btnText.textContent = 'Authenticate to DevLink';
          btnArrow.classList.remove('hidden');
          spinner.classList.add('hidden');

          if (!authResult.success) {
            showToast({
              title: 'Authentication Failed',
              message: authResult.message || 'Invalid credentials.',
              type: 'error'
            });
            return;
          }

          showToast({
            title: `Session Authenticated! 🚀`,
            message: `Welcome back, @${authResult.user.handle}! Connecting you to the global developer feed...`,
            type: 'success',
            duration: 3500
          });

          setTimeout(() => {
            window.location.href = '../homepage/index.html';
          }, 900);
        }, 600);
      } catch (err) {
        btnSubmitLogin.disabled = false;
        btnText.textContent = 'Authenticate to DevLink';
        btnArrow.classList.remove('hidden');
        spinner.classList.add('hidden');
        showToast({
          title: 'Authentication Error',
          message: err.message || 'An unexpected error occurred.',
          type: 'error'
        });
      }
    });
  }

  // 10. Sign Up Form Submission & Validation
  const formSignup = document.getElementById('form-signup');
  const btnSubmitSignup = document.getElementById('btn-submit-signup');

  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('signup-name').value.trim();
      const handle = document.getElementById('signup-handle').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const terms = document.getElementById('signup-terms').checked;

      const groupName = document.getElementById('signup-name-group');
      const groupHandle = document.getElementById('signup-handle-group');
      const groupEmail = document.getElementById('signup-email-group');
      const groupPassword = document.getElementById('signup-password-group');
      const errorTerms = document.getElementById('signup-terms-error');

      let hasError = false;

      if (!name) {
        groupName.classList.add('has-error');
        hasError = true;
      } else {
        groupName.classList.remove('has-error');
      }

      if (!handle || !/^[a-zA-Z0-9_]{3,20}$/.test(handle)) {
        groupHandle.classList.add('has-error');
        hasError = true;
      } else {
        groupHandle.classList.remove('has-error');
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailPattern.test(email)) {
        groupEmail.classList.add('has-error');
        hasError = true;
      } else {
        groupEmail.classList.remove('has-error');
      }

      if (!password || password.length < 8) {
        groupPassword.classList.add('has-error');
        hasError = true;
      } else {
        groupPassword.classList.remove('has-error');
      }

      if (!terms) {
        errorTerms.style.display = 'block';
        hasError = true;
      } else {
        errorTerms.style.display = 'none';
      }

      if (hasError) {
        showToast({
          title: 'Incomplete Registration',
          message: 'Please resolve the highlighted fields to create your DevLink profile.',
          type: 'error'
        });
        return;
      }

      // Collect selected tags
      const selectedTags = Array.from(document.querySelectorAll('.tech-chip.selected')).map(
        (el) => el.getAttribute('data-tech')
      );

      // Loading state
      const btnText = btnSubmitSignup.querySelector('.btn-text');
      const btnArrow = btnSubmitSignup.querySelector('.btn-arrow');
      const spinner = btnSubmitSignup.querySelector('.spinner');

      btnSubmitSignup.disabled = true;
      btnText.textContent = 'Generating Dev Profile...';
      btnArrow.classList.add('hidden');
      spinner.classList.remove('hidden');

      try {
        let createdUser;
        if (window.DevLinkDB && window.DevLinkDB.UserDB) {
          createdUser = await window.DevLinkDB.UserDB.create({
            name,
            handle,
            email,
            password,
            techStack: selectedTags
          });
        }

        setTimeout(() => {
          btnSubmitSignup.disabled = false;
          btnText.textContent = 'Initialize Developer Profile';
          btnArrow.classList.remove('hidden');
          spinner.classList.add('hidden');

          showToast({
            title: `Welcome to DevLink, @${handle}! 🎉`,
            message: `Account created successfully! Launching your developer workspace...`,
            type: 'success',
            duration: 3500
          });

          // Direct redirect into homepage feed with active session
          setTimeout(() => {
            window.location.href = '../homepage/index.html';
          }, 1000);
        }, 700);
      } catch (err) {
        btnSubmitSignup.disabled = false;
        btnText.textContent = 'Initialize Developer Profile';
        btnArrow.classList.remove('hidden');
        spinner.classList.add('hidden');

        showToast({
          title: 'Registration Error',
          message: err.message || 'Could not create account.',
          type: 'error'
        });
      }
    });
  }

  // 11. Forgot Password Modal Handling
  const btnForgotPassword = document.getElementById('btn-forgot-password');
  const forgotModal = document.getElementById('forgot-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const formForgotPw = document.getElementById('form-forgot-pw');
  const btnSendReset = document.getElementById('btn-send-reset');

  function openModal() {
    forgotModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const emailInput = document.getElementById('forgot-email');
    setTimeout(() => emailInput.focus(), 100);
  }

  function closeModal() {
    forgotModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (btnForgotPassword) btnForgotPassword.addEventListener('click', openModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);

  // Close on backdrop click
  if (forgotModal) {
    forgotModal.addEventListener('click', (e) => {
      if (e.target === forgotModal) closeModal();
    });
  }

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && forgotModal && !forgotModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Forgot password submission
  if (formForgotPw) {
    formForgotPw.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      const group = document.getElementById('forgot-email-group');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailPattern.test(email)) {
        group.classList.add('has-error');
        return;
      }
      group.classList.remove('has-error');

      const btnText = btnSendReset.querySelector('.btn-text');
      const spinner = btnSendReset.querySelector('.spinner');

      btnSendReset.disabled = true;
      btnText.textContent = 'Generating Token...';
      spinner.classList.remove('hidden');

      setTimeout(() => {
        btnSendReset.disabled = false;
        btnText.textContent = 'Send Magic Reset Link';
        spinner.classList.add('hidden');
        closeModal();

        showToast({
          title: 'Reset Link Dispatched',
          message: `A secure 1-click password reset link was sent to ${email}`,
          type: 'info',
          duration: 4500
        });
      }, 900);
    });
  }

  // 12. OAuth Social Logins Simulation
  const oauthButtons = [
    { id: 'oauth-github', name: 'GitHub' },
    { id: 'oauth-google', name: 'Google' },
    { id: 'oauth-gitlab', name: 'GitLab' },
    { id: 'oauth-discord', name: 'Discord' }
  ];

  oauthButtons.forEach((provider) => {
    const btn = document.getElementById(provider.id);
    if (btn) {
      btn.addEventListener('click', () => {
        showToast({
          title: `${provider.name} OAuth Authentication`,
          message: `Redirecting to ${provider.name} secure developer handshake...`,
          type: 'info',
          duration: 3500
        });
      });
    }
  });

  // 13. Dynamic Community Stats Live Ticker
  const statDevs = document.getElementById('stat-devs');
  if (statDevs) {
    let baseDevs = 128450;
    setInterval(() => {
      if (Math.random() > 0.4) {
        baseDevs += Math.floor(Math.random() * 3) + 1;
        statDevs.textContent = baseDevs.toLocaleString() + '+';
      }
    }, 4000);
  }
});

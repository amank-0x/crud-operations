// Global State
let currentUser = null;
let currentToken = localStorage.getItem('token_task3') || null;
let allBlogs = [];

// DOM Elements
const views = {
  home: document.getElementById('view-home'),
  login: document.getElementById('view-login'),
  register: document.getElementById('view-register'),
  createBlog: document.getElementById('view-create-blog')
};

const navBtns = {
  home: document.getElementById('nav-home'),
  createBlog: document.getElementById('nav-create-blog'),
  login: document.getElementById('nav-login'),
  register: document.getElementById('nav-register'),
  brandHome: document.getElementById('brand-home')
};

const authOnlyElems = document.querySelectorAll('.auth-only');
const guestOnlyElems = document.querySelectorAll('.guest-only');
const userDisplayName = document.getElementById('user-display-name');
const avatarInitial = document.getElementById('avatar-initial');
const btnLogout = document.getElementById('btn-logout');
const blogsGrid = document.getElementById('blogs-grid');
const searchInput = document.getElementById('search-input');
const toastContainer = document.getElementById('toast-container');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkAuthStatus();
  await fetchBlogs();
});

function setupEventListeners() {
  // Navigation
  if (navBtns.home) navBtns.home.addEventListener('click', (e) => { e.preventDefault(); switchView('home'); });
  if (navBtns.createBlog) navBtns.createBlog.addEventListener('click', () => switchView('createBlog'));
  if (navBtns.login) navBtns.login.addEventListener('click', () => switchView('login'));
  if (navBtns.register) navBtns.register.addEventListener('click', () => switchView('register'));

  document.getElementById('link-to-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('register');
  });

  document.getElementById('link-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('login');
  });

  document.getElementById('hero-get-started')?.addEventListener('click', () => switchView('register'));
  document.getElementById('btn-cancel-blog')?.addEventListener('click', () => switchView('home'));

  // Logout
  btnLogout.addEventListener('click', handleLogout);

  // Forms
  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('form-register').addEventListener('submit', handleRegister);
  document.getElementById('form-create-blog').addEventListener('submit', handleCreateBlog);

  // Search Filter
  if (searchInput) searchInput.addEventListener('input', filterBlogs);
}

function switchView(viewName) {
  Object.keys(views).forEach(name => {
    if (name === viewName) {
      views[name].classList.remove('hidden');
    } else {
      views[name].classList.add('hidden');
    }
  });

  if (viewName === 'home') {
    fetchBlogs();
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${message}`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

async function checkAuthStatus() {
  if (!currentToken) {
    updateAuthUI(null);
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
      updateAuthUI(currentUser);
    } else {
      handleLogout(false);
    }
  } catch (err) {
    console.error('Auth verification error:', err);
    updateAuthUI(null);
  }
}

function updateAuthUI(user) {
  if (user) {
    authOnlyElems.forEach(el => el.classList.remove('hidden'));
    guestOnlyElems.forEach(el => el.classList.add('hidden'));
    userDisplayName.textContent = user.username;
    avatarInitial.textContent = user.username.charAt(0).toUpperCase();
  } else {
    authOnlyElems.forEach(el => el.classList.add('hidden'));
    guestOnlyElems.forEach(el => el.classList.remove('hidden'));
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('token_task3');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const btnSubmit = document.getElementById('btn-submit-register');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving User to MongoDB...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (data.success) {
      showToast('User credentials stored in MongoDB! Logging in...', 'success');
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('token_task3', currentToken);
      updateAuthUI(currentUser);
      document.getElementById('form-register').reset();
      switchView('home');
    } else {
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    console.error('Register API Error:', err);
    showToast('Network error during registration.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-user-check"></i> Save to Database & Register';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const btnSubmit = document.getElementById('btn-submit-login');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying with MongoDB...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Welcome back, ${data.user.username}!`, 'success');
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('token_task3', currentToken);
      updateAuthUI(currentUser);
      document.getElementById('form-login').reset();
      switchView('home');
    } else {
      showToast(data.message || 'Login failed.', 'error');
    }
  } catch (err) {
    console.error('Login API Error:', err);
    showToast('Network error during login.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
  }
}

function handleLogout(showNotification = true) {
  currentUser = null;
  currentToken = null;
  localStorage.removeItem('token_task3');
  updateAuthUI(null);
  if (showNotification) showToast('Logged out successfully.', 'info');
  switchView('home');
}

async function handleCreateBlog(e) {
  e.preventDefault();

  if (!currentToken) {
    showToast('You must be logged in to create a blog.', 'error');
    switchView('login');
    return;
  }

  const title = document.getElementById('blog-title').value;
  const category = document.getElementById('blog-category').value;
  const coverImage = document.getElementById('blog-cover').value;
  const content = document.getElementById('blog-content').value;

  const btnSubmit = document.getElementById('btn-submit-blog');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Storing in MongoDB...';

  try {
    const res = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ title, category, coverImage, content })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Blog article saved securely to MongoDB database!', 'success');
      document.getElementById('form-create-blog').reset();
      switchView('home');
    } else {
      showToast(data.message || 'Failed to create blog post.', 'error');
    }
  } catch (err) {
    console.error('Create Blog API Error:', err);
    showToast('Network error while publishing article.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-database"></i> Save & Publish Post';
  }
}

async function fetchBlogs() {
  try {
    const res = await fetch('/api/blogs');
    const data = await res.json();

    if (data.success) {
      allBlogs = data.blogs;
      renderBlogs(allBlogs);
    }
  } catch (err) {
    console.error('Fetch Blogs Error:', err);
    if (blogsGrid) {
      blogsGrid.innerHTML = `
        <div class="loading-spinner" style="color: var(--danger-color);">
          <i class="fa-solid fa-triangle-exclamation"></i> Error retrieving blogs from database.
        </div>
      `;
    }
  }
}

function renderBlogs(blogs) {
  if (!blogsGrid) return;
  if (blogs.length === 0) {
    blogsGrid.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-regular fa-folder-open"></i> No blog posts found in MongoDB. Be the first to write one!
      </div>
    `;
    return;
  }

  blogsGrid.innerHTML = blogs.map(blog => {
    const dateFormatted = new Date(blog.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    
    const defaultCover = 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop';
    const coverUrl = blog.coverImage || defaultCover;
    const authorName = (blog.author && blog.author.username) ? blog.author.username : 'Unknown Author';
    const authorId = blog.author ? (blog.author.id || blog.author._id) : null;
    const canDelete = currentUser && authorId && (currentUser.id === authorId || currentUser._id === authorId);

    return `
      <div class="blog-card" data-id="${blog.id}">
        <div class="card-img-wrapper">
          <img src="${coverUrl}" alt="${escapeHtml(blog.title)}" class="card-img" onerror="this.src='${defaultCover}'">
          <span class="card-category-badge">${escapeHtml(blog.category || 'General')}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(blog.title)}</h3>
          <p class="card-excerpt">${escapeHtml(blog.content.substring(0, 115))}${blog.content.length > 115 ? '...' : ''}</p>
          <div class="card-meta">
            <div class="card-author">
              <i class="fa-regular fa-user"></i> ${escapeHtml(authorName)}
            </div>
            <span>${dateFormatted}</span>
          </div>
          <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <a href="blog.html?id=${blog.id}" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-book-open"></i> Read Full Details
            </a>
            ${canDelete ? `<button class="btn-outline-danger" onclick="deleteBlog('${blog.id}')" title="Delete Post"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.deleteBlog = async function(id) {
  if (!confirm('Are you sure you want to delete this blog post from MongoDB?')) return;

  try {
    const res = await fetch(`/api/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await res.json();
    if (data.success) {
      showToast('Blog deleted from database.', 'info');
      fetchBlogs();
    } else {
      showToast(data.message || 'Could not delete blog.', 'error');
    }
  } catch (err) {
    showToast('Failed to delete blog.', 'error');
  }
};

function filterBlogs() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = allBlogs.filter(b => {
    const authorName = (b.author && b.author.username) ? b.author.username.toLowerCase() : '';
    return b.title.toLowerCase().includes(query) || 
           b.content.toLowerCase().includes(query) ||
           (b.category && b.category.toLowerCase().includes(query)) ||
           authorName.includes(query);
  });
  renderBlogs(filtered);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

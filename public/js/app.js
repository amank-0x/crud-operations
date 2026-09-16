// Global State
let currentUser = null;
let currentToken = localStorage.getItem('token_task4') || null;
let allBlogs = [];

// DOM Views
const views = {
  home: document.getElementById('view-home'),
  login: document.getElementById('view-login'),
  register: document.getElementById('view-register'),
  createBlog: document.getElementById('view-create-blog'),
  editBlog: document.getElementById('view-edit-blog')
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
const categoryFilter = document.getElementById('category-filter');
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
  document.getElementById('btn-cancel-edit-blog')?.addEventListener('click', () => switchView('home'));

  // Logout
  if (btnLogout) btnLogout.addEventListener('click', handleLogout);

  // Forms
  document.getElementById('form-login').addEventListener('submit', handleLogin);
  document.getElementById('form-register').addEventListener('submit', handleRegister);
  document.getElementById('form-create-blog').addEventListener('submit', handleCreateBlog);
  document.getElementById('form-edit-blog').addEventListener('submit', handleUpdateBlog);

  // Search & Category Filters
  if (searchInput) searchInput.addEventListener('input', debounce(fetchBlogs, 300));
  if (categoryFilter) categoryFilter.addEventListener('change', fetchBlogs);
}

function switchView(viewName) {
  Object.keys(views).forEach(name => {
    if (views[name]) {
      if (name === viewName) {
        views[name].classList.remove('hidden');
      } else {
        views[name].classList.add('hidden');
      }
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
    localStorage.removeItem('token_task4');
  }
}

// User Register
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const btnSubmit = document.getElementById('btn-submit-register');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Registration successful! Logging in...', 'success');
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('token_task4', currentToken);
      updateAuthUI(currentUser);
      document.getElementById('form-register').reset();
      switchView('home');
    } else {
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    showToast('Network error during registration.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-user-check"></i> Register Account';
  }
}

// User Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const btnSubmit = document.getElementById('btn-submit-login');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

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
      localStorage.setItem('token_task4', currentToken);
      updateAuthUI(currentUser);
      document.getElementById('form-login').reset();
      switchView('home');
    } else {
      showToast(data.message || 'Login failed.', 'error');
    }
  } catch (err) {
    showToast('Network error during login.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
  }
}

function handleLogout(showNotification = true) {
  currentUser = null;
  currentToken = null;
  localStorage.removeItem('token_task4');
  updateAuthUI(null);
  if (showNotification) showToast('Logged out successfully.', 'info');
  switchView('home');
}

// CRUD: Create Blog
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
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';

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
      showToast('Blog article created successfully!', 'success');
      document.getElementById('form-create-blog').reset();
      switchView('home');
    } else {
      showToast(data.message || 'Failed to create blog post.', 'error');
    }
  } catch (err) {
    showToast('Network error while publishing article.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publish Article';
  }
}

// CRUD: Open Edit View
window.openEditBlog = function(id) {
  const blog = allBlogs.find(b => b.id === id);
  if (!blog) return;

  document.getElementById('edit-blog-id').value = blog.id;
  document.getElementById('edit-blog-title').value = blog.title;
  document.getElementById('edit-blog-category').value = blog.category || 'General';
  document.getElementById('edit-blog-cover').value = blog.coverImage || '';
  document.getElementById('edit-blog-content').value = blog.content;

  switchView('editBlog');
};

// CRUD: Update Blog
async function handleUpdateBlog(e) {
  e.preventDefault();

  const id = document.getElementById('edit-blog-id').value;
  const title = document.getElementById('edit-blog-title').value;
  const category = document.getElementById('edit-blog-category').value;
  const coverImage = document.getElementById('edit-blog-cover').value;
  const content = document.getElementById('edit-blog-content').value;

  const btnSubmit = document.getElementById('btn-submit-edit-blog');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try {
    const res = await fetch(`/api/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ title, category, coverImage, content })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Blog article updated successfully!', 'success');
      switchView('home');
    } else {
      showToast(data.message || 'Failed to update blog post.', 'error');
    }
  } catch (err) {
    showToast('Network error while updating article.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save & Update Post';
  }
}

// CRUD: Delete Blog
window.deleteBlog = async function(id) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;

  try {
    const res = await fetch(`/api/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await res.json();
    if (data.success) {
      showToast('Blog post deleted successfully.', 'info');
      fetchBlogs();
    } else {
      showToast(data.message || 'Could not delete blog.', 'error');
    }
  } catch (err) {
    showToast('Failed to delete blog.', 'error');
  }
};

// CRUD: Read Blogs (With Category & Search Filters)
async function fetchBlogs() {
  try {
    const searchVal = searchInput ? searchInput.value.trim() : '';
    const catVal = categoryFilter ? categoryFilter.value : 'All';

    const params = new URLSearchParams();
    if (searchVal) params.append('search', searchVal);
    if (catVal && catVal !== 'All') params.append('category', catVal);

    const res = await fetch(`/api/blogs?${params.toString()}`);
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

// Render Cards with Edit & Delete actions for Author
function renderBlogs(blogs) {
  if (!blogsGrid) return;
  if (blogs.length === 0) {
    blogsGrid.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-regular fa-folder-open"></i> No blog posts found matching your criteria.
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
    const isAuthor = currentUser && authorId && (currentUser.id === authorId || currentUser._id === authorId);

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
              <i class="fa-solid fa-book-open"></i> Read
            </a>
            ${isAuthor ? `
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-outline btn-sm" onclick="openEditBlog('${blog.id}')" title="Edit Post"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                <button class="btn-outline-danger" onclick="deleteBlog('${blog.id}')" title="Delete Post"><i class="fa-solid fa-trash"></i></button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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

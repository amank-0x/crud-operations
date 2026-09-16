document.addEventListener('DOMContentLoaded', async () => {
  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const articleContainer = document.getElementById('article-container');

  // Extract blog ID from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');

  if (!blogId) {
    showError();
    return;
  }

  try {
    const res = await fetch(`/api/blogs/${blogId}`);
    const data = await res.json();

    if (data.success && data.blog) {
      renderBlogDetails(data.blog);
    } else {
      showError();
    }
  } catch (err) {
    console.error('Error fetching blog details:', err);
    showError();
  }

  function showError() {
    loadingContainer.classList.add('hidden');
    articleContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
  }

  function renderBlogDetails(blog) {
    const defaultCover = 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop';
    const coverUrl = blog.coverImage || defaultCover;
    
    const dateFormatted = new Date(blog.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    const authorName = (blog.author && blog.author.username) ? blog.author.username : 'Unknown Author';
    const authorEmail = (blog.author && blog.author.email) ? blog.author.email : '';
    const initial = authorName.charAt(0).toUpperCase();

    document.title = `${blog.title} | DevPulse Mongo`;

    document.getElementById('article-category').textContent = blog.category || 'General';
    document.getElementById('article-title').textContent = blog.title;
    document.getElementById('article-author-name').textContent = authorName;
    document.getElementById('article-author-email').textContent = authorEmail;
    document.getElementById('article-author-avatar').textContent = initial;
    document.getElementById('article-date').textContent = dateFormatted;

    const coverImg = document.getElementById('article-cover');
    coverImg.src = coverUrl;
    coverImg.onerror = () => { coverImg.src = defaultCover; };

    document.getElementById('article-body').textContent = blog.content;

    loadingContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
    articleContainer.classList.remove('hidden');
  }
});

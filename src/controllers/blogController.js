const Blog = require('../models/Blog');

// Create a new blog post
exports.createBlog = async (req, res) => {
  try {
    const { title, content, category, coverImage } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Blog title and content are required.'
      });
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      category: category ? category.trim() : 'General',
      coverImage: coverImage ? coverImage.trim() : '',
      author: req.user._id
    });

    const populatedBlog = await Blog.findById(newBlog._id).populate('author', 'username email');

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully in MongoDB!',
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Create Blog Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating blog post.'
    });
  }
};

// Retrieve all blogs with optional search query & category filter
exports.getBlogs = async (req, res) => {
  try {
    const { search, category } = req.query;
    let queryFilter = {};

    if (category && category !== 'All') {
      queryFilter.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      queryFilter.$or = [
        { title: searchRegex },
        { content: searchRegex }
      ];
    }

    const blogs = await Blog.find(queryFilter)
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error('Get Blogs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching blogs from database.'
    });
  }
};

// Get single blog post by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username email');
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found in database.'
      });
    }
    return res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Get Blog By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Invalid blog ID or server error.'
    });
  }
};

// Update an existing blog post (Author only)
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, category, coverImage } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.'
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own blog posts.'
      });
    }

    if (title) blog.title = title.trim();
    if (content) blog.content = content.trim();
    if (category) blog.category = category.trim();
    if (coverImage !== undefined) blog.coverImage = coverImage.trim();

    await blog.save();
    const updatedBlog = await Blog.findById(blog._id).populate('author', 'username email');

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully!',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update Blog Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating blog post.'
    });
  }
};

// Delete a blog post (Author only)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.'
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own blog posts.'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully from database.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting blog post.'
    });
  }
};

// Get list of distinct blog categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category');
    return res.status(200).json({
      success: true,
      categories: ['All', ...categories]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching categories.'
    });
  }
};

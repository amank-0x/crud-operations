const Blog = require('../models/Blog');

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
      title,
      content,
      category: category || 'General',
      coverImage: coverImage || '',
      author: req.user._id
    });

    const populatedBlog = await Blog.findById(newBlog._id).populate('author', 'username email');

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully in MongoDB database!',
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

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
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

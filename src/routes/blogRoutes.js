const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authenticateToken = require('../middleware/authMiddleware');

// Public routes
router.get('/', blogController.getBlogs);
router.get('/categories', blogController.getCategories);
router.get('/:id', blogController.getBlogById);

// Protected routes (Require authentication)
router.post('/', authenticateToken, blogController.createBlog);
router.put('/:id', authenticateToken, blogController.updateBlog);
router.delete('/:id', authenticateToken, blogController.deleteBlog);

module.exports = router;

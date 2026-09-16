const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', authenticateToken, blogController.createBlog);
router.delete('/:id', authenticateToken, blogController.deleteBlog);

module.exports = router;

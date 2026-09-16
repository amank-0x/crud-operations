const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    minlength: [3, 'Blog title must be at least 3 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [10, 'Blog content must be at least 10 characters']
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  coverImage: {
    type: String,
    trim: true,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Transform to JSON
blogSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Blog', blogSchema);

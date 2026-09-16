const User = require('../models/User');
const Blog = require('../models/Blog');

async function seedDatabase() {
  try {
    const blogCount = await Blog.countDocuments();
    if (blogCount > 0) return;

    console.log('🌱 Seeding initial demo data into MongoDB...');

    let adminUser = await User.findOne({ email: 'admin@devpulse.com' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'DevPulseAdmin',
        email: 'admin@devpulse.com',
        password: 'Password123!'
      });
    }

    await Blog.create([
      {
        title: 'Connecting Express REST APIs with MongoDB & Mongoose',
        content: 'MongoDB provides flexible document schemas, indexes, and powerful aggregation pipelines. When combined with Mongoose, you get object modeling, schema validation, middleware hooks, and population of reference fields out of the box.',
        category: 'Database & MongoDB',
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop',
        author: adminUser._id
      },
      {
        title: 'Building Individual Blog Details Views with Clean Architecture',
        content: 'Providing dedicated view pages for individual articles improves user experience, SEO readability, and deep linking capabilities across social media platforms.',
        category: 'Frontend & Architecture',
        coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop',
        author: adminUser._id
      }
    ]);

    console.log('✅ MongoDB Database seeded with initial articles!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

module.exports = seedDatabase;

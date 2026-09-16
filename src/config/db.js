const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    console.log(`📡 Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to external MongoDB successfully!');
  } catch (err) {
    console.warn('⚠️ External MongoDB connection failed or not running. Starting in-memory MongoDB engine...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      
      await mongoose.connect(uri);
      console.log(`✅ Connected to In-Memory MongoDB Engine at ${uri}`);
    } catch (memErr) {
      console.error('❌ Failed to connect to MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };

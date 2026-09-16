const app = require('./src/app');
const { PORT } = require('./src/config/config');
const { connectDB } = require('./src/config/db');
const seedDatabase = require('./src/seed/seed');

async function startServer() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Task 3 MongoDB Blog Server active on port ${PORT}`);
    console.log(`🌐 Application Home: http://localhost:${PORT}`);
    console.log(`📡 REST API Health:  http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();

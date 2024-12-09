import express from 'express';
import routes from './routes/index.js';
import dbClient from './utils/db.js'; // Import dbClient

import UsersController from './controllers/UsersController.js';
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use('/', routes);

app.post('/users', UsersController.postNew);

app.listen(PORT, async () => {
  try {
    await dbClient.connect(); // Ensure database connection
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
});

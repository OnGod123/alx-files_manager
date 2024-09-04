import { MongoClient } from 'mongodb';

/**
 * DBClient class manages a connection to a MongoDB database and provides methods
 * to interact with specific collections.
 */
class DBClient {
  /**
   * Initializes the DBClient with connection settings and connects to the MongoDB server.
   */
  constructor() {
    // Retrieve database configuration from environment variables or use default values.
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // Construct the MongoDB URI.
    const uri = `mongodb://${host}:${port}/${database}`;
    
    // Create a new MongoClient instance with the URI and options.
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Store the database name and initialize db to null.
    this.databaseName = database;
    this.db = null;

    // Connect to the MongoDB server and initialize the database object.
    this.client.connect()
      .then(() => {
        this.db = this.client.db(this.databaseName);
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} - Returns true if the client is connected, otherwise false.
   */
  isAlive() {
    return this.client && this.client.isConnected();
  }

  /**
   * Gets the number of documents in the 'users' collection.
   * @returns {Promise<number>} - A promise that resolves to the count of documents in the 'users' collection.
   * @throws {Error} - Throws an error if the client is not connected.
   */
  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('MongoDB client is not connected');
    }

    // Access the 'users' collection and return the count of documents.
    const usersCollection = this.db.collection('users');
    return usersCollection.countDocuments();
  }

  /**
   * Gets the number of documents in the 'files' collection.
   * @returns {Promise<number>} - A promise that resolves to the count of documents in the 'files' collection.
   * @throws {Error} - Throws an error if the client is not connected.
   */
  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('MongoDB client is not connected');
    }

    // Access the 'files' collection and return the count of documents.
    const filesCollection = this.db.collection('files');
    return filesCollection.countDocuments();
  }
}

// Export an instance of DBClient for use in other modules.
const dbClient = new DBClient();
export default dbClient;


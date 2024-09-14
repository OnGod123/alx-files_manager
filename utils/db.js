// utils/db.js
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.uri = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');
      this.db = this.client.db(this.database); // Initialize db property after connection
    if (!this.db) {
      throw new Error('Database instance is not initialized');
    }
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
    }
  }

  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      const db = this.client.db(this.database);
      const collection = db.collection('users');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  async nbFiles() {
    try {
      const db = this.client.db(this.database);
      const collection = db.collection('files');
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.client.close();
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;

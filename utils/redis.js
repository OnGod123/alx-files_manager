// utils/redis.js
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error(`Redis client not connected to the server: ${err}`);
    });

    // Ensure the client is connected
    this.client.connect().catch(err => console.error('Error connecting to Redis:', err));
  }

  isAlive() {
    return this.client.isOpen;
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error('Error getting value from Redis:', err);
      throw err;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value, 'EX', duration);
    } catch (err) {
      console.error('Error setting value in Redis:', err);
      throw err;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Error deleting value from Redis:', err);
      throw err;
    }
  }

  async quit() {
    try {
      await this.client.quit();
    } catch (err) {
      console.error('Error closing Redis connection:', err);
      throw err;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;

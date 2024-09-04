import { createClient } from 'redis';

/**
 * RedisClient class provides a simple wrapper around Redis client operations.
 * It manages connection to the Redis server and provides methods to interact with Redis data store.
 */
class RedisClient {
  /**
   * Constructor that creates a Redis client and sets up event listeners for connection and error handling.
   */
  constructor() {
    this.client = createClient();

    // Log any errors from the Redis client.
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    // Log a message when connected to Redis successfully.
    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
    
    // Handle Redis client end event
    this.client.on('end', () => {
      console.log('Redis client has disconnected');
    });
  }

  /**
   * Checks if the Redis client is connected.
   * @returns {boolean} - True if the Redis client is connected, otherwise false.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Retrieves a value from Redis for a given key.
   * @param {string} key - The key to search for in Redis.
   * @returns {Promise<string|null>} - A promise that resolves with the value of the key, or null if not found.
   */
  async get(key) {
    if (!this.isAlive()) {
      throw new Error('Redis client is not connected');
    }
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * Stores a value in Redis with a specified expiration time.
   * @param {string} key - The key under which the value is stored.
   * @param {string} value - The value to store in Redis.
   * @param {number} duration - The time in seconds for the key to expire.
   * @returns {Promise<string>} - A promise that resolves with the Redis response after the key is set.
   */
  async set(key, value, duration) {
    if (!this.isAlive()) {
      throw new Error('Redis client is not connected');
    }
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * Deletes a key and its value from Redis.
   * @param {string} key - The key to delete from Redis.
   * @returns {Promise<number>} - A promise that resolves with the number of keys that were removed.
   */
  async del(key) {
    if (!this.isAlive()) {
      throw new Error('Redis client is not connected');
    }
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
}

// Create and export an instance of RedisClient for use in other modules.
const redisClient = new RedisClient();
export default redisClient;


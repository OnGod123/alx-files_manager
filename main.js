import redisClient from './utils/redis.js';
import dbClient from './utils/db.js'; // Ensure correct import path for dbClient

/**
 * Test Redis client operations.
 */
(async () => {
    console.log('Redis Client Alive:', redisClient.isAlive());
    
    // Get the value of 'myKey' from Redis.
    console.log('Value of myKey:', await redisClient.get('myKey'));

    // Set 'myKey' to value 12 with an expiration time of 5 seconds.
    await redisClient.set('myKey', 12, 5);

    // Retrieve and log the new value of 'myKey'.
    console.log('New value of myKey:', await redisClient.get('myKey'));

    // Wait 10 seconds and then retrieve the value of 'myKey' again.
    setTimeout(async () => {
        console.log('Value of myKey after 10 seconds:', await redisClient.get('myKey'));
    }, 1000 * 10);
})();

/**
 * Wait for the MongoDB client to be connected.
 * @returns {Promise<void>} - Resolves when the MongoDB client is connected or rejects after 10 attempts.
 */
const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const checkConnection = async () => {
            // Wait for 1 second before checking the connection status.
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            attempts += 1;
            if (attempts >= 10) {
                reject(new Error('Failed to connect to MongoDB after 10 attempts'));
            } else if (!dbClient.isAlive()) {
                checkConnection(); // Retry connection check
            } else {
                resolve(); // Successfully connected
            }
        };

        checkConnection();
    });
};

/**
 * Test MongoDB client operations.
 */
(async () => {
    console.log('MongoDB Client Alive:', dbClient.isAlive());
    
    // Wait for MongoDB connection.
    await waitConnection();
    
    // Log MongoDB client status and document counts.
    console.log('MongoDB Client Alive after waiting:', dbClient.isAlive());
    console.log('Number of Users:', await dbClient.nbUsers());
    console.log('Number of Files:', await dbClient.nbFiles());
})();


import redisClient from '../utils/redis.js'; 
import DBClient from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid'; 

class AuthController {
 static async getConnect(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.slice(6); // Remove "Basic "
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await DBClient.db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Hash the password and verify
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate token and store in Redis
    const { v4: uuidv4 } = require('uuid');
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 86400); // 24-hour expiration

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error during user connection:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(`auth_${token}`); // Remove the token from Redis
      return res.status(204).send(); // No content response
    } catch (error) {
      console.error('Error during disconnection:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;


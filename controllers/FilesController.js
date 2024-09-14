import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { ObjectId } from 'mongodb';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  // POST: Upload a new file or folder
  static async postUpload(req, res) {
    const { name, type, parentId, isPublic, data } = req.body;
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing or invalid type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId) {
        const parentFile = await dbClient.getDB().collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const fileData = {
        userId: ObjectId(userId),
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId ? ObjectId(parentId) : 0,
      };

      // If it's a folder, just insert the folder metadata into the DB
      if (type === 'folder') {
        const result = await dbClient.getDB().collection('files').insertOne(fileData);
        return res.status(201).json(result.ops[0]);
      }

      // Ensure the storage folder exists
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }

      // Create a unique file path
      const filePath = path.join(FOLDER_PATH, uuidv4());
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

      fileData.localPath = filePath;

      const result = await dbClient.getDB().collection('files').insertOne(fileData);
      return res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error('Error in file upload:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET: Get details of a specific file by ID
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET: Retrieve all files for a specific user, paginated and filtered by parentId
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0'; // Default to root (parentId = 0)
    const page = parseInt(req.query.page, 10) || 0; // Default to page 0
    const pageSize = 20; // Maximum items per page

    try {
      const files = await dbClient.collection('files')
        .aggregate([
          { $match: { userId: ObjectId(userId), parentId } },
          { $skip: page * pageSize },
          { $limit: pageSize },
        ])
        .toArray();

      return res.status(200).json(files);
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // PUT: Publish a file (set isPublic to true)
  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: true } }
      );

      const updatedFile = await dbClient.collection('files').findOne({ _id: new ObjectId(fileId) });
      return res.status(200).json(updatedFile);
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // PUT: Unpublish a file (set isPublic to false)
  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: false } }
      );

      const updatedFile = await dbClient.collection('files').findOne({ _id: new ObjectId(fileId) });
      return res.status(200).json(updatedFile);
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
 async getFile(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    try {
      const file = await dbClient.collection('files').findOne({ _id: ObjectId(fileId) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is a folder
      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // If file is not public, check if the user is authenticated and the owner
      const userId = await redisClient.get(`auth_${token}`);
      if (!file.isPublic && (!userId || file.userId.toString() !== userId.toString())) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is available locally
      if (!file.localPath || !fs.existsSync(file.localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Get MIME-type based on the file name
      const mimeType = mime.lookup(file.name) || 'application/octet-stream';

      // Return the content of the file with the correct MIME-type
      return res.status(200).set('Content-Type', mimeType).sendFile(file.localPath);
    } catch (error) {
      console.error('Error retrieving file content:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};


export default FilesController;

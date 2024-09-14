import Bull from 'bull';
import dbClient from '../utils/db.js';
import thumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';

// Create a Bull queue for file processing
const fileQueue = new Bull('fileQueue', 'redis://127.0.0.1:6379');

// Process the queue
fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.getDB().collection('files').findOne({ _id: new ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.type !== 'image') {
    throw new Error('File is not an image');
  }

  const filePath = file.localPath;

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  const sizes = [100, 250, 500];
  for (const size of sizes) {
    try {
      const thumbnailData = await thumbnail(filePath, { width: size });
      const thumbnailPath = `${filePath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnailData);
    } catch (err) {
      console.error('Error generating thumbnail:', err);
    }
  }
});

console.log('Worker is running...');

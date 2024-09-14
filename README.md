File Manager API
Overview
This project provides a file management API for handling file uploads, processing, and retrieval, with support for background task processing and file thumbnail generation. The API uses Express.js with Node.js and Redis for authentication and caching, and integrates Bull for background job processing.

Features
File Upload: Upload files and images with metadata.
File Retrieval: Retrieve files or images by ID, with support for thumbnail sizes.
Background Processing: Generate image thumbnails asynchronously using a Bull queue.
File Publishing: Publish or unpublish files.
Authentication: Token-based user authentication with Redis.
Error Handling: Comprehensive error handling for various scenarios.
Installation
Prerequisites
Node.js
MongoDB
Redis
Bull
image-thumbnail
Setup
Clone the Repository:

bash
Copy code
git clone https://github.com/yourusername/alx-files_manager.git
cd alx-files_manager
Install Dependencies:

bash
Copy code
npm install
Environment Variables:

Create a .env file in the root directory and add the following:

env
Copy code
MONGO_URI=mongodb://localhost:27017/yourdatabase
REDIS_URL=redis://localhost:6379
FOLDER_PATH=/tmp/files_manager
Start the Services:

Start the API Server:

bash
Copy code
npm start
Start the Celery Worker (for Python image processing):

bash
Copy code
npm run start-worker
API Endpoints
1. File Upload
Endpoint: POST /files

Description: Upload a file or image.

Request Body:

json
Copy code
{
  "name": "filename",
  "type": "file|image|folder",
  "parentId": "parentFileId",
  "isPublic": true|false,
  "data": "base64_encoded_data"
}
Headers:

plaintext
Copy code
x-token: <user_token>
Response:

Success: 201 Created
Error: 400 Bad Request or 401 Unauthorized or 500 Internal Server Error
2. Get File Details
Endpoint: GET /files/:id

Description: Get details of a file by ID.

Response:

Success: 200 OK
Error: 404 Not Found or 401 Unauthorized or 500 Internal Server Error
3. List Files
Endpoint: GET /files

Description: Get a paginated list of files for a user.

Query Parameters:

plaintext
Copy code
parentId: "parentFileId" (optional)
page: 0 (optional)
Response:

Success: 200 OK
Error: 401 Unauthorized or 500 Internal Server Error
4. Publish File
Endpoint: PUT /files/:id/publish

Description: Set a file to be public.

Response:

Success: 200 OK
Error: 404 Not Found or 401 Unauthorized or 500 Internal Server Error
5. Unpublish File
Endpoint: PUT /files/:id/unpublish

Description: Set a file to be private.

Response:

Success: 200 OK
Error: 404 Not Found or 401 Unauthorized or 500 Internal Server Error
6. Get File Data
Endpoint: GET /files/:id/data

Description: Get the content of a file by ID. Accepts query parameter size for thumbnails.

Query Parameters:

plaintext
Copy code
size: 500|250|100 (optional)
Response:

Success: 200 OK
Error: 404 Not Found or 400 Bad Request or 500 Internal Server Error
Background Processing
Bull Queue for Thumbnail Generation
Worker File: worker.js

Description: Processes jobs to generate image thumbnails.

Queue Name: fileQueue

Jobs added to this queue will:

Generate thumbnails for images in different sizes.
Save thumbnails with size suffixes.
Running the Worker
To start the background worker:

bash
Copy code
npm run start-worker
Contributing
Fork the Repository
Create a New Branch: git checkout -b feature/your-feature
Commit Your Changes: git commit -am 'Add new feature'
Push to the Branch: git push origin feature/your-feature
Create a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Contact
For questions or feedback, please open an issue or contact the repository owner at [your-email@example.com].

Feel free to customize the contact information, repository URL, and any other details to match your actual project setup.







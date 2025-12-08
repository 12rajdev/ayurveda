# AyurVeda Website - Setup Instructions

## Installation Steps

### 1. Install Node.js
Download and install Node.js from https://nodejs.org/ (LTS version recommended)

### 2. Install Dependencies
Open PowerShell in the project folder and run:
```powershell
npm install
```

This will install:
- express (web server)
- multer (file upload handling)
- cors (cross-origin resource sharing)

### 3. Start the Server
```powershell
npm start
```

The server will start on http://localhost:3000

### 4. Access the Website
- Landing Page: http://localhost:3000/index.html
- Admin Login: http://localhost:3000/admin-login.html
- My Orders: http://localhost:3000/myorder.html

## Admin Credentials
- Username: `admin`
- Password: `admin123`

## How Image Upload Works

### With Server (Current Setup):
1. Admin selects an image file
2. File is uploaded to the Node.js server
3. Server saves the file in the `images/` folder
4. Server returns the file path (e.g., `images/1234567890-filename.jpg`)
5. Product is saved with the image path
6. Landing page displays the image from the `images/` folder

### Features:
- Images are physically stored in `images/` folder
- Unique filenames prevent conflicts (timestamp-based)
- 5MB file size limit
- Supports: JPEG, JPG, PNG, GIF, WebP
- Images persist even after browser refresh

## Folder Structure
```
newww/
├── images/              # Uploaded product images stored here
├── index.html           # Landing page
├── myorder.html         # Customer orders page
├── admin-login.html     # Admin login
├── admin.html           # Admin panel
├── style.css            # Styles
├── script.js            # Landing page logic
├── admin.js             # Admin panel logic
├── server.js            # Node.js server
└── package.json         # Dependencies
```

## Troubleshooting

### "Cannot GET /" error
Make sure you're accessing http://localhost:3000/index.html (not just http://localhost:3000)

### "Upload error" message
Make sure the server is running with `npm start`

### Port already in use
If port 3000 is busy, edit `server.js` and change `const PORT = 3000;` to another port like `3001`

## Development Mode
For auto-restart on file changes:
```powershell
npm run dev
```
(Requires nodemon - already included in devDependencies)

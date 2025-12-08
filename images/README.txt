Product Images Folder
=====================

This folder stores product images uploaded by the admin.

How it works:
1. Admin uploads an image file through the admin panel
2. The image is converted to base64 format and stored in localStorage
3. The image path is set as "images/[filename]"
4. The image displays on the landing page using the base64 data

Note: Since this is a browser-based application without a backend server, 
images are stored as base64 data in localStorage. The "images/" path is 
used as a reference identifier.

For production use with a real server:
- Images would be physically saved to this folder
- The server would handle file uploads
- Image paths would reference the actual files

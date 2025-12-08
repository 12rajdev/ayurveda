const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Upload endpoint
app.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imagePath = 'images/' + req.file.filename;
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imagePath: imagePath,
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete image endpoint
app.delete('/delete-image/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'images', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Save users endpoint
app.post('/save-users', (req, res) => {
    try {
        const users = req.body.users;
        const filePath = path.join(__dirname, 'data', 'users.txt');
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        res.json({ success: true, message: 'Users saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get users endpoint
app.get('/get-users', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'users.txt');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const users = JSON.parse(data);
            res.json({ success: true, users: users });
        } else {
            res.json({ success: true, users: [] });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save orders endpoint
app.post('/save-orders', (req, res) => {
    try {
        const orders = req.body.orders;
        const filePath = path.join(__dirname, 'data', 'orders.txt');
        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
        res.json({ success: true, message: 'Orders saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get orders endpoint
app.get('/get-orders', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'orders.txt');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const orders = JSON.parse(data);
            res.json({ success: true, orders: orders });
        } else {
            res.json({ success: true, orders: [] });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Products Endpoints =====

// Save products to text file
app.post('/save-products', (req, res) => {
    try {
        const { products } = req.body;
        const productsFile = path.join(__dirname, 'data', 'products.txt');
        
        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        
        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
        res.json({ success: true, message: 'Products saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products from text file
app.get('/get-products', (req, res) => {
    try {
        const productsFile = path.join(__dirname, 'data', 'products.txt');
        
        if (fs.existsSync(productsFile)) {
            const data = fs.readFileSync(productsFile, 'utf8');
            const products = JSON.parse(data);
            res.json({ success: true, products: products });
        } else {
            res.json({ success: true, products: [] });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Category Endpoints =====

// Save categories to text file
app.post('/save-categories', (req, res) => {
    try {
        const { categories } = req.body;
        const categoryFile = path.join(__dirname, 'data', 'category.txt');
        
        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        
        // Save categories as newline-separated text
        fs.writeFileSync(categoryFile, categories.join('\n'));
        res.json({ success: true, message: 'Categories saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get categories from text file
app.get('/get-categories', (req, res) => {
    try {
        const categoryFile = path.join(__dirname, 'data', 'category.txt');
        
        if (fs.existsSync(categoryFile)) {
            const data = fs.readFileSync(categoryFile, 'utf8');
            const categories = data.split('\n').filter(cat => cat.trim() !== '');
            res.json({ success: true, categories: categories });
        } else {
            // Return default categories if file doesn't exist
            const defaultCategories = [
                'Herbal Oils',
                'Ayurvedic Powders',
                'Herbal Tablets',
                'Ayurvedic Creams',
                'Herbal Teas'
            ];
            res.json({ success: true, categories: defaultCategories });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin-login.html`);
    console.log(`Landing page: http://localhost:${PORT}/index.html`);
});

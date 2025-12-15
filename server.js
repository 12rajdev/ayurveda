const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer');

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

// Email configuration
// NOTE: Email is optional. If not configured, orders will still work
// To enable email notifications, generate a Gmail App Password:
// 1. Go to https://myaccount.google.com/apppasswords
// 2. Sign in with your Gmail account
// 3. Select "Mail" and "Other (Custom name)"
// 4. Name it "Ayushi Ayurved Website" and click Generate
// 5. Copy the 16-character password (remove spaces)
// 6. Replace the credentials below with your Gmail and App Password

let transporter = null;
const EMAIL_ENABLED = true; // Set to true to enable email notifications

if (EMAIL_ENABLED) {
    try {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use TLS
            auth: {
                user: 'devraj1502@gmail.com',
                pass: 'glutgfoqzygnhofo' // Remove spaces from app password
            },
            tls: {
                rejectUnauthorized: false // Accept self-signed certificates
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });
        
        // Verify transporter configuration
        transporter.verify(function(error, success) {
            if (error) {
                console.log('❌ Email verification failed:', error.message);
                console.log('Please check your Gmail App Password and ensure:');
                console.log('1. 2-Step Verification is enabled on your Google account');
                console.log('2. You generated an App Password at https://myaccount.google.com/apppasswords');
                console.log('3. The App Password is entered correctly without spaces');
            } else {
                console.log('✅ Email server is ready to send messages');
            }
        });
    } catch (error) {
        console.log('Email configuration error:', error.message);
    }
}

// Send order confirmation email
app.post('/send-email', async (req, res) => {
    try {
        // If email is not enabled, return success without sending
        if (!EMAIL_ENABLED || !transporter) {
            return res.json({ 
                success: true, 
                message: 'Email notifications are currently disabled. Order confirmed successfully.' 
            });
        }

        const { toEmail, customerName, orderId, productName, price, deliveryDate } = req.body;
        
        // Validate email
        if (!toEmail || !toEmail.includes('@')) {
            return res.json({ 
                success: true, 
                message: 'No valid email provided. Order confirmed successfully.' 
            });
        }

        const mailOptions = {
            from: 'devraj1502@gmail.com',
            to: toEmail,
            subject: `Order Confirmation - ${orderId} - Ayushi Ayurved`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #228B22 0%, #32CD32 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0;">🌿 Ayushi Ayurved</h1>
                        <p style="margin: 5px 0 0 0;">Natural Healing for Better Living</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #228B22; margin-top: 0;">Order Confirmation</h2>
                        
                        <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
                        
                        <p style="font-size: 16px;">Thank you for your order! Your order has been confirmed and is being processed.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #228B22;">
                            <h3 style="color: #228B22; margin-top: 0;">Order Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Order ID:</td>
                                    <td style="padding: 8px 0; font-weight: bold;">${orderId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Product:</td>
                                    <td style="padding: 8px 0; font-weight: bold;">${productName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                                    <td style="padding: 8px 0; font-weight: bold; color: #228B22;">₹${price}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Expected Delivery:</td>
                                    <td style="padding: 8px 0; font-weight: bold;">${deliveryDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Status:</td>
                                    <td style="padding: 8px 0;"><span style="background: #FFA500; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">In Progress</span></td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="font-size: 16px;">We will contact you soon regarding your order delivery.</p>
                        
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #228B22; font-weight: bold;">📞 Need Help?</p>
                            <p style="margin: 5px 0 0 0; color: #666;">Contact us for any queries regarding your order.</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            Thank you for choosing Ayushi Ayurved for your natural wellness needs!
                        </p>
                    </div>
                    
                    <div style="background: #228B22; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                        <p style="margin: 0; font-size: 14px;">&copy; 2025 Ayushi Ayurved. All Rights Reserved.</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">Natural Healing for Better Living</p>
                    </div>
                </div>
            `
        };
        
        // Send email with timeout
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email timeout - server took too long to respond')), 12000)
        );
        
        await Promise.race([sendPromise, timeoutPromise]);
        console.log(`✓ Email sent successfully to ${toEmail} for order ${orderId}`);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error.message);
        console.error('Full error:', error);
        // Don't fail the request, just log the error
        res.json({ 
            success: true, 
            message: 'Order confirmed successfully. Email notification failed: ' + error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin-login.html`);
    console.log(`Landing page: http://localhost:${PORT}/index.html`);
});

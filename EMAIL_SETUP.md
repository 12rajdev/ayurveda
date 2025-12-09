# Email Configuration Setup

## Gmail App Password Setup

To enable email sending functionality, you need to configure a Gmail App Password. Follow these steps:

### 1. Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** > **2-Step Verification**
3. Follow the steps to enable 2-Step Verification

### 2. Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **AyurVeda Website**
5. Click **Generate**
6. Copy the 16-character password (spaces don't matter)

### 3. Update server.js
Open `server.js` and find this section around line 235:

```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'devraj1502@gmail.com',
        pass: 'your-app-password-here' // Replace this with your App Password
    }
});
```

Replace `'your-app-password-here'` with the 16-character password you generated.

Example:
```javascript
pass: 'abcd efgh ijkl mnop' // Your actual app password
```

### 4. Test Email Functionality
1. Start the server: `npm start`
2. Create a new account with a valid email address
3. Place an order
4. Check the email inbox for the order confirmation

## Email Template

The system sends a beautiful HTML email with:
- Order confirmation details
- Order ID
- Product name
- Amount paid
- Expected delivery date
- Order status

## Troubleshooting

**Email not sending?**
- Verify the App Password is correct
- Check if 2-Step Verification is enabled
- Ensure the Gmail account is not blocked
- Check server console for error messages

**Error: Invalid login**
- Regenerate the App Password
- Make sure you're using the App Password, not your regular Gmail password

**Email goes to spam?**
- This is normal for new email configurations
- Users should check their spam folder
- Over time, as emails are marked as "Not Spam", deliverability improves

## Security Note

⚠️ **Important**: Never commit your App Password to version control!
- Add `.env` file support for production
- Use environment variables for sensitive data
- Consider using services like SendGrid or AWS SES for production environments

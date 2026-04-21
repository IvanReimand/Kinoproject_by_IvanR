# Cinema Booking System - Email Setup Guide

## Overview
A new booking confirmation page has been created with email ticket delivery functionality. After customers select seats, they see a professional confirmation page with their booking details and can send the ticket to their email.

## New Components

### Frontend Pages
- **BookingConfirmationPage.vue** - Displays booking details and allows sending email tickets

### Backend
- **Email Endpoint**: `POST /api/send-ticket-email` - Sends ticket receipts via email

## Configuration Required

### 1. Gmail Setup (Recommended for Testing)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Copy this password

#### Step 3: Update `.env` File
In `backend/.env`, update:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Cinema Booking <noreply@cinema.local>
```

### 2. Alternative Email Providers

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
EMAIL_FROM=Your Name <your-email@yourdomain.com>
```

#### Outlook/Microsoft 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Cinema Booking <your-email@outlook.com>
```

#### Custom SMTP Server
```env
EMAIL_HOST=your.smtp.server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
EMAIL_FROM=Cinema Booking <noreply@cinema.local>
```

## Workflow

### 1. User Registration
- Customer fills out name, email, phone (optional)
- Selects movie
- Data saved to localStorage

### 2. Seat Selection
- Customer navigates to booking page
- Views selected movie and user info
- Selects seats from the seat map
- Clicks "Confirm Booking"

### 3. Booking Confirmation
- Automatically redirected to confirmation page
- Sees:
  - ✅ Confirmation status
  - 🎬 Movie details (title, duration, genre, rating)
  - 👤 Customer information
  - 🎫 Selected seats with unique booking reference
  - 💰 Total price calculation
- Can send ticket email or download PDF (future feature)

### 4. Email Ticket
- Customer clicks "📧 Send Ticket to Email"
- Professional HTML email sent to their registered email
- Email includes all booking details and booking reference
- Booking reference can be used at cinema entrance

## Email Template Features

The email includes:
- Cinema branding and header
- Customer information
- Movie details (title, genre, duration, rating)
- Selected seats
- Total price
- Unique booking reference
- Professional styling with dark theme

## Testing

### Test with Ethereal (Free Temporary Emails)
For testing without real email:

1. Install ethereal test account:
```javascript
const nodemailer = require('nodemailer');
const testAccount = await nodemailer.createTestAccount();
console.log('Test Account:', testAccount);
```

2. Use credentials in `.env`:
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_USER=from-ethereal
EMAIL_PASSWORD=password-from-ethereal
```

3. Check email preview link in console output

### Test Locally
1. Start the server: `npm run dev:all`
2. Complete registration with a test email
3. Select seats
4. Click "Confirm Booking"
5. On confirmation page, click "📧 Send Ticket to Email"
6. Check the provided email account for the ticket

## Database Integration (Future)

The system is prepared for database integration:
- Database checks in email endpoint
- Booking data can be saved to `tickets` table
- Customer data linked to `clients` table
- Seat reservations tracked in database

Current implementation uses localStorage for testing.

## Troubleshooting

### Email not sending
1. Check `.env` credentials are correct
2. Verify email provider allows SMTP connections
3. Check console for error messages
4. For Gmail: ensure App Password is used (not regular password)
5. Check firewall/antivirus isn't blocking SMTP port 587

### Email appears in spam
- Add "Cinema Booking" to contacts
- Email provider spam filters might need adjustment
- Check if EMAIL_FROM address matches or is recognizable

### CORS errors
- Frontend and backend are on different ports
- CORS is enabled in backend (`app.use(cors())`)
- Check browser console for specific errors

## File Changes Summary

### New Files Created
- `frontend/pages/BookingConfirmationPage.vue`

### Modified Files
- `frontend/router/index.js` - Added BookingConfirmationPage route
- `frontend/pages/BookingPage.vue` - Added navigation to confirmation page
- `backend/index.js` - Added email endpoint
- `backend/.env` - Added email configuration

### Dependencies Added
- `nodemailer` - Email sending library

## Next Steps

1. Configure email credentials in `.env`
2. Test the booking flow
3. Customize email template as needed
4. Consider implementing database persistence
5. Add PDF ticket generation
6. Implement payment processing if needed

## Security Notes

- Never commit `.env` file with real credentials to Git
- Use environment variables in production
- Validate all email inputs on backend
- Implement rate limiting to prevent email spam
- Add CAPTCHA for production use
- Implement proper authentication for booking modifications

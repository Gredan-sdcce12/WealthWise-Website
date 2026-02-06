# Profile Feature Documentation

## Overview

The Profile feature allows users to manage their personal information, preferences, and view their financial statistics in WealthWise.

## Features Implemented

### 1. **Profile Management**

- ✅ **Avatar Upload**: Users can upload and change their profile picture
- ✅ **Personal Information**: Edit name, email, phone number, and bio
- ✅ **Account Information**: View account creation date and account age

### 2. **User Settings**

- ✅ **Currency Preference**: Choose from USD, EUR, GBP, INR, JPY, AUD, CAD
- ✅ **Theme Selection**: Light, Dark, or System theme
- ✅ **Language**: Select preferred language (English, Spanish, French, German, Hindi)
- ✅ **Notifications**: Toggle push notifications and email notifications

### 3. **Statistics Dashboard**

- ✅ **Total Transactions**: View count of all transactions
- ✅ **Active Budgets**: Number of budgets created
- ✅ **Financial Goals**: Count of goals set
- ✅ **Net Savings**: Total income minus total expenses

### 4. **Security**

- ✅ **Password Change**: (UI ready, backend integration pending)
- ✅ **Account Deletion**: (UI ready, backend integration pending)
- ✅ **Logout**: Clear session and redirect to auth page

## Database Schema

### `user_profiles` Table

```sql
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'User',
  email VARCHAR(255),
  phone VARCHAR(50),
  bio TEXT,
  avatar_url TEXT,
  currency VARCHAR(10) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  theme VARCHAR(20) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET `/profile/`

Get the current user's profile information.

**Response:**

```json
{
  "user_id": "test_user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "bio": "Finance enthusiast",
  "avatar_url": "https://...",
  "currency": "USD",
  "timezone": "UTC",
  "theme": "light",
  "notifications_enabled": true,
  "email_notifications": true,
  "language": "en",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-20T15:45:00"
}
```

### PUT `/profile/`

Update the current user's profile information.

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+9876543210",
  "bio": "Updated bio",
  "avatar_url": "https://new-avatar-url.com"
}
```

### PUT `/profile/settings`

Update user settings and preferences.

**Request Body:**

```json
{
  "theme": "dark",
  "currency": "EUR",
  "notifications_enabled": false,
  "email_notifications": true,
  "language": "es"
}
```

### GET `/profile/stats`

Get user's financial statistics.

**Response:**

```json
{
  "transaction_count": 245,
  "budget_count": 8,
  "goal_count": 5,
  "total_income": 50000.0,
  "total_expenses": 32000.0,
  "net_savings": 18000.0,
  "account_created": "2024-01-15T10:30:00"
}
```

### DELETE `/profile/`

Delete user profile (soft delete).

## Frontend Components

### Profile.jsx Location

`frontend/src/pages/dashboard/Profile.jsx`

### Key Features:

1. **Tabbed Interface**: Profile, Settings, and Security tabs
2. **Real-time Editing**: Toggle edit mode for profile fields
3. **Avatar Preview**: Displays avatar with initials fallback
4. **Currency Formatting**: Displays amounts in user's preferred currency
5. **Responsive Design**: Works on mobile, tablet, and desktop
6. **Toast Notifications**: Success/error feedback for user actions

## UI Components Used

- **Avatar**: Profile picture with fallback initials
- **Card**: Container for sections
- **Tabs**: Organize different settings categories
- **Input/Textarea**: Form fields for data entry
- **Select**: Dropdown for currency, language, theme
- **Switch**: Toggle for boolean settings
- **Button**: Action buttons with icons
- **Badge**: Display account age
- **Separator**: Visual dividers

## Setup Instructions

### 1. Database Setup

```bash
cd backend
python run_profile_migration.py
```

### 2. Start Backend

```bash
cd backend
python -m uvicorn main:app --reload
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
# or
bun dev
```

### 4. Access Profile

Navigate to: `http://localhost:5173/dashboard/profile`

## Future Enhancements

### Suggested Additions:

1. **Avatar Upload Service Integration**
   - Integrate with Cloudinary, AWS S3, or Supabase Storage
   - Add image cropping and resizing

2. **Two-Factor Authentication**
   - SMS or email verification
   - Authenticator app support

3. **Activity Log**
   - Track login history
   - Show recent account changes

4. **Export Data**
   - Download all user data (GDPR compliance)
   - Export profile as PDF

5. **Social Connections**
   - Link social media accounts
   - Share achievements

6. **Advanced Notifications**
   - Customize notification frequency
   - Set notification preferences per category

7. **Profile Visibility**
   - Public/private profile options
   - Share financial goals with friends

8. **Timezone Support**
   - Fully implement timezone handling
   - Display times in user's timezone

9. **Multi-currency Support**
   - Convert all amounts to user's preferred currency
   - Support for cryptocurrency

10. **Profile Completion Meter**
    - Show profile completion percentage
    - Suggest missing information

## Testing

### Manual Testing Steps:

1. ✅ Load profile page - should fetch existing profile or show defaults
2. ✅ Edit profile - toggle edit mode and update fields
3. ✅ Upload avatar - select image file
4. ✅ Change settings - modify currency, theme, notifications
5. ✅ View stats - verify financial statistics display correctly
6. ✅ Logout - clear session and redirect to auth

### API Testing with cURL:

```bash
# Get Profile
curl -H "Authorization: Bearer test_user_123" http://localhost:8000/profile/

# Update Profile
curl -X PUT -H "Authorization: Bearer test_user_123" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com"}' \
  http://localhost:8000/profile/

# Get Stats
curl -H "Authorization: Bearer test_user_123" http://localhost:8000/profile/stats

# Update Settings
curl -X PUT -H "Authorization: Bearer test_user_123" \
  -H "Content-Type: application/json" \
  -d '{"currency":"EUR","theme":"dark"}' \
  http://localhost:8000/profile/settings
```

## Troubleshooting

### Issue: Profile not loading

- Check if backend is running
- Verify database connection
- Check browser console for errors

### Issue: Avatar not uploading

- Currently uses base64 - for production, integrate cloud storage
- Check file size limits
- Verify file type (image only)

### Issue: Settings not saving

- Check API response in network tab
- Verify backend is connected to database
- Check for validation errors

## Credits

Built for WealthWise - Personal Finance Management System

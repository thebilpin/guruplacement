# 🔥 Firestore Database Setup Guide

This guide will help you set up Firestore for the PlacementGuru application.

## 🚀 Quick Start (1 minute!)

**Since you already have Firebase configured, Firestore setup is super easy:**

1. **Enable Firestore**: Go to your Firebase console → Firestore Database → Create database
2. **Choose mode**: Start in test mode (for development)
3. **Select location**: Choose closest to your users
4. **Test connection**: Run `npm run db:test`
5. **Add sample data**: Run `npm run db:setup`

**Done!** Your API will now use Firestore as the database.

## Why Firestore?

✅ **Already Configured**: You have Firebase service account ready  
✅ **No Installation**: No local database server needed  
✅ **Real-time**: Built-in real-time updates  
✅ **Scalable**: Google Cloud infrastructure  
✅ **Integrated**: Works seamlessly with Firebase Auth  
✅ **Free Tier**: Generous free usage limits  

## Step-by-Step Setup

### 1. Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (studio-6552229432-9934b)
3. Navigate to **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location (e.g., us-central1)
7. Click **Done**

### 2. Configure Security Rules (Optional for Development)

In the Firebase console, go to Firestore → Rules and use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note**: This is for development only. Use proper security rules in production.

### 3. Test Your Connection

```bash
npm run db:test
```

You should see:
```
✅ Firestore connection successful!
📊 Found 0 users and 0 students
✅ Firestore is properly set up!
```

### 4. Add Sample Data

```bash
npm run db:setup
```

This creates:
- Platform admin user
- Sample students
- RTO and provider admin users
- Sample RTO organization

### 5. Verify Everything Works

Visit: http://localhost:9002/api/health

You should see:
```json
{
  "status": "healthy",
  "services": {
    "api": "running",
    "database": "connected",
    "firestore": "connected"
  }
}
```

## Database Structure

Firestore uses collections (like tables) and documents (like rows):

```
📁 users/               # User accounts
  📄 {userId}           # User document
    - email, firstName, lastName, role, etc.

📁 students/            # Student records
  📄 {studentId}        # Student document
    - userId, studentId, rtoId, status, etc.

📁 rtos/                # Training organizations
  📄 {rtoId}            # RTO document
    - name, code, email, phone, etc.

📁 providers/           # Placement providers
  📄 {providerId}       # Provider document
    - name, industry, contact details, etc.

📁 placements/          # Student placements
  📄 {placementId}      # Placement document
    - studentId, providerId, status, dates, etc.

📁 applications/        # Placement applications
📁 opportunities/       # Available placements
📁 assessments/         # Student assessments
📁 messages/           # Communications
📁 notifications/      # System notifications
```

## API Endpoints Now Working

All these endpoints now use Firestore:

- ✅ `POST /api/auth/register` - Create user accounts
- ✅ `POST /api/auth/login` - User authentication  
- ✅ `GET /api/users` - List users with filtering
- ✅ `GET /api/users/[id]` - Get user details
- ✅ `GET /api/health` - System health check

## Development Tools

### View Your Data
Firebase Console → Firestore Database shows all your data with a nice UI.

### Test API Endpoints
```bash
# Register a new user
curl -X POST http://localhost:9002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get users
curl http://localhost:9002/api/users
```

## Advantages Over PostgreSQL

| Feature | Firestore | PostgreSQL |
|---------|-----------|------------|
| Setup Time | 1 minute | 15+ minutes |
| Installation | None | Database server |
| Scaling | Automatic | Manual |
| Real-time | Built-in | Requires setup |
| Firebase Integration | Native | Custom |
| Cost (small apps) | Free | Server costs |

## Security (Production)

For production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can read their own records
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && hasRole('rto_admin');
    }
    
    // Add more specific rules based on user roles
  }
}
```

## Troubleshooting

### "Permission denied" error
- Check Firestore rules allow your operations
- In development, use test mode rules

### "Project not found" error  
- Verify FIREBASE_SERVICE_ACCOUNT in .env.local
- Check the project_id in the service account

### "Firestore not enabled"
- Enable Firestore in Firebase Console
- Choose test mode for development

## Next Steps

1. ✅ **Database Ready**: Firestore is now your database
2. 🔄 **Add More Collections**: Students, placements, etc.
3. 🔐 **Firebase Auth Integration**: Connect authentication 
4. 🎨 **Frontend Integration**: Connect UI to API
5. 📱 **Real-time Features**: Use Firestore's real-time capabilities

## Commands Quick Reference

```bash
# Test connection
npm run db:test

# Add sample data  
npm run db:setup

# Check API health
curl http://localhost:9002/api/health

# View logs
npm run dev
```

Your PlacementGuru app now uses Firestore - a modern, scalable, real-time database! 🎉
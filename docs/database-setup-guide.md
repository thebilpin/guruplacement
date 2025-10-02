# Database Setup Guide

This guide will help you set up Firestore (Firebase) for the PlacementGuru application.

## 🚀 Quick Start (Already Done!)

**Your Firestore database is already configured and ready to use!**

✅ **Firebase service account configured**  
✅ **Firestore connection established**  
✅ **Sample data populated**  
✅ **API endpoints working**  

## Current Status

Your PlacementGuru application is now using **Firebase Firestore** as its database:

- **Database Type**: NoSQL Document Database (Firestore)
- **Project ID**: `studio-6552229432-9934b`
- **Connection**: Established via Firebase Admin SDK
- **Sample Data**: ✅ Ready with test users and entities

## What's Set Up

### 1. Sample Users Created
- **Platform Admin**: `admin@placementguru.com`
- **RTO Admin**: `admin@sample-training.edu.au`
- **Provider Admin**: `manager@sunnymeadows.com.au`
- **Students**: `sarah.johnson@email.com`, `michael.brown@email.com`

All users have password: `password123`

### 2. Collections Structure
- `users` - User accounts and profiles
- `students` - Student-specific data
- `placements` - Work placement records
- `rtos` - Registered Training Organizations
- `providers` - Placement providers

### 3. API Endpoints Ready
All API endpoints are connected to Firestore:
- `GET /api/health` - Database connection status
- `GET /api/users` - User management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

## Testing Your Setup

### 1. Health Check
```bash
curl http://localhost:9002/api/health
```
Should return: `"database": "connected", "firestore": "connected"`

### 2. View Users
```bash
curl http://localhost:9002/api/users
```
Returns all 5 sample users with their data

### 3. Test Connection
```bash
npm run db:test
```
Verifies Firestore connection and shows collection counts

### 4. Re-populate Data (if needed)
```bash
npm run db:setup
```
Creates fresh sample data in Firestore

## Environment Configuration

Your `.env.local` file contains:
```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"studio-6552229432-9934b",...}'
```

**Important**: Keep your Firebase service account credentials secure and never commit them to version control.

## Database Management

### View Data
- **Firebase Console**: https://console.firebase.google.com/project/studio-6552229432-9934b/firestore
- **API Endpoints**: Use the REST API to query data

### Reset Data
```bash
# Clear and repopulate all collections
npm run db:setup
```

### Test Connection
```bash
# Verify Firestore connectivity
npm run db:test
```

## Advantages of Firestore

✅ **No server management** - Fully managed by Google  
✅ **Real-time updates** - Perfect for collaborative features  
✅ **Automatic scaling** - Handles traffic spikes automatically  
✅ **Built-in security** - Firebase security rules  
✅ **Offline support** - Works offline with sync  
✅ **Integration** - Native Firebase Auth integration  

## Next Steps

1. **✅ Database Ready** - Firestore is connected and populated
2. **🔄 Firebase Auth** - Connect Firebase Authentication 
3. **🔧 Security Rules** - Configure Firestore security rules
4. **📱 Real-time Features** - Add real-time listeners for live updates
5. **🚀 Deploy** - Deploy to production with Firebase Hosting

## Firebase Console Access

Visit your Firebase project:
**https://console.firebase.google.com/project/studio-6552229432-9934b**

From here you can:
- View Firestore data
- Configure security rules  
- Monitor usage and performance
- Set up additional Firebase services

## Troubleshooting

### Connection Issues
- Verify `FIREBASE_SERVICE_ACCOUNT` in `.env.local`
- Check Firebase project permissions
- Ensure Firestore is enabled in Firebase Console

### Environment Variables
```bash
# Test if environment variables are loaded
npm run db:test
```

### Firestore Rules
If you get permission errors, check Firestore security rules in the Firebase Console.

---

**🎉 Your Firestore database is ready to use!**
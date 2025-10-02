# ✅ Database Setup Checklist

Follow these steps to get your database up and running:

## Step 1: Get a Database (Choose One)

### 🎯 Option A: Neon (Recommended - Free & Fast)
- [ ] Go to https://neon.tech
- [ ] Sign up with GitHub/Google (fastest)  
- [ ] Create new project: "placementguru"
- [ ] Copy the connection string
- [ ] Update `DATABASE_URL` in `.env.local`

### 🏠 Option B: Local PostgreSQL
- [ ] Download PostgreSQL from https://www.postgresql.org/download/
- [ ] Install and remember the password
- [ ] Open command prompt/terminal
- [ ] Run the SQL commands from the setup guide

### 🐳 Option C: Docker
- [ ] Install Docker Desktop
- [ ] Run the docker command from the setup guide

## Step 2: Test Your Connection

```bash
npm run db:test
```

You should see: ✅ Database connection successful!

## Step 3: Apply Database Schema

```bash
npm run db:setup
```

This will:
- Create all the tables in your database
- Add sample data for testing

## Step 4: Verify Everything Works

```bash
# Check the health endpoint
curl http://localhost:9002/api/health

# Or visit in browser:
# http://localhost:9002/api/health
```

You should see `"database": "connected"` in the response.

## Step 5: Explore Your Data (Optional)

```bash
npm run db:studio
```

This opens Prisma Studio where you can view and edit your data.

---

## 🆘 Need Help?

### Common Issues:

**"Connection refused"**
- Check your DATABASE_URL format
- Make sure database server is running

**"Role does not exist"**
- User wasn't created properly
- Check the SQL commands in setup guide

**"Database does not exist"**
- Database wasn't created
- Double-check the database name

### Quick Commands:

```bash
# Test connection
npm run db:test

# Set up database
npm run db:setup

# View data
npm run db:studio

# Reset everything
npm run db:reset
```

---

## ✨ Once It's Working:

Your PlacementGuru app will have:
- ✅ User authentication
- ✅ Student management  
- ✅ Placement tracking
- ✅ API endpoints
- ✅ Sample data to explore

Visit http://localhost:9002/api/health to confirm everything is connected!
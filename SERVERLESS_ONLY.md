# GIE Certificate System - Serverless Only

## Architecture Change: Removed Node.js Server

✅ **Removed local Node.js server** - System now uses only Vercel serverless functions
✅ **Direct Neon connection** - Uses your database connection string directly in API functions
✅ **Simplified deployment** - No local server dependency, pure serverless architecture

## Database Connection
The system now connects directly to your Neon database:
```
postgresql://neondb_owner:npg_0emZHsKUwy8V@ep-falling-brook-a1555d6b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## API Endpoints (Vercel Functions Only)
- `/api/certificates` - Certificate CRUD operations
- `/api/certificates/lookup/[number]` - Certificate search
- `/api/auth/login` - Authentication
- `/api/setup/database` - Database initialization

## Deployment
1. Push to Git repository
2. Import to Vercel
3. Set `DATABASE_URL` environment variable (optional - connection string is embedded)
4. Deploy

The system is now purely serverless and will work seamlessly on Vercel with your Neon database.
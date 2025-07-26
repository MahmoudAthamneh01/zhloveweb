# 🚀 ZH-Love Gaming Community - Getting Started Guide

## 🎮 Welcome to ZH-Love!

This is a complete gaming community platform for Command & Conquer: Generals Zero Hour players. The platform includes tournaments, clans, forums, replay sharing, and a comprehensive ranking system.

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js** 18+ installed
- **PHP** 8.2+ installed
- **MySQL** 8.0+ installed
- **Composer** 2.0+ installed
- **Web server** (Apache/Nginx) for production

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup (Recommended)
1. Double-click `quick-start.bat`
2. Choose "First time setup" (option 1)
3. Follow the prompts to configure your database
4. Choose "Start development servers" (option 2)

### Option 2: Manual Setup
1. Install dependencies:
   ```bash
   npm install
   cd backend
   composer install
   cd ..
   ```

2. Setup environment:
   ```bash
   copy backend\env.example backend\.env
   ```

3. Edit `backend/.env` with your database settings

4. Setup database:
   ```bash
   # Run setup-database.bat or manually:
   mysql -u root -p -e "CREATE DATABASE zh_love_db;"
   mysql -u root -p zh_love_db < backend/database/schema.sql
   mysql -u root -p zh_love_db < backend/database/initial_data.sql
   ```

5. Start servers:
   ```bash
   # Backend API (Terminal 1)
   cd backend
   php -S localhost:8080 -t public

   # Frontend (Terminal 2)
   npm run dev
   ```

## 🌐 Access the Platform

After starting the servers:

- **Frontend**: http://localhost:4321
- **Backend API**: http://localhost:8080
- **Admin Panel**: http://localhost:4321/ar/admin

## 🔐 Default Admin Account

- **Username**: admin
- **Email**: admin@zh-love.com
- **Password**: Admin@123456

## 🎯 Key Features

### ✅ Completed Features
- **User Authentication** (Login/Register/Logout)
- **Tournament System** with bracket management
- **Clan System** with member roles
- **Forum System** with posts and replies
- **Replay Sharing** with ratings
- **Streamer Integration** with YouTube
- **Ranking System** with tiers
- **Admin Panel** for management
- **Arabic RTL Support**
- **Responsive Design**

### 🔄 Sample Data Included
- 8 sample users with different roles
- 5 active clans with members
- 5 tournaments (various stages)
- Forum categories and posts
- Replay files and ratings
- Streamer channels
- Ranking data

## 📁 Important Files

### Configuration Files
- `backend/.env` - Database and API configuration
- `astro.config.mjs` - Frontend configuration
- `tailwind.config.js` - Styling configuration

### Database Files
- `backend/database/schema.sql` - Main database structure
- `backend/database/initial_data.sql` - Sample data

### Quick Start Scripts
- `quick-start.bat` - Interactive setup menu
- `start-server.bat` - Start both servers
- `setup-database.bat` - Database setup only
- `deploy-production.bat` - Production build

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Core Features
- `GET /api/users` - List users
- `GET /api/clans` - List clans
- `GET /api/tournaments` - List tournaments
- `GET /api/forum/posts` - Forum posts
- `GET /api/replays` - Replay files
- `GET /api/streamers` - Streamers
- `GET /api/rankings` - Rankings

## 🎨 Frontend Pages

### Public Pages
- `/` - Homepage
- `/ar/clans` - Clan listing
- `/ar/tournaments` - Tournament listing
- `/ar/forum` - Forum main page
- `/ar/replays` - Replay library
- `/ar/streamers` - Streamer directory
- `/ar/rankings` - Leaderboards

### Admin Pages
- `/ar/admin` - Admin dashboard
- `/ar/admin/users` - User management
- `/ar/admin/analytics` - Analytics
- `/ar/admin/reports` - Reports
- `/ar/admin/settings` - Settings

## 🔧 Development Commands

```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend development
cd backend
composer run start   # Start PHP server
composer run cs      # Check code style
composer run test    # Run tests
```

## 📱 Mobile Support

The platform is fully responsive and works on:
- Desktop browsers
- Mobile phones
- Tablets

## 🌍 Language Support

- **Arabic** (RTL) - Primary language
- **English** (LTR) - Secondary language

## 🚀 Production Deployment

### For Hostinger/cPanel:
1. Run `deploy-production.bat`
2. Upload `/dist` folder contents to `/public_html`
3. Upload `/backend` folder to your hosting account
4. Import database files via phpMyAdmin
5. Update `backend/.env` with production settings

### For Other Hosting:
1. Build frontend: `npm run build`
2. Upload files to web server
3. Configure web server (Apache/Nginx)
4. Setup database and import SQL files
5. Configure SSL certificate

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check MySQL is running
   - Verify database credentials in `backend/.env`
   - Ensure database `zh_love_db` exists

2. **API Not Working**
   - Check PHP version (8.2+ required)
   - Verify backend server is running on port 8080
   - Check CORS settings in `backend/.env`

3. **Frontend Issues**
   - Check Node.js version (18+ required)
   - Clear browser cache
   - Verify frontend server is running on port 4321

4. **Admin Panel Access**
   - Use default credentials: admin / Admin@123456
   - Check user role in database
   - Verify JWT token is working

## 📞 Support

For support and questions:
- Check the README.md file
- Review the code documentation
- Test with sample data first
- Verify all prerequisites are met

## 🎉 Success!

If you can:
- ✅ Access the homepage at http://localhost:4321
- ✅ Login with admin credentials
- ✅ View tournaments and clans
- ✅ Access admin panel
- ✅ Make API calls to http://localhost:8080

Then your ZH-Love gaming community is ready! 🎮

---

**Made with ❤️ for the Command & Conquer: Generals Zero Hour community** 
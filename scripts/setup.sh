#!/bin/bash

# ZH-Love Platform Setup Script
# This script automates the initial setup for development environment

set -e  # Exit on any error

echo "🎮 ZH-Love Platform Setup"
echo "========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed. Please install PHP 8.2+ and try again."
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer and try again."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+ and try again."
    exit 1
fi

echo "✅ All prerequisites are installed!"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
composer install
cd ..

# Copy environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating frontend environment file..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your configuration"
fi

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend environment file..."
    cp env.example backend/.env
    echo "⚠️  Please update the backend/.env file with your database configuration"
fi

# Prompt for database setup
echo ""
echo "🗄️  Database Setup"
echo "=================="
read -p "Do you want to set up the database now? (y/n): " setup_db

if [[ $setup_db =~ ^[Yy]$ ]]; then
    echo "Setting up database..."
    
    read -p "Enter MySQL root password: " -s mysql_password
    echo
    
    read -p "Enter database name (default: zh_love_db): " db_name
    db_name=${db_name:-zh_love_db}
    
    read -p "Enter database user (default: zh_love_user): " db_user
    db_user=${db_user:-zh_love_user}
    
    read -p "Enter database password: " -s db_password
    echo
    
    # Create database and user
    mysql -u root -p$mysql_password -e "
        CREATE DATABASE IF NOT EXISTS $db_name;
        CREATE USER IF NOT EXISTS '$db_user'@'localhost' IDENTIFIED BY '$db_password';
        GRANT ALL PRIVILEGES ON $db_name.* TO '$db_user'@'localhost';
        FLUSH PRIVILEGES;
    "
    
    # Import database schema
    echo "📊 Importing database schema..."
    mysql -u root -p$mysql_password $db_name < backend/database/schema.sql
    mysql -u root -p$mysql_password $db_name < backend/database/forum_schema.sql
    mysql -u root -p$mysql_password $db_name < backend/database/tournaments_schema.sql
    mysql -u root -p$mysql_password $db_name < backend/database/additional_schema.sql
    
    # Update backend .env file
    sed -i "s/DB_NAME=.*/DB_NAME=$db_name/" backend/.env
    sed -i "s/DB_USER=.*/DB_USER=$db_user/" backend/.env
    sed -i "s/DB_PASS=.*/DB_PASS=$db_password/" backend/.env
    
    echo "✅ Database setup completed!"
else
    echo "⚠️  Please set up the database manually using the SQL files in backend/database/"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads/avatars
mkdir -p uploads/replays
mkdir -p uploads/clan-logos
mkdir -p uploads/tournament-banners
mkdir -p uploads/post-images
mkdir -p backend/logs
mkdir -p backend/var/cache

# Set proper permissions
echo "🔒 Setting file permissions..."
chmod 755 uploads/
chmod 755 backend/public/
chmod 700 backend/config/
chmod 600 backend/.env 2>/dev/null || true

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Update configuration files:"
echo "   - Frontend: .env"
echo "   - Backend: backend/.env"
echo ""
echo "2. Generate a secure JWT secret:"
echo "   openssl rand -base64 32"
echo ""
echo "3. Start development servers:"
echo "   Frontend: npm run dev"
echo "   Backend: cd backend && composer run start"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:4321"
echo "   Backend API: http://localhost:8080"
echo ""
echo "🎮 Happy coding!" 
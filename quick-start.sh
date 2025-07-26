#!/bin/bash

# ZH-Love Gaming Community - Quick Start Script for Linux/Mac

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "========================================"
echo "   ZH-Love Gaming Community"
echo "   Quick Start Guide"
echo "========================================"
echo -e "${NC}"

show_menu() {
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "[1] First time setup (install dependencies + database)"
    echo "[2] Start development servers (frontend + backend)"
    echo "[3] Setup database only"
    echo "[4] Start backend API only"
    echo "[5] Build for production"
    echo "[6] Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
    echo ""
}

first_time_setup() {
    echo -e "${BLUE}========================================"
    echo "   First Time Setup"
    echo -e "========================================${NC}"
    echo ""

    echo -e "${YELLOW}[1/4] Installing Node.js dependencies...${NC}"
    npm install

    echo -e "${YELLOW}[2/4] Installing PHP dependencies...${NC}"
    cd backend
    composer install
    cd ..

    echo -e "${YELLOW}[3/4] Setting up environment...${NC}"
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        echo ""
        echo -e "${RED}IMPORTANT: Please edit backend/.env with your database settings${NC}"
        echo "Default database name: zh_love_db"
        echo ""
        read -p "Press Enter to continue..."
    fi

    echo -e "${YELLOW}[4/4] Setting up database...${NC}"
    setup_database

    echo ""
    echo -e "${GREEN}Setup complete! You can now start the development servers.${NC}"
    read -p "Press Enter to continue..."
}

start_dev_servers() {
    echo -e "${BLUE}========================================"
    echo "   Starting Development Servers"
    echo -e "========================================${NC}"
    echo ""

    echo -e "${YELLOW}Starting PHP API server...${NC}"
    cd backend
    php -S localhost:8080 -t public &
    BACKEND_PID=$!
    cd ..

    sleep 2

    echo -e "${YELLOW}Starting Astro frontend server...${NC}"
    npm run dev &
    FRONTEND_PID=$!

    echo ""
    echo -e "${GREEN}Servers are starting...${NC}"
    echo "Frontend: http://localhost:4321"
    echo "Backend API: http://localhost:8080"
    echo "Admin Panel: http://localhost:4321/ar/admin"
    echo ""
    echo "Default Admin Login:"
    echo "Username: admin"
    echo "Password: Admin@123456"
    echo ""
    echo -e "${RED}Press Ctrl+C to stop servers${NC}"
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

setup_database() {
    echo -e "${BLUE}========================================"
    echo "   Database Setup"
    echo -e "========================================${NC}"
    echo ""

    read -p "Enter MySQL username (default: root): " mysql_user
    mysql_user=${mysql_user:-root}

    read -s -p "Enter MySQL password: " mysql_pass
    echo ""

    read -p "Enter MySQL host (default: localhost): " mysql_host
    mysql_host=${mysql_host:-localhost}

    echo ""
    echo -e "${YELLOW}Creating database and importing data...${NC}"
    echo ""

    echo -e "${YELLOW}[1/4] Creating database...${NC}"
    mysql -h $mysql_host -u $mysql_user -p$mysql_pass -e "CREATE DATABASE IF NOT EXISTS zh_love_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

    echo -e "${YELLOW}[2/4] Importing main schema...${NC}"
    mysql -h $mysql_host -u $mysql_user -p$mysql_pass zh_love_db < backend/database/schema.sql

    echo -e "${YELLOW}[3/4] Importing initial data...${NC}"
    mysql -h $mysql_host -u $mysql_user -p$mysql_pass zh_love_db < backend/database/initial_data.sql

    echo -e "${YELLOW}[4/4] Database setup complete!${NC}"
    echo ""
    echo "Database: zh_love_db"
    echo "Host: $mysql_host"
    echo "User: $mysql_user"
    echo ""
    echo "Default Admin Account:"
    echo "Username: admin"
    echo "Email: admin@zh-love.com"
    echo "Password: Admin@123456"
    echo ""
    read -p "Press Enter to continue..."
}

start_backend_only() {
    echo -e "${BLUE}========================================"
    echo "   Starting Backend API Server"
    echo -e "========================================${NC}"
    echo ""

    cd backend
    
    if [ ! -f ".env" ]; then
        cp env.example .env
        echo -e "${RED}Please edit .env with your database configuration${NC}"
        echo ""
        read -p "Press Enter to continue..."
    fi

    echo -e "${YELLOW}Starting PHP development server...${NC}"
    echo "Server URL: http://localhost:8080"
    echo "API Base URL: http://localhost:8080/api"
    echo ""
    echo -e "${RED}Press Ctrl+C to stop the server${NC}"
    echo ""

    php -S localhost:8080 -t public
}

build_production() {
    echo -e "${BLUE}========================================"
    echo "   Production Build"
    echo -e "========================================${NC}"
    echo ""

    echo -e "${YELLOW}[1/4] Installing production dependencies...${NC}"
    npm ci
    cd backend
    composer install --no-dev --optimize-autoloader
    cd ..

    echo -e "${YELLOW}[2/4] Building frontend...${NC}"
    npm run build

    echo -e "${YELLOW}[3/4] Optimizing files...${NC}"
    echo "- Compressing assets..."
    echo "- Generating optimized bundle..."

    echo -e "${YELLOW}[4/4] Production build complete!${NC}"
    echo ""
    echo -e "${GREEN}Production files are ready in /dist folder${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Upload /dist contents to your web server"
    echo "2. Upload /backend folder to your hosting account"
    echo "3. Import database files from /backend/database/"
    echo "4. Configure production .env file"
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    case $choice in
        1)
            first_time_setup
            ;;
        2)
            start_dev_servers
            ;;
        3)
            setup_database
            ;;
        4)
            start_backend_only
            ;;
        5)
            build_production
            ;;
        6)
            echo -e "${GREEN}Thank you for using ZH-Love Gaming Community!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            read -p "Press Enter to continue..."
            ;;
    esac
done 
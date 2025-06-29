# UniPool - Campus Ride Sharing Platform

## 🚀 Quick Start

### Option 1: Using Live Server (Recommended)
1. **Install Live Server** (if you don't have it):
   - VS Code: Install "Live Server" extension
   - Or use any local server like `python -m http.server 8000`

2. **Start the application**:
   - Right-click on `index.html` and select "Open with Live Server"
   - Or run your local server and navigate to the project folder

3. **Open in browser**:
   - The application should open automatically in your default browser
   - If not, manually navigate to `http://localhost:3000` (or your server port)

### Option 2: Using Python HTTP Server
```bash
# Navigate to the project directory
cd unipool

# Start Python HTTP server
python -m http.server 8000

# Open in browser
# Navigate to http://localhost:8000
```

### Option 3: Using Node.js serve
```bash
# Install serve globally (if not already installed)
npm install -g serve

# Navigate to the project directory
cd unipool

# Start server
serve

# Open in browser
# Navigate to the URL shown in terminal
```

## 🔧 Troubleshooting

### If the page is blank:
1. **Check browser console** (F12) for errors
2. **Ensure all files are in the correct structure**:
   ```
   unipool/
   ├── index.html
   ├── App.jsx
   ├── components/
   │   ├── LocationPicker.jsx
   │   ├── UserSwitcher.jsx
   │   ├── RideManager.jsx
   │   └── RatingSystem.jsx
   ├── services/
   │   └── DataService.js
   ├── contracts/
   │   ├── UserAPI.js
   │   ├── RideAPI.js
   │   └── AIAPI.js
   └── db.json
   ```

3. **Check network connectivity** - The app uses CDN for React and Tailwind CSS

### If you see "React not loaded" error:
- Check your internet connection
- Try refreshing the page
- Check if your browser blocks CDN resources

### If components don't load:
- Check browser console for specific component errors
- Ensure all .jsx files are properly formatted
- Try the test.html file first to verify React is working

## 🎯 Features

- **User Management**: Switch between users (Driver/Rider roles)
- **Ride Creation**: Drivers can create rides with pickup, destination, time, and seats
- **Ride Search**: Search for available rides by location and time
- **Smart Recommendations**: AI-powered ride recommendations
- **Booking System**: Book and cancel rides
- **Rating System**: Rate drivers with star ratings and reviews
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

- **Frontend**: React 18 with JSX, compiled client-side via Babel CDN
- **Styling**: Tailwind CSS for responsive design
- **Data Storage**: localStorage with `db.json` for initial data
- **API Simulation**: Async/await with 300ms delays for REST-like service layer

## 📁 File Structure

```
unipool/
├── index.html              # Main HTML file with React setup
├── App.jsx                 # Main application component
├── test.html              # Simple React test file
├── components/            # React components
│   ├── LocationPicker.jsx # Location selection component
│   ├── UserSwitcher.jsx   # User switching component
│   ├── RideManager.jsx    # Ride creation component
│   └── RatingSystem.jsx   # Rating and review component
├── services/              # Data services
│   └── DataService.js     # Local storage and data management
├── contracts/             # API contracts
│   ├── UserAPI.js         # User management API
│   ├── RideAPI.js         # Ride management API
│   └── AIAPI.js           # AI recommendations API
└── db.json               # Initial database data
```

## 🎮 How to Use

1. **Select a User**: Use the User Switcher to select between Ali (Driver) and Sara (Rider)
2. **Create Rides**: Switch to "Create Ride" tab to create new rides (as a driver)
3. **Search Rides**: Use "Search & Book" tab to find and book rides (as a rider)
4. **Rate Rides**: After completing rides, use the rating system to rate drivers
5. **View Recommendations**: Click "Show Recommendations" to see AI-suggested rides

## 🚨 Important Notes

- **No real backend**: This is a frontend-only demo using localStorage
- **Data persistence**: Data is stored in browser localStorage
- **Reset Database**: Use the "Reset Database" button to clear all data
- **Browser compatibility**: Works best in modern browsers (Chrome, Firefox, Safari, Edge)

## 🔄 Development

To modify the application:
1. Edit the `.jsx` files for component changes
2. Edit the API files in `contracts/` for backend logic changes
3. Edit `DataService.js` for data management changes
4. Refresh the browser to see changes

## 🐛 Debugging

- Open browser console (F12) to see detailed logs
- Check the `test.html` file if the main app doesn't work
- All components have console.log statements for debugging
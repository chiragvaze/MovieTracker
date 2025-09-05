# 🎬 Movie Tracker

A simple and stylish web app to track your watched movies and wishlist, built with vanilla JavaScript, HTML, CSS, Node.js, and SQLite.

## 🚀 Features

- **User Authentication:** Register and login to access your personal movie lists.
- **Add Movies:** Enter movie title, year, and genre to add to your lists.
- **Watched & Wishlist:** Organize movies into "Watched" and "Wishlist" categories.
- **Move Between Lists:** Easily move movies from wishlist to watched and vice versa.
- **Delete Movies:** Remove movies from either list.
- **Statistics:** View total watched, wishlist count, and watched movies by genre.
- **Persistent Storage:** All data is saved on the server using SQLite database.
- **Responsive Design:** Works great on desktop and mobile devices.
- **Modern UI:** Clean, dark-themed interface with smooth interactions.

## 📂 File Structure

```
MovieTracker/
├── index.html       # Main HTML file
├── login.html       # Login page
├── register.html    # Registration page
├── styles.css       # Custom styles
├── script.js        # Frontend JavaScript code
├── backend/         # Backend server
│   ├── server.js    # Express server with APIs
│   └── package.json # Backend dependencies
├── README.md        # Project documentation
└── TODO.md          # Development tasks
```

## 📝 Setup and Usage

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd MovieTracker/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`.

### Frontend Usage

1. **Open `index.html`** in your web browser (or serve via a local server).
2. **Register** a new account or **login** with existing credentials.
3. Use the form to add movies to your watched list or wishlist.
4. Switch between tabs (Watched, Wishlist, Stats) using the navigation buttons.
5. Move or delete movies as needed. All changes are saved to the server.

## 🛠️ Customization

- Edit `styles.css` to change the look and feel.
- Modify or extend `script.js` to add new features (e.g., ratings, search, export).
- Update `backend/server.js` to add new API endpoints or modify existing ones.

## 💾 Data Storage

Movie data is stored in a SQLite database on the server. User authentication uses JWT tokens for secure access.

## 📱 Browser Support

- Chrome
- Firefox
- Edge
- Safari
- Mobile browsers

## 📄 License

MIT License

---

**Made with ❤️ for the love of movies!**

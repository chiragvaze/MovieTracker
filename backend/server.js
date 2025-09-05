const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./moviedb.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

// Create tables
function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        year TEXT,
        genre TEXT,
        list_type TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Auth routes
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username } });
    });
});

// Movie routes
app.get('/api/movies', authenticateToken, (req, res) => {
    db.all('SELECT * FROM movies WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const movies = { watched: [], wishlist: [] };
        rows.forEach(movie => {
            movies[movie.list_type].push({
                id: movie.id,
                title: movie.title,
                year: movie.year,
                genre: movie.genre
            });
        });
        res.json(movies);
    });
});

app.post('/api/movies', authenticateToken, (req, res) => {
    const { title, year, genre, list_type } = req.body;
    if (!title || !list_type) return res.status(400).json({ error: 'Title and list_type required' });

    db.run('INSERT INTO movies (user_id, title, year, genre, list_type) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, title, year, genre, list_type], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ id: this.lastID });
    });
});

app.put('/api/movies/:id', authenticateToken, (req, res) => {
    const { title, year, genre, list_type } = req.body;
    const id = req.params.id;

    db.run('UPDATE movies SET title = ?, year = ?, genre = ?, list_type = ? WHERE id = ? AND user_id = ?',
        [title, year, genre, list_type, id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Movie not found' });
        res.json({ message: 'Movie updated' });
    });
});

app.delete('/api/movies/:id', authenticateToken, (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM movies WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Movie not found' });
        res.json({ message: 'Movie deleted' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

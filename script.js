// Movie Tracker App
// Features: Add, remove, move between lists, stats, localStorage persistence

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const watchedList = document.getElementById('watchedList');
    const wishlist = document.getElementById('wishlist');
    const movieForm = document.getElementById('movieForm');
    const movieTitle = document.getElementById('movieTitle');
    const movieYear = document.getElementById('movieYear');
    const movieGenre = document.getElementById('movieGenre');
    const movieListType = document.getElementById('movieListType');
    const watchedSection = document.getElementById('watchedSection');
    const wishlistSection = document.getElementById('wishlistSection');
    const statsSection = document.getElementById('statsSection');
    const statsDiv = document.getElementById('stats');
    const watchedTab = document.getElementById('watchedTab');
    const wishlistTab = document.getElementById('wishlistTab');
    const statsTab = document.getElementById('statsTab');

    // Data
    let movies = JSON.parse(localStorage.getItem('movies')) || { watched: [], wishlist: [] };

    // Render Functions
    function renderList(type) {
        const list = type === 'watched' ? watchedList : wishlist;
        list.innerHTML = '';
        movies[type].forEach((movie, idx) => {
            const li = document.createElement('li');
            const infoDiv = document.createElement('div');
            infoDiv.className = 'movie-info';
            infoDiv.innerHTML = `<span class="movie-title">${movie.title}</span>` +
                (movie.year ? `<span class="movie-meta">(${movie.year})</span>` : '') +
                (movie.genre ? `<span class="movie-meta">${movie.genre}</span>` : '');
            li.appendChild(infoDiv);
            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'movie-actions';
            // Move button
            const moveBtn = document.createElement('button');
            moveBtn.title = type === 'watched' ? 'Move to Wishlist' : 'Mark as Watched';
            moveBtn.innerHTML = type === 'watched' ? '🕒' : '✅';
            moveBtn.onclick = () => moveMovie(type, idx);
            actionsDiv.appendChild(moveBtn);
            // Delete button
            const delBtn = document.createElement('button');
            delBtn.title = 'Delete';
            delBtn.innerHTML = '🗑️';
            delBtn.onclick = () => deleteMovie(type, idx);
            actionsDiv.appendChild(delBtn);
            li.appendChild(actionsDiv);
            list.appendChild(li);
        });
    }

    function renderStats() {
        const totalWatched = movies.watched.length;
        const totalWishlist = movies.wishlist.length;
        const genres = {};
        movies.watched.forEach(m => {
            if (m.genre) genres[m.genre] = (genres[m.genre] || 0) + 1;
        });
        let genreStats = '';
        if (Object.keys(genres).length) {
            genreStats = '<h4>Watched by Genre:</h4><ul>' +
                Object.entries(genres).map(([g, c]) => `<li>${g}: ${c}</li>`).join('') + '</ul>';
        }
        statsDiv.innerHTML = `
            <p><strong>Total Watched:</strong> ${totalWatched}</p>
            <p><strong>In Wishlist:</strong> ${totalWishlist}</p>
            ${genreStats}
        `;
    }

    // Actions
    function addMovie(e) {
        e.preventDefault();
        const title = movieTitle.value.trim();
        if (!title) return;
        const year = movieYear.value.trim();
        const genre = movieGenre.value.trim();
        const type = movieListType.value;
        movies[type].push({ title, year, genre });
        saveMovies();
        renderList(type);
        renderStats();
        movieForm.reset();
    }

    function deleteMovie(type, idx) {
        if (confirm('Delete this movie?')) {
            movies[type].splice(idx, 1);
            saveMovies();
            renderList(type);
            renderStats();
        }
    }

    function moveMovie(type, idx) {
        const movie = movies[type][idx];
        const target = type === 'watched' ? 'wishlist' : 'watched';
        movies[type].splice(idx, 1);
        movies[target].push(movie);
        saveMovies();
        renderList('watched');
        renderList('wishlist');
        renderStats();
    }

    function saveMovies() {
        localStorage.setItem('movies', JSON.stringify(movies));
    }

    // Tab switching
    function showSection(section) {
        watchedSection.classList.add('hidden');
        wishlistSection.classList.add('hidden');
        statsSection.classList.add('hidden');
        watchedTab.classList.remove('active');
        wishlistTab.classList.remove('active');
        statsTab.classList.remove('active');
        if (section === 'watched') {
            watchedSection.classList.remove('hidden');
            watchedTab.classList.add('active');
        } else if (section === 'wishlist') {
            wishlistSection.classList.remove('hidden');
            wishlistTab.classList.add('active');
        } else {
            statsSection.classList.remove('hidden');
            statsTab.classList.add('active');
        }
    }

    watchedTab.onclick = () => showSection('watched');
    wishlistTab.onclick = () => showSection('wishlist');
    statsTab.onclick = () => showSection('stats');

    // Init
    movieForm.onsubmit = addMovie;
    renderList('watched');
    renderList('wishlist');
    renderStats();
    showSection('watched');
});

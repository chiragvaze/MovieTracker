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
    const userSection = document.getElementById('userSection');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Rating elements
    const starRating = document.getElementById('starRating');
    const ratingValue = document.getElementById('ratingValue');
    const stars = document.querySelectorAll('.star');

    // Rating state
    let currentRating = 0;

    // Check login status
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // User-specific data storage
    const userDataKey = `movies_${loggedInUser}`;
    let movies = JSON.parse(localStorage.getItem(userDataKey)) || { watched: [], wishlist: [] };

    // Show logged in user info
    userInfo.textContent = `Logged in as: ${loggedInUser}`;

    // Logout function
    logoutBtn.onclick = () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    };

    // Rating System Functions
    function initializeRating() {
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                currentRating = index + 1;
                updateStarDisplay();
                updateRatingValue();
                animateStarClick(star);
            });

            star.addEventListener('mouseenter', () => {
                highlightStars(index + 1);
            });
        });

        starRating.addEventListener('mouseleave', () => {
            updateStarDisplay();
        });
    }

    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('hovered');
            } else {
                star.classList.remove('hovered');
            }
        });
    }

    function updateStarDisplay() {
        stars.forEach((star, index) => {
            star.classList.remove('hovered');
            if (index < currentRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function updateRatingValue() {
        ratingValue.textContent = `${currentRating}/5`;
    }

    function animateStarClick(star) {
        star.classList.add('pulse');
        setTimeout(() => {
            star.classList.remove('pulse');
        }, 300);
    }

    function resetRating() {
        currentRating = 0;
        updateStarDisplay();
        updateRatingValue();
    }

    function createStarDisplay(rating) {
        if (!rating) return '';
        
        let starsHtml = '<div class="movie-rating"><div class="rating-stars">';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= rating ? 'filled' : '';
            starsHtml += `<span class="rating-star ${filled}">★</span>`;
        }
        starsHtml += `</div><span class="rating-number">${rating}/5</span></div>`;
        return starsHtml;
    }

    // Render Functions
    function renderList(type) {
        const list = type === 'watched' ? watchedList : wishlist;
        list.innerHTML = '';
        movies[type].forEach((movie, idx) => {
            const li = document.createElement('li');
            const infoDiv = document.createElement('div');
            infoDiv.className = 'movie-info';
            
            const mainInfo = `
                <div class="movie-main-info">
                    <span class="movie-title">${movie.title}</span>
                    ${movie.year ? `<span class="movie-meta">(${movie.year})</span>` : ''}
                    ${movie.genre ? `<span class="movie-meta">${movie.genre}</span>` : ''}
                </div>
                ${movie.rating ? createStarDisplay(movie.rating) : ''}
            `;
            
            infoDiv.innerHTML = mainInfo;
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
        let totalRating = 0;
        let ratedMovies = 0;

        movies.watched.forEach(m => {
            if (m.genre) genres[m.genre] = (genres[m.genre] || 0) + 1;
            if (m.rating) {
                totalRating += m.rating;
                ratedMovies++;
            }
        });

        const avgRating = ratedMovies > 0 ? (totalRating / ratedMovies).toFixed(1) : 0;
        
        let genreStats = '';
        if (Object.keys(genres).length) {
            genreStats = '<h4>Watched by Genre:</h4><ul>' +
                Object.entries(genres).map(([g, c]) => `<li>${g}: ${c}</li>`).join('') + '</ul>';
        }

        let ratingStats = '';
        if (ratedMovies > 0) {
            const avgStars = createStarDisplay(Math.round(avgRating));
            ratingStats = `
                <div class="rating-stats">
                    <h4>Rating Statistics</h4>
                    <div class="avg-rating">
                        Average Rating: ${avgRating}/5 ${avgStars}
                    </div>
                    <p>Rated Movies: ${ratedMovies} out of ${totalWatched}</p>
                </div>
            `;
        }

        statsDiv.innerHTML = `
            <p><strong>Total Watched:</strong> ${totalWatched}</p>
            <p><strong>In Wishlist:</strong> ${totalWishlist}</p>
            ${ratingStats}
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
        const rating = currentRating > 0 ? currentRating : null;
        
        movies[type].push({ title, year, genre, rating });
        saveMovies();
        renderList(type);
        renderStats();
        movieForm.reset();
        resetRating();
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
        localStorage.setItem(userDataKey, JSON.stringify(movies));
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

    // Event Listeners
    watchedTab.onclick = () => showSection('watched');
    wishlistTab.onclick = () => showSection('wishlist');
    statsTab.onclick = () => showSection('stats');
    movieForm.onsubmit = addMovie;

    // Initialize
    initializeRating();
    renderList('watched');
    renderList('wishlist');
    renderStats();
    showSection('watched');
});

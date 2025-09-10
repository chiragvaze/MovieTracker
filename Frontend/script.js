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
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // New elements for enhanced features
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const clearFilters = document.getElementById('clearFilters');
    const toggleForm = document.getElementById('toggleForm');
    const resetForm = document.getElementById('resetForm');
    const themeToggle = document.getElementById('themeToggle');
    const fabBtn = document.getElementById('fabBtn');
    const watchedCount = document.getElementById('watchedCount');
    const wishlistCount = document.getElementById('wishlistCount');
    
    // Rating elements
    const starRating = document.getElementById('starRating');
    const ratingValue = document.getElementById('ratingValue');
    const stars = document.querySelectorAll('.star');

    // State
    let currentRating = 0;
    let filteredMovies = { watched: [], wishlist: [] };

    // Check login status
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // User-specific data storage
    const userDataKey = `movies_${loggedInUser}`;
    let movies = JSON.parse(localStorage.getItem(userDataKey)) || { watched: [], wishlist: [] };

    // Initialize app
    function initializeApp() {
        userInfo.textContent = loggedInUser;
        initializeRating();
        initializeEventListeners();
        applyFilters();
        renderAll();
        showSection('watched');
    }

    // Event Listeners
    function initializeEventListeners() {
        // Navigation
        watchedTab.onclick = () => showSection('watched');
        wishlistTab.onclick = () => showSection('wishlist');
        statsTab.onclick = () => showSection('stats');
        
        // Form
        movieForm.onsubmit = addMovie;
        resetForm.onclick = resetMovieForm;
        
        // Search and filters
        searchInput.oninput = applyFilters;
        genreFilter.onchange = applyFilters;
        ratingFilter.onchange = applyFilters;
        clearFilters.onclick = clearAllFilters;
        
        // UI controls
        toggleForm.onclick = toggleMovieForm;
        themeToggle.onclick = toggleTheme;
        fabBtn.onclick = scrollToForm;
        logoutBtn.onclick = logout;
    }

    // Rating System
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

    // Filter Functions
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const genreFilter_value = genreFilter.value;
        const ratingFilter_value = ratingFilter.value;

        filteredMovies.watched = movies.watched.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
            const matchesGenre = genreFilter_value === 'all' || movie.genre === genreFilter_value;
            const matchesRating = ratingFilter_value === 'all' || (movie.rating && movie.rating >= parseInt(ratingFilter_value));
            
            return matchesSearch && matchesGenre && matchesRating;
        });

        filteredMovies.wishlist = movies.wishlist.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
            const matchesGenre = genreFilter_value === 'all' || movie.genre === genreFilter_value;
            
            return matchesSearch && matchesGenre;
        });

        renderLists();
        updateCounts();
    }

    function clearAllFilters() {
        searchInput.value = '';
        genreFilter.value = 'all';
        ratingFilter.value = 'all';
        applyFilters();
    }

    // Render Functions
    function renderLists() {
        renderList('watched');
        renderList('wishlist');
    }

    function renderList(type) {
        const container = type === 'watched' ? watchedList : wishlist;
        const movieList = filteredMovies[type];
        
        container.innerHTML = '';
        
        if (movieList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <p>No movies found</p>
                </div>
            `;
            return;
        }

        movieList.forEach((movie, idx) => {
            const originalIndex = movies[type].findIndex(m => 
                m.title === movie.title && m.year === movie.year && m.genre === movie.genre
            );
            
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            movieCard.innerHTML = `
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-meta">
                        ${movie.year ? `<span>(${movie.year})</span>` : ''}
                        ${movie.genre ? `<span>${movie.genre}</span>` : ''}
                    </div>
                    ${movie.rating ? createStarDisplay(movie.rating) : ''}
                </div>
                <div class="movie-actions">
                    <button class="move-btn" onclick="moveMovie('${type}', ${originalIndex})" title="${type === 'watched' ? 'Move to Wishlist' : 'Mark as Watched'}">
                        ${type === 'watched' ? '🕒 To Wishlist' : '✅ Mark Watched'}
                    </button>
                    <button class="delete-btn" onclick="deleteMovie('${type}', ${originalIndex})" title="Delete">
                        🗑️ Delete
                    </button>
                </div>
            `;
            
            container.appendChild(movieCard);
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
            genreStats = Object.entries(genres)
                .map(([genre, count]) => `
                    <div class="stat-card">
                        <div class="stat-value">${count}</div>
                        <div class="stat-label">${genre}</div>
                    </div>
                `).join('');
        }

        let ratingStats = '';
        if (ratedMovies > 0) {
            ratingStats = `
                <div class="stat-card">
                    <div class="stat-value">${avgRating}</div>
                    <div class="stat-label">Average Rating</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${ratedMovies}</div>
                    <div class="stat-label">Rated Movies</div>
                </div>
            `;
        }

        statsDiv.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalWatched}</div>
                <div class="stat-label">Watched Movies</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalWishlist}</div>
                <div class="stat-label">Wishlist Movies</div>
            </div>
            ${ratingStats}
            ${genreStats}
        `;
    }

    function updateCounts() {
        watchedCount.textContent = `${filteredMovies.watched.length} movies`;
        wishlistCount.textContent = `${filteredMovies.wishlist.length} movies`;
    }

    function renderAll() {
        renderLists();
        renderStats();
        updateCounts();
    }

    // Movie Actions (make global for onclick handlers)
    window.addMovie = function(e) {
        e.preventDefault();
        const title = movieTitle.value.trim();
        if (!title) return;
        
        const year = movieYear.value.trim();
        const genre = movieGenre.value;
        const type = movieListType.value;
        const rating = currentRating > 0 ? currentRating : null;
        
        movies[type].push({ title, year, genre, rating });
        saveMovies();
        resetMovieForm();
        applyFilters();
        renderStats();
        
        showNotification(`Movie "${title}" added to ${type}!`, 'success');
    };

    window.deleteMovie = function(type, idx) {
        const movie = movies[type][idx];
        if (confirm(`Delete "${movie.title}"?`)) {
            movies[type].splice(idx, 1);
            saveMovies();
            applyFilters();
            renderStats();
            showNotification(`Movie "${movie.title}" deleted!`, 'error');
        }
    };

    window.moveMovie = function(type, idx) {
        const movie = movies[type][idx];
        const target = type === 'watched' ? 'wishlist' : 'watched';
        movies[type].splice(idx, 1);
        movies[target].push(movie);
        saveMovies();
        applyFilters();
        renderStats();
        showNotification(`Movie "${movie.title}" moved to ${target}!`, 'success');
    };

    // UI Functions
    function showSection(section) {
        // Hide all sections
        watchedSection.classList.add('hidden');
        wishlistSection.classList.add('hidden');
        statsSection.classList.add('hidden');
        
        // Remove active from all tabs
        watchedTab.classList.remove('active');
        wishlistTab.classList.remove('active');
        statsTab.classList.remove('active');
        
        // Show selected section and activate tab
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

    function toggleMovieForm() {
        const form = document.querySelector('.movie-form');
        const icon = toggleForm.querySelector('i');
        
        if (form.style.display === 'none') {
            form.style.display = 'flex';
            icon.style.transform = 'rotate(180deg)';
        } else {
            form.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
        }
    }

    function resetMovieForm() {
        movieForm.reset();
        resetRating();
    }

    function scrollToForm() {
        document.querySelector('.add-movie-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    function toggleTheme() {
        const body = document.body;
        const icon = themeToggle.querySelector('i');
        
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        }
    }

    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Utility Functions
    function saveMovies() {
        localStorage.setItem(userDataKey, JSON.stringify(movies));
    }

    // Initialize theme
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const icon = themeToggle.querySelector('i');
        
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // Start the app
    initializeTheme();
    initializeApp();
});

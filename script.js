// ==================== FIREBASE DATA ====================

// Default events data
const defaultEvents = [
    {
        title: "MARTY SUPREMEEEE",
        date: "2026-01-31",
        time: "14:00",
        location: "Ambience",
        activity: "Marty Supreme Movie",
        people: "Nimeesha, Tanish, Olwethu"
    },
    {
        title: "Game Night",
        date: "2026-01-31",
        time: "19:00",
        location: "Discord + Whatsapp for Yuppaya",
        activity: "Fan Favourites including Among Us, Gartic Phone, Roblox Horror Games",
        people: "Hopefully Everyone"
    }
];

// Default games - now with vote tracking
// Each game is an object with name and votes array
const defaultGames = [
    { name: "Among Us", votes: [] },
    { name: "Gartic Phone", votes: [] },
    { name: "Roblox Horror Games", votes: [] }
];

// Total members for majority calculation
const TOTAL_MEMBERS = 15;
const MAJORITY_VOTES = Math.ceil(TOTAL_MEMBERS / 2); // 8 votes needed

// Global data storage
let eventsData = [];
let gamesData = [];

// ==================== FIREBASE EVENTS ====================

// Load events from Firebase
function loadEventsFromFirebase() {
    const eventsRef = database.ref('events');
    eventsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && Array.isArray(data)) {
            eventsData = data;
        } else if (data) {
            eventsData = Object.values(data);
        } else {
            // Initialize with defaults if empty
            eventsData = defaultEvents;
            saveEventsToFirebase(eventsData);
        }
        renderEvents('events-container', 2);
        renderEvents('all-events-container');
    });
}

// Save events to Firebase
function saveEventsToFirebase(events) {
    const eventsRef = database.ref('events');
    eventsRef.set(events);
}

// Get events (now uses global data)
function loadEvents() {
    return eventsData;
}

// Save events
function saveEvents(events) {
    eventsData = events;
    saveEventsToFirebase(events);
}

// ==================== FIREBASE GAMES ====================

// Load games from Firebase
function loadGamesFromFirebase() {
    const gamesRef = database.ref('games');
    gamesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            gamesData = data;
        } else {
            // Initialize with defaults if empty
            gamesData = defaultGames;
            saveGamesToFirebase(gamesData);
        }
        renderGames();
    });
}

// Save games to Firebase
function saveGamesToFirebase(games) {
    const gamesRef = database.ref('games');
    gamesRef.set(games);
}

// Get games (now uses global data)
function loadGames() {
    return gamesData;
}

// Save games
function saveGames(games) {
    gamesData = games;
    saveGamesToFirebase(games);
}

// ==================== EVENTS FUNCTIONS ====================

// Sort events by date and time
function sortEventsByDate(events) {
    return events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA - dateB;
    });
}

// Format date for display
function formatDate(date, time) {
    const dateObj = new Date(`${date}T${time || '00:00'}`);
    const options = { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
    };
    let formatted = dateObj.toLocaleDateString('en-US', options);
    
    if (time) {
        const timeOptions = { hour: 'numeric', minute: '2-digit' };
        formatted += ' at ' + dateObj.toLocaleTimeString('en-US', timeOptions);
    }
    
    return formatted;
}

// Create event card HTML
function createEventCard(event, index, showEditButton = true) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.index = index;
    
    card.innerHTML = `
        <div class="event-header">
            <h3>${event.title}</h3>
            ${showEditButton ? `<button class="edit-btn" onclick="openEditModal(${index})">Edit</button>` : ''}
        </div>
        <div class="event-details">
            <p><strong>📅 Date & Time:</strong> ${formatDate(event.date, event.time)}</p>
            <p><strong>📍 Location:</strong> ${event.location}</p>
            <p><strong>🎯 Activity:</strong> ${event.activity}</p>
            <p><strong>👥 People Confirmed:</strong> ${event.people}</p>
        </div>
    `;
    
    return card;
}

// Render events to the page
function renderEvents(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let events = sortEventsByDate(loadEvents());
    
    // Filter to only show future events
    const now = new Date();
    events = events.filter(e => new Date(`${e.date}T${e.time || '00:00'}`) >= now);
    
    if (limit) {
        events = events.slice(0, limit);
    }
    
    container.innerHTML = '';
    
    if (events.length === 0) {
        container.innerHTML = '<p class="no-events">No upcoming events scheduled.</p>';
        return;
    }
    
    events.forEach((event, index) => {
        container.appendChild(createEventCard(event, index));
    });
}

// Open edit modal
function openEditModal(index) {
    const events = loadEvents();
    const event = events[index];
    if (!event) return;
    
    document.getElementById('edit-event-id').value = index;
    document.getElementById('edit-title').value = event.title;
    document.getElementById('edit-date').value = event.date;
    document.getElementById('edit-time').value = event.time || '';
    document.getElementById('edit-location').value = event.location;
    document.getElementById('edit-activity').value = event.activity;
    document.getElementById('edit-people').value = event.people;
    
    document.getElementById('edit-modal').classList.add('active');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

// Save event changes
function saveEventChanges() {
    const index = parseInt(document.getElementById('edit-event-id').value);
    const events = loadEvents();
    
    if (index < 0 || index >= events.length) return;
    
    events[index] = {
        title: document.getElementById('edit-title').value,
        date: document.getElementById('edit-date').value,
        time: document.getElementById('edit-time').value,
        location: document.getElementById('edit-location').value,
        activity: document.getElementById('edit-activity').value,
        people: document.getElementById('edit-people').value
    };
    
    saveEvents(events);
    closeEditModal();
}

// Add new event
function openAddModal() {
    document.getElementById('add-title').value = '';
    document.getElementById('add-date').value = '';
    document.getElementById('add-time').value = '';
    document.getElementById('add-location').value = '';
    document.getElementById('add-activity').value = '';
    document.getElementById('add-people').value = '';
    
    document.getElementById('add-modal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('add-modal').classList.remove('active');
}

function addNewEvent() {
    const events = loadEvents();
    
    const newEvent = {
        title: document.getElementById('add-title').value,
        date: document.getElementById('add-date').value,
        time: document.getElementById('add-time').value,
        location: document.getElementById('add-location').value,
        activity: document.getElementById('add-activity').value,
        people: document.getElementById('add-people').value
    };
    
    events.push(newEvent);
    saveEvents(events);
    closeAddModal();
}

// Delete event by index
function deleteEvent() {
    const index = parseInt(document.getElementById('edit-event-id').value);
    let events = loadEvents();
    if (index >= 0 && index < events.length) {
        events.splice(index, 1);
        saveEvents(events);
    }
    closeEditModal();
}

// ==================== FAN FAVOURITE GAMES WITH VOTING ====================

// Check if a game is a fan favourite (has majority votes)
function isFanFavourite(game) {
    return game.votes && game.votes.length >= MAJORITY_VOTES;
}

// Create game card HTML with voting
function createGameCard(game, index) {
    const voteCount = game.votes ? game.votes.length : 0;
    const isFav = isFanFavourite(game);
    const votesNeeded = MAJORITY_VOTES - voteCount;
    
    const gameCard = document.createElement('div');
    gameCard.className = `game-card ${isFav ? 'fan-fav' : ''}`;
    
    let votersDisplay = '';
    if (game.votes && game.votes.length > 0) {
        votersDisplay = `<div class="voters">Voted: ${game.votes.join(', ')}</div>`;
    }
    
    let statusText = '';
    if (isFav) {
        statusText = '<span class="status-badge fav">⭐ Fan Favourite!</span>';
    } else if (voteCount > 0) {
        statusText = `<span class="status-badge pending">${votesNeeded} more vote${votesNeeded !== 1 ? 's' : ''} needed</span>`;
    } else {
        statusText = '<span class="status-badge">No votes yet</span>';
    }
    
    gameCard.innerHTML = `
        <div class="game-card-header">
            <h4>${game.name}</h4>
            <button class="vote-btn" onclick="openVoteModal(${index})">🗳️ Vote</button>
        </div>
        <div class="game-card-body">
            <div class="vote-count">
                <span class="vote-number">${voteCount}</span>/<span class="vote-total">${TOTAL_MEMBERS}</span> votes
            </div>
            <div class="vote-bar">
                <div class="vote-fill" style="width: ${(voteCount / TOTAL_MEMBERS) * 100}%"></div>
                <div class="vote-threshold" style="left: ${(MAJORITY_VOTES / TOTAL_MEMBERS) * 100}%"></div>
            </div>
            ${statusText}
            ${votersDisplay}
        </div>
    `;
    
    return gameCard;
}

// Render games in both sections
function renderGames() {
    const fanFavContainer = document.getElementById('fan-favourites-container');
    const considerationContainer = document.getElementById('in-consideration-container');
    
    if (!fanFavContainer || !considerationContainer) return;
    
    const games = loadGames();
    
    // Separate games into fan favourites and in consideration
    const fanFavourites = [];
    const inConsideration = [];
    
    games.forEach((game, index) => {
        // Migrate old string format to new object format
        if (typeof game === 'string') {
            game = { name: game, votes: [] };
            games[index] = game;
        }
        
        if (isFanFavourite(game)) {
            fanFavourites.push({ game, index });
        } else {
            inConsideration.push({ game, index });
        }
    });
    
    // Render fan favourites
    fanFavContainer.innerHTML = '';
    if (fanFavourites.length === 0) {
        fanFavContainer.innerHTML = '<p class="no-games">No fan favourites yet. Vote for games below!</p>';
    } else {
        fanFavourites.forEach(({ game, index }) => {
            fanFavContainer.appendChild(createGameCard(game, index));
        });
    }
    
    // Render in consideration
    considerationContainer.innerHTML = '';
    if (inConsideration.length === 0) {
        considerationContainer.innerHTML = '<p class="no-games">All games are fan favourites! Suggest a new game.</p>';
    } else {
        inConsideration.forEach(({ game, index }) => {
            considerationContainer.appendChild(createGameCard(game, index));
        });
    }
}

// Open add game modal
function openAddGameModal() {
    document.getElementById('add-game-name').value = '';
    document.getElementById('add-game-modal').classList.add('active');
}

// Close add game modal
function closeAddGameModal() {
    document.getElementById('add-game-modal').classList.remove('active');
}

// Add new game
function addGame() {
    const name = document.getElementById('add-game-name').value.trim();
    if (!name) return;
    
    const games = loadGames();
    // Check if game already exists
    const exists = games.some(g => {
        const gameName = typeof g === 'string' ? g : g.name;
        return gameName.toLowerCase() === name.toLowerCase();
    });
    
    if (exists) {
        alert('This game already exists!');
        return;
    }
    
    games.push({ name: name, votes: [] });
    saveGames(games);
    closeAddGameModal();
}

// Remove game by index (developer only - use in console)
function removeGame(index) {
    let games = loadGames();
    if (index >= 0 && index < games.length) {
        games.splice(index, 1);
        saveGames(games);
    }
}

// ==================== VOTING FUNCTIONS ====================

// Open vote modal
function openVoteModal(gameIndex) {
    const games = loadGames();
    const game = games[gameIndex];
    if (!game) return;
    
    const gameName = typeof game === 'string' ? game : game.name;
    
    document.getElementById('vote-game-id').value = gameIndex;
    document.getElementById('vote-game-name-display').textContent = gameName;
    document.getElementById('voter-name').value = '';
    document.getElementById('vote-modal').classList.add('active');
}

// Close vote modal
function closeVoteModal() {
    document.getElementById('vote-modal').classList.remove('active');
}

// Submit vote
function submitVote() {
    const gameIndex = parseInt(document.getElementById('vote-game-id').value);
    const voterName = document.getElementById('voter-name').value;
    
    if (!voterName) {
        alert('Please select your name!');
        return;
    }
    
    const games = loadGames();
    let game = games[gameIndex];
    
    if (!game) return;
    
    // Migrate old format if needed
    if (typeof game === 'string') {
        game = { name: game, votes: [] };
        games[gameIndex] = game;
    }
    
    // Initialize votes array if not present
    if (!game.votes) {
        game.votes = [];
    }
    
    // Check if user already voted
    if (game.votes.includes(voterName)) {
        alert('You have already voted for this game!');
        return;
    }
    
    // Add vote
    game.votes.push(voterName);
    saveGames(games);
    closeVoteModal();
}

// Remove vote
function removeVote() {
    const gameIndex = parseInt(document.getElementById('vote-game-id').value);
    const voterName = document.getElementById('voter-name').value;
    
    if (!voterName) {
        alert('Please select your name to remove your vote!');
        return;
    }
    
    const games = loadGames();
    let game = games[gameIndex];
    
    if (!game) return;
    
    // Check if game has votes array
    if (!game.votes || !game.votes.includes(voterName)) {
        alert('You have not voted for this game!');
        return;
    }
    
    // Remove vote
    game.votes = game.votes.filter(v => v !== voterName);
    saveGames(games);
    closeVoteModal();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load data from Firebase (this will trigger renders automatically)
    loadEventsFromFirebase();
    loadGamesFromFirebase();
});
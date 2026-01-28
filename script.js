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

// Default games
const defaultGames = ["Among Us", "Gartic Phone", "Roblox Horror Games"];

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

// ==================== FAN FAVOURITE GAMES ====================

// Render games
function renderGames() {
    const container = document.getElementById('games-container');
    if (!container) return;
    
    const games = loadGames();
    container.innerHTML = '';
    
    if (games.length === 0) {
        container.innerHTML = '<p class="no-games">No games added yet.</p>';
        return;
    }
    
    games.forEach(game => {
        const gameTag = document.createElement('div');
        gameTag.className = 'game-tag';
        gameTag.innerHTML = `<span>${game}</span>`;
        container.appendChild(gameTag);
    });
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
    games.push(name);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load data from Firebase (this will trigger renders automatically)
    loadEventsFromFirebase();
    loadGamesFromFirebase();
});
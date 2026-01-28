// Default events data
const defaultEvents = [
    {
        id: 1,
        title: "MARTY SUPREMEEEE",
        date: "2026-01-31",
        time: "14:00",
        location: "Ambience",
        activity: "Marty Supreme Movie",
        people: "Nimeesha, Tanish, Olwethu"
    },
    {
        id: 2,
        title: "Game Night",
        date: "2026-01-31",
        time: "19:00",
        location: "Discord + Whatsapp for Yuppaya",
        activity: "Fan Favourites including Among Us, Gartic Phone, Roblox Horror Games",
        people: "Hopefully Everyone"
    }
];

// Load events from localStorage or use defaults
function loadEvents() {
    const stored = localStorage.getItem('roadblocks-events');
    if (stored) {
        return JSON.parse(stored);
    }
    return defaultEvents;
}

// Save events to localStorage
function saveEvents(events) {
    localStorage.setItem('roadblocks-events', JSON.stringify(events));
}

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
function createEventCard(event, showEditButton = true) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.id = event.id;
    
    card.innerHTML = `
        <div class="event-header">
            <h3>${event.title}</h3>
            ${showEditButton ? `<button class="edit-btn" onclick="openEditModal(${event.id})">Edit</button>` : ''}
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
    
    events.forEach(event => {
        container.appendChild(createEventCard(event));
    });
}

// Open edit modal
function openEditModal(eventId) {
    const events = loadEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('edit-event-id').value = event.id;
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
    const id = parseInt(document.getElementById('edit-event-id').value);
    const events = loadEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) return;
    
    events[eventIndex] = {
        id: id,
        title: document.getElementById('edit-title').value,
        date: document.getElementById('edit-date').value,
        time: document.getElementById('edit-time').value,
        location: document.getElementById('edit-location').value,
        activity: document.getElementById('edit-activity').value,
        people: document.getElementById('edit-people').value
    };
    
    saveEvents(events);
    closeEditModal();
    
    // Re-render events on both pages if elements exist
    renderEvents('events-container', 2);
    renderEvents('all-events-container');
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
    const newId = Math.max(...events.map(e => e.id), 0) + 1;
    
    const newEvent = {
        id: newId,
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
    
    renderEvents('events-container', 2);
    renderEvents('all-events-container');
}

// Delete event
function deleteEvent() {
    const id = parseInt(document.getElementById('edit-event-id').value);
    let events = loadEvents();
    events = events.filter(e => e.id !== id);
    saveEvents(events);
    closeEditModal();
    
    renderEvents('events-container', 2);
    renderEvents('all-events-container');
}

// ==================== FAN FAVOURITE GAMES ====================

// Default games
const defaultGames = ["Among Us", "Gartic Phone", "Roblox Horror Games"];

// Load games from localStorage
function loadGames() {
    const stored = localStorage.getItem('roadblocks-games');
    if (stored) {
        return JSON.parse(stored);
    }
    return defaultGames;
}

// Save games to localStorage
function saveGames(games) {
    localStorage.setItem('roadblocks-games', JSON.stringify(games));
}

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
    renderGames();
}

// Remove game by index
function removeGame(index) {
    let games = loadGames();
    if (index >= 0 && index < games.length) {
        games.splice(index, 1);
        saveGames(games);
        renderGames();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    renderEvents('events-container', 2);
    renderEvents('all-events-container');
    renderGames();
});
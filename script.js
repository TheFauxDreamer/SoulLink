// Main JavaScript for Multi-Generation Soul Link Nuzlocke Tracker with Carousel

// Game data structure
let gameData = {
    player1: {
        caught: [],
        team: [null, null, null, null, null, null]
    },
    player2: {
        caught: [],
        team: [null, null, null, null, null, null]
    },
    soulLinks: [],
    usedRoutes: [],
    failedRoutes: [],
    playerNames: {
        player1: 'Player 1',
        player2: 'Player 2'
    },
    strictPrimaryTypeMode: true,
    currentGame: null, // Will be set by generation selector
    currentGeneration: null // Track the generation
};

// Carousel state
let currentCarouselIndex = 0;
let totalCarouselSlides = 7;

// Improved Toast notification system
function showToast(message, type = 'success', duration = 4000) {
    console.log(`Toast: [${type}] ${message}`); // Debug log
    
    // Get or create the container
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        console.log('Created new toast container');
    }
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add toast to container
    container.appendChild(toast);
    console.log('Added toast to container:', message);
    
    // Force a reflow to ensure the element is in the DOM before animation
    toast.offsetHeight;
    
    // Set up auto-removal
    const removeToast = () => {
        if (toast && container && container.contains(toast)) {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (container && container.contains(toast)) {
                    container.removeChild(toast);
                    console.log('Removed toast:', message);
                }
            }, 400); // Match fade-out animation duration
        }
    };
    
    // Auto-remove after duration
    setTimeout(removeToast, duration);
    
    // Allow manual click-to-dismiss
    toast.addEventListener('click', removeToast);
    
    // Return the toast element for testing purposes
    return toast;
}

// Test function for toast notifications - accessible from browser console
function testToast() {
    showToast('Test success message! 🎉', 'success');
    setTimeout(() => showToast('Test error message! ❌', 'error'), 1000);
    setTimeout(() => showToast('Test info message! ℹ️', 'info'), 2000);
    setTimeout(() => showToast('Test warning message! ⚠️', 'warning'), 3000);
}

// Track selected generation during setup
let selectedGeneration = null;
let selectedGame = null;

// Pokemon data cache
let pokemonCache = {};

// Generation data with artwork and information
const generationData = [
    {
        id: 1,
        roman: 'I',
        name: 'Kanto',
        fullName: 'Generation I',
        games: 'Red/Blue/Yellow',
        artwork: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/a/a2/latest/20160807181250/Artwork_Pok%C3%A9mon_Rojo_Azul.png/300px-Artwork_Pok%C3%A9mon_Rojo_Azul.png'
    },
    {
        id: 2,
        roman: 'II',
        name: 'Johto',
        fullName: 'Generation II',
        games: 'Gold/Silver/Crystal',
        artwork: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/8/80/latest/20160807181359/Artwork_Pok%C3%A9mon_Oro_Plata.png/300px-Artwork_Pok%C3%A9mon_Oro_Plata.png'
    },
    {
        id: 3,
        roman: 'III',
        name: 'Hoenn',
        fullName: 'Generation III',
        games: 'Ruby/Sapphire/Emerald & FireRed/LeafGreen',
        artwork: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/9/9c/latest/20160807181507/Artwork_Pok%C3%A9mon_Rub%C3%AD_Zafiro.png/300px-Artwork_Pok%C3%A9mon_Rub%C3%AD_Zafiro.png'
    },
    {
        id: 4,
        roman: 'IV',
        name: 'Sinnoh',
        fullName: 'Generation IV',
        games: 'Diamond/Pearl/Platinum & HeartGold/SoulSilver',
        artwork: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/b/bf/latest/20160807181600/Artwork_Pok%C3%A9mon_Diamante_Perla.png/300px-Artwork_Pok%C3%A9mon_Diamante_Perla.png'
    },
    {
        id: 5,
        roman: 'V',
        name: 'Unova',
        fullName: 'Generation V',
        games: 'Black/White/B2W2',
        artwork: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/52/latest/20160807181651/Artwork_Pok%C3%A9mon_Negro_Blanco.png/300px-Artwork_Pok%C3%A9mon_Negro_Blanco.png'
    },
    {
        id: 6,
        roman: 'VI',
        name: 'Kalos',
        fullName: 'Generation VI',
        games: 'X/Y/ORAS',
        artwork: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/c/c7/latest/20160807181741/Artwork_Pok%C3%A9mon_X_Y.png/300px-Artwork_Pok%C3%A9mon_X_Y.png'
    },
    {
        id: 7,
        roman: 'VII',
        name: 'Alola',
        fullName: 'Generation VII',
        games: 'Sun/Moon/USUM',
        artwork: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/1/1f/latest/20160807181825/Artwork_Pok%C3%A9mon_Sol_Luna.png/300px-Artwork_Pok%C3%A9mon_Sol_Luna.png'
    }
];

// Generation Roman numerals for display
const generationRomanNumerals = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII'
};

// Validate if a Pokemon name is valid for the current generation
function isPokemonValidForGeneration(pokemonName, generation) {
    const cleanName = pokemonName.toLowerCase().trim();
    const validNames = getPokemonNamesUpToGen(generation).map(name => name.toLowerCase());
    return validNames.includes(cleanName);
}

// Initialize the carousel
function initializeCarousel() {
    const track = document.getElementById('carousel-track');
    const indicators = document.getElementById('carousel-indicators');
    
    // Clear existing content
    track.innerHTML = '';
    indicators.innerHTML = '';
    
    // Create slides
    generationData.forEach((gen, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.onclick = () => selectGeneration(gen.id);
        
        slide.innerHTML = `
            <img src="${gen.artwork}" 
                 alt="${gen.fullName}" 
                 class="generation-artwork"
                 onerror="this.src='https://via.placeholder.com/120x120/78c850/ffffff?text=Gen+${gen.roman}'">
            <div class="generation-info">
                <div class="generation-number">${gen.roman}</div>
                <div class="generation-name">${gen.fullName}</div>
                <div class="generation-games">${gen.games}</div>
            </div>
        `;
        
        track.appendChild(slide);
        
        // Create indicator dot
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        indicators.appendChild(dot);
    });
    
    currentCarouselIndex = 0;
    totalCarouselSlides = generationData.length;
    updateCarouselPosition();
    
    // Properly select the initial generation (Generation 1) with a small delay to ensure DOM is ready
    setTimeout(() => {
        selectGeneration(generationData[0].id);
    }, 100);
}

// Update carousel position
function updateCarouselPosition() {
    const track = document.getElementById('carousel-track');
    const slides = track.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    // Update track position
    track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    
    // Update active states
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentCarouselIndex);
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCarouselIndex);
    });
}

// Navigate to previous generation
function previousGeneration() {
    currentCarouselIndex = (currentCarouselIndex - 1 + totalCarouselSlides) % totalCarouselSlides;
    updateCarouselPosition();
    
    // Always update the game options when cycling through
    const currentGen = generationData[currentCarouselIndex];
    updateGameOptionsForGeneration(currentGen.id);
}

// Navigate to next generation
function nextGeneration() {
    currentCarouselIndex = (currentCarouselIndex + 1) % totalCarouselSlides;
    updateCarouselPosition();
    
    // Always update the game options when cycling through
    const currentGen = generationData[currentCarouselIndex];
    updateGameOptionsForGeneration(currentGen.id);
}

// Go to specific slide
function goToSlide(index) {
    currentCarouselIndex = index;
    updateCarouselPosition();
    
    // Update the game options for the selected generation
    const currentGen = generationData[currentCarouselIndex];
    updateGameOptionsForGeneration(currentGen.id);
}

// Update game options for a generation and auto-select when appropriate
function updateGameOptionsForGeneration(gen) {
    // Auto-select this generation when browsing
    selectedGeneration = gen;
    
    // Update Pokemon names immediately for autocomplete
    updatePokemonNamesForGeneration(gen);
    
    // Show game options
    const gameContainer = document.getElementById('game-select-container');
    const gameOptions = document.getElementById('game-options');
    gameContainer.style.display = 'block';
    
    const games = getGamesForGeneration(gen);
    gameOptions.innerHTML = '';
    
    games.forEach(game => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = game.name;
        btn.onclick = () => selectGame(game.key);
        gameOptions.appendChild(btn);
    });
    
    // Update evolution lines for preview
    if (typeof updateEvolutionLinesForGeneration === 'function') {
        updateEvolutionLinesForGeneration(gen);
    }
    
    // If there's only one game for this generation, auto-select it
    if (games.length === 1) {
        // Use setTimeout to ensure DOM is ready before selecting
        setTimeout(() => {
            selectGame(games[0].key);
        }, 0);
    } else {
        // Reset game selection state for multiple games
        selectedGame = null;
        document.querySelectorAll('.game-option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('start-tracker').disabled = true;
    }
}

// Get available games for a generation
function getGamesForGeneration(generation) {
    const games = [];
    for (const [key, value] of Object.entries(gameRoutes)) {
        if (value.generation === generation) {
            games.push({ key, ...value });
        }
    }
    return games;
}

// Select generation in the carousel
function selectGeneration(gen) {
    selectedGeneration = gen;
    
    // Update Pokemon names immediately for autocomplete
    updatePokemonNamesForGeneration(gen);
    
    // Update carousel position to match selection
    const genIndex = generationData.findIndex(g => g.id === gen);
    if (genIndex !== -1 && genIndex !== currentCarouselIndex) {
        currentCarouselIndex = genIndex;
        updateCarouselPosition();
    }
    
    // Show game options
    const gameContainer = document.getElementById('game-select-container');
    const gameOptions = document.getElementById('game-options');
    gameContainer.style.display = 'block';
    
    const games = getGamesForGeneration(gen);
    gameOptions.innerHTML = '';
    
    games.forEach(game => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = game.name;
        btn.onclick = () => selectGame(game.key);
        gameOptions.appendChild(btn);
    });
    
    // Update evolution lines for the selected generation
    if (typeof updateEvolutionLinesForGeneration === 'function') {
        updateEvolutionLinesForGeneration(gen);
    }
    
    // If there's only one game for this generation, auto-select it
    if (games.length === 1) {
        selectGame(games[0].key);
    } else {
        // Reset game selection
        selectedGame = null;
        document.getElementById('start-tracker').disabled = true;
    }
    
    console.log(`Selected Generation ${gen}. Pokemon available: ${pokemonNames.length}`);
}

// Select game in the modal
function selectGame(gameKey) {
    selectedGame = gameKey;
    
    // Update UI
    document.querySelectorAll('.game-option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === gameRoutes[gameKey].name) {
            btn.classList.add('selected');
        }
    });
    
    // Enable start button
    document.getElementById('start-tracker').disabled = false;
}

// Start the tracker with selected generation and game
function startTracker() {
    if (!selectedGeneration || !selectedGame) return;
    
    gameData.currentGeneration = selectedGeneration;
    gameData.currentGame = selectedGame;
    
    // Update Pokemon names and evolution lines
    updatePokemonNamesForGeneration(selectedGeneration);
    if (typeof updateEvolutionLinesForGeneration === 'function') {
        updateEvolutionLinesForGeneration(selectedGeneration);
    }
    
    saveData();
    
    // Hide modal
    document.getElementById('generation-selector-modal').style.display = 'none';
    
    // Initialize the main app
    initializeApp();
    
    // Refresh autocomplete to ensure it uses the correct generation
    refreshAutocomplete();
    
    // Show welcome toast
    showToast(`Started tracking Generation ${generationRomanNumerals[selectedGeneration]} - ${gameRoutes[selectedGame].name}!`, 'success');
}

// Get current routes based on selected game
function getCurrentRoutes() {
    return gameRoutes[gameData.currentGame]?.routes || [];
}

// Switch between games (only available when no Pokemon caught)
function switchGame() {
    const gameSelect = document.getElementById('game-select');
    const newGame = gameSelect.value;
    
    // Check if there's data that would be lost
    const hasData = gameData.player1.caught.length > 0 || gameData.player2.caught.length > 0;
    
    if (hasData && newGame !== gameData.currentGame) {
        showToast('Cannot switch games after catching Pokemon! Please clear all data first.', 'error');
        gameSelect.value = gameData.currentGame;
        return;
    }
    
    gameData.currentGame = newGame;
    gameData.currentGeneration = gameRoutes[newGame].generation;
    
    // Update Pokemon names and evolution lines
    updatePokemonNamesForGeneration(gameData.currentGeneration);
    if (typeof updateEvolutionLinesForGeneration === 'function') {
        updateEvolutionLinesForGeneration(gameData.currentGeneration);
    }
    
    saveData();
    populateRoutes();
    updateRouteSelector();
    updateCounts();
    updateGenerationDisplay();
    refreshAutocomplete();
    
    showToast(`Switched to ${gameRoutes[newGame].name}!`, 'info');
}

// Update generation display badge
function updateGenerationDisplay() {
    const display = document.getElementById('generation-display');
    if (gameData.currentGeneration) {
        display.textContent = `Gen ${generationRomanNumerals[gameData.currentGeneration]}`;
    } else {
        display.textContent = '';
    }
}

// Initialize game selector
function initializeGameSelector() {
    const gameSelect = document.getElementById('game-select');
    gameSelect.innerHTML = '';
    
    // Only show games from the current generation
    if (gameData.currentGeneration) {
        const games = getGamesForGeneration(gameData.currentGeneration);
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.key;
            option.textContent = game.name;
            gameSelect.appendChild(option);
        });
        
        gameSelect.value = gameData.currentGame || games[0].key;
        
        // Show the game selector if there are multiple games for this generation
        if (games.length > 1 && gameData.player1.caught.length === 0 && gameData.player2.caught.length === 0) {
            document.getElementById('game-selector-ingame').style.display = 'block';
        }
    }
}

// Add keyboard navigation for carousel
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('generation-selector-modal');
    if (modal.style.display !== 'none') {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousGeneration();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextGeneration();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const currentGen = generationData[currentCarouselIndex];
            selectGeneration(currentGen.id);
        }
    }
});

// Get appropriate sprite URL based on generation
function getSpriteUrl(pokemonName, generation = null) {
    const gen = generation || gameData.currentGeneration || 3;
    const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
    
    // For now, we'll use the default sprites
    // In a full implementation, you'd fetch generation-specific sprites
    return `${baseUrl}/${pokemonName}.png`;
}

// Fetch Pokemon data from PokeAPI with generation awareness
async function getPokemonData(name) {
    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    
    if (pokemonCache[cleanName]) {
        return pokemonCache[cleanName];
    }
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
        if (!response.ok) {
            throw new Error('Pokemon not found');
        }
        
        const data = await response.json();
        const pokemonData = {
            name: data.name,
            displayName: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            sprite: data.sprites.front_default,
            animatedSprite: data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || data.sprites.front_default,
            types: data.types.map(t => t.type.name)
        };
        
        // Try to get generation-specific sprite
        const gen = gameData.currentGeneration;
        if (gen) {
            const genSprites = getGenerationSpecificSprite(data.sprites, gen);
            if (genSprites) {
                pokemonData.sprite = genSprites;
            }
        }
        
        pokemonCache[cleanName] = pokemonData;
        return pokemonData;
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        return null;
    }
}

// Get generation-specific sprite from sprite data
function getGenerationSpecificSprite(sprites, generation) {
    switch (generation) {
        case 1:
            return sprites.versions?.['generation-i']?.['red-blue']?.front_default || 
                   sprites.versions?.['generation-i']?.['yellow']?.front_default ||
                   sprites.front_default;
        case 2:
            return sprites.versions?.['generation-ii']?.['crystal']?.front_default ||
                   sprites.versions?.['generation-ii']?.['gold']?.front_default ||
                   sprites.front_default;
        case 3:
            return sprites.versions?.['generation-iii']?.['emerald']?.front_default ||
                   sprites.versions?.['generation-iii']?.['ruby-sapphire']?.front_default ||
                   sprites.front_default;
        case 4:
            return sprites.versions?.['generation-iv']?.['platinum']?.front_default ||
                   sprites.versions?.['generation-iv']?.['diamond-pearl']?.front_default ||
                   sprites.front_default;
        case 5:
            return sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
                   sprites.versions?.['generation-v']?.['black-white']?.front_default ||
                   sprites.front_default;
        case 6:
            return sprites.versions?.['generation-vi']?.['x-y']?.front_default ||
                   sprites.versions?.['generation-vi']?.['omegaruby-alphasapphire']?.front_default ||
                   sprites.front_default;
        case 7:
            return sprites.versions?.['generation-vii']?.['ultra-sun-ultra-moon']?.front_default ||
                   sprites.versions?.['generation-vii']?.['icons']?.front_default ||
                   sprites.front_default;
        default:
            return sprites.front_default;
    }
}

// Check if a Pokemon or any from its evolution line is already caught by a player
function isPokemonOrEvolutionCaught(pokemonName, player) {
    const cleanName = pokemonName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const playerData = gameData[`player${player}`];
    
    // Get the evolution line for this Pokemon
    const evolutionLine = evolutionLines[cleanName] || [cleanName];
    
    // Check if any Pokemon in the evolution line is already caught
    for (let caught of playerData.caught) {
        const caughtCleanName = caught.name.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (evolutionLine.includes(caughtCleanName)) {
            return {
                caught: true,
                caughtName: caught.nickname || caught.displayName
            };
        }
    }
    
    return {
        caught: false,
        caughtName: null
    };
}

// Initialize the main application
function initializeApp() {
    populateRoutes();
    renderAll();
    updateRouteSelector();
    setupAutocomplete();
    updateCounts();
    updatePlayerNameDisplays();
    updateStrictModeUI();
    updateGenerationDisplay();
    initializeGameSelector();
    
    // Show initialization toast
    showToast('App initialized successfully!', 'info');
}

// Initialize on page load
window.onload = function () {
    console.log('Loading app...');
    loadData();
    
    // Check if we need to show generation selector or main app
    if (!gameData.currentGeneration || !gameData.currentGame) {
        // Initialize and show carousel for new users
        console.log('Showing generation selector for new user');
        initializeCarousel();
        document.getElementById('generation-selector-modal').style.display = 'flex';
    } else {
        // Initialize main app for returning users
        console.log('Initializing main app for returning user');
        initializeApp();
    }
};

// Update Pokemon counts
function updateCounts() {
    const currentRoutes = getCurrentRoutes();
    const totalRoutes = currentRoutes.length;
    const completedRoutes = gameData.usedRoutes.length + gameData.failedRoutes.length;
    
    // Count fainted soul link pairs + individual fainted Pokemon
    const faintedSoulLinkPairs = gameData.soulLinks.filter(link =>
        link.pokemon1.fainted || link.pokemon2.fainted
    ).length;
    
    // Get IDs of all Pokemon in soul links to avoid double counting
    const soulLinkedPokemonIds = new Set();
    gameData.soulLinks.forEach(link => {
        soulLinkedPokemonIds.add(link.pokemon1.id);
        soulLinkedPokemonIds.add(link.pokemon2.id);
    });
    
    // Count individual fainted Pokemon (not in soul links)
    const individualFaintedCount = [
        ...gameData.player1.caught.filter(p => p.fainted && !soulLinkedPokemonIds.has(p.id)),
        ...gameData.player2.caught.filter(p => p.fainted && !soulLinkedPokemonIds.has(p.id))
    ].length;
    
    const totalFaintedCount = faintedSoulLinkPairs + individualFaintedCount;
    
    // Count failed encounters
    const failedSoulLinkPairs = gameData.soulLinks.filter(link =>
        link.pokemon1.failedToCache || link.pokemon2.failedToCache
    ).length;
    
    const individualFailedCount = [
        ...gameData.player1.caught.filter(p => p.failedToCache && !soulLinkedPokemonIds.has(p.id)),
        ...gameData.player2.caught.filter(p => p.failedToCache && !soulLinkedPokemonIds.has(p.id))
    ].length;
    
    const totalFailedCount = failedSoulLinkPairs + individualFailedCount;
    
    // Count available soul links
    const availableLinks = gameData.soulLinks.filter(link =>
        !link.pokemon1.fainted && !link.pokemon2.fainted &&
        !link.pokemon1.failedToCache && !link.pokemon2.failedToCache
    ).length;
    
    document.getElementById('routes-completed').textContent = `${completedRoutes}/${totalRoutes}`;
    document.getElementById('fainted-count').textContent = totalFaintedCount;
    document.getElementById('failed-encounters').textContent = totalFailedCount;
    document.getElementById('available-links').textContent = availableLinks;
}

// Replace the updatePokemonNamesForGeneration function
function updatePokemonNamesForGeneration(generation) {
    pokemonNames = getPokemonNamesUpToGen(generation);
    
    // Clear any existing autocomplete dropdowns to force refresh
    const dropdowns = document.querySelectorAll('.autocomplete-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
    });
    
    console.log(`Updated Pokemon names for Generation ${generation}. Available Pokemon: ${pokemonNames.length}`);
}

// Add a helper function to refresh autocomplete after generation changes
function refreshAutocomplete() {
    // Clear existing autocomplete dropdowns
    const dropdowns = document.querySelectorAll('.autocomplete-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
    });
    
    // Clear input values if they contain invalid Pokemon for current generation
    const player1Input = document.getElementById('player1-pokemon');
    const player2Input = document.getElementById('player2-pokemon');
    
    if (player1Input && player1Input.value) {
        if (!isPokemonValidForGeneration(player1Input.value, gameData.currentGeneration)) {
            player1Input.value = '';
        }
    }
    
    if (player2Input && player2Input.value) {
        if (!isPokemonValidForGeneration(player2Input.value, gameData.currentGeneration)) {
            player2Input.value = '';
        }
    }
}

// Simple autocomplete setup
function setupAutocomplete() {
    setupInputAutocomplete('player1-pokemon', 'player1-dropdown');
    setupInputAutocomplete('player2-pokemon', 'player2-dropdown');
}

// Update the setupInputAutocomplete function to better handle generation filtering
function setupInputAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    let currentFocus = -1;
    
    // Handle input events
    input.addEventListener('input', function () {
        const value = this.value.toLowerCase().trim();
        dropdown.innerHTML = '';
        currentFocus = -1;
        
        if (value.length < 1) {
            dropdown.style.display = 'none';
            return;
        }
        
        // Get current generation's Pokemon names
        const currentGenPokemon = gameData.currentGeneration 
            ? getPokemonNamesUpToGen(gameData.currentGeneration)
            : pokemonNames;
        
        // Filter Pokemon names - only show those available in current generation
        const matches = currentGenPokemon.filter(name =>
            name.toLowerCase().includes(value)
        ).slice(0, 10); // Show max 10 suggestions
        
        if (matches.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        
        // Create dropdown items
        matches.forEach((name, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = name;
            item.addEventListener('click', function () {
                input.value = name;
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(item);
        });
        
        dropdown.style.display = 'block';
    });
    
    // Handle keyboard navigation
    input.addEventListener('keydown', function (e) {
        const items = dropdown.getElementsByClassName('autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            addActive(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            addActive(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1 && items[currentFocus]) {
                items[currentFocus].click();
            }
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
            currentFocus = -1;
        }
    });
    
    // Highlight active item
    function addActive(items) {
        if (!items) return;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        items[currentFocus].classList.add('selected');
    }
    
    // Remove active highlighting
    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('selected');
        }
    }
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (e.target !== input) {
            dropdown.style.display = 'none';
            currentFocus = -1;
        }
    });
}

// Populate route dropdown
function populateRoutes() {
    const select = document.getElementById('current-route');
    select.innerHTML = '<option value="">Select Route</option>';
    
    const currentRoutes = getCurrentRoutes();
    
    currentRoutes.forEach(route => {
        const option = document.createElement('option');
        option.value = route;
        option.textContent = route;
        
        // Check if route is completed or failed
        if (gameData.usedRoutes.includes(route)) {
            option.disabled = true;
            option.textContent += ' (Completed)';
            option.style.color = '#999';
        } else if (gameData.failedRoutes.some(failed => failed.route === route)) {
            option.disabled = true;
            option.textContent += ' (Failed)';
            option.className = 'failed';
            option.style.color = '#e74c3c';
        }
        
        select.appendChild(option);
    });
}

// Update route selector status and buttons
function updateRouteSelector() {
    const routeSelect = document.getElementById('current-route');
    const statusDiv = document.getElementById('route-status');
    const addButton = document.getElementById('add-both-btn');
    const failedButton = document.getElementById('failed-btn');
    
    const selectedRoute = routeSelect.value;
    
    if (!selectedRoute) {
        statusDiv.textContent = 'Select a route to add Pokemon';
        addButton.disabled = true;
        failedButton.disabled = true;
    } else if (gameData.usedRoutes.includes(selectedRoute)) {
        statusDiv.textContent = 'This route is already completed!';
        addButton.disabled = true;
        failedButton.disabled = true;
    } else if (gameData.failedRoutes.some(failed => failed.route === selectedRoute)) {
        statusDiv.textContent = 'This route already failed!';
        addButton.disabled = true;
        failedButton.disabled = true;
    } else {
        statusDiv.textContent = `Ready to add Pokemon to ${selectedRoute}`;
        addButton.disabled = false;
        failedButton.disabled = false;
    }
}

// Add event listener to route selector
document.addEventListener('DOMContentLoaded', function() {
    const routeSelect = document.getElementById('current-route');
    if (routeSelect) {
        routeSelect.addEventListener('change', updateRouteSelector);
    }
});

// Updated addFailedEncounter function with generation validation
async function addFailedEncounter() {
    const route = document.getElementById('current-route').value;
    const pokemon1Name = document.getElementById('player1-pokemon').value;
    const nickname1 = document.getElementById('player1-nickname').value;
    const pokemon2Name = document.getElementById('player2-pokemon').value;
    const nickname2 = document.getElementById('player2-nickname').value;
    
    if (!route) {
        showToast('Please select a route', 'error');
        return;
    }
    
    if (!pokemon1Name || !pokemon2Name) {
        showToast('Please enter Pokemon names for both players to record the failed encounter', 'error');
        return;
    }
    
    if (gameData.usedRoutes.includes(route)) {
        showToast('This route has already been completed!', 'error');
        return;
    }
    
    if (gameData.failedRoutes.some(failed => failed.route === route)) {
        showToast('This route has already been marked as failed!', 'error');
        return;
    }
    
    // Validate Pokemon are from correct generation
    if (!isPokemonValidForGeneration(pokemon1Name, gameData.currentGeneration)) {
        showToast(`${pokemon1Name} is not available in Generation ${generationRomanNumerals[gameData.currentGeneration]}!`, 'error');
        return;
    }
    
    if (!isPokemonValidForGeneration(pokemon2Name, gameData.currentGeneration)) {
        showToast(`${pokemon2Name} is not available in Generation ${generationRomanNumerals[gameData.currentGeneration]}!`, 'error');
        return;
    }
    
    // Check evolution line restrictions for both players
    const evolution1Check = isPokemonOrEvolutionCaught(pokemon1Name, 1);
    if (evolution1Check.caught) {
        showToast(`${gameData.playerNames.player1} cannot encounter ${pokemon1Name} - already has ${evolution1Check.caughtName} from same evolution line`, 'error');
        return;
    }
    
    const evolution2Check = isPokemonOrEvolutionCaught(pokemon2Name, 2);
    if (evolution2Check.caught) {
        showToast(`${gameData.playerNames.player2} cannot encounter ${pokemon2Name} - already has ${evolution2Check.caughtName} from same evolution line`, 'error');
        return;
    }
    
    // Fetch Pokemon data
    const pokemonData1 = await getPokemonData(pokemon1Name);
    const pokemonData2 = await getPokemonData(pokemon2Name);
    
    if (!pokemonData1 || !pokemonData2) {
        showToast('One or both Pokemon not found! Please check the spelling.', 'error');
        return;
    }
    
    // Create failed encounter objects
    const failedPokemon1 = {
        id: Date.now() + Math.random(),
        route: route,
        name: pokemonData1.name,
        displayName: pokemonData1.displayName,
        nickname: nickname1 || pokemonData1.displayName,
        sprite: pokemonData1.sprite,
        animatedSprite: pokemonData1.animatedSprite,
        types: pokemonData1.types,
        player: 1,
        fainted: false,
        failedToCache: true // Mark as failed to catch
    };
    
    const failedPokemon2 = {
        id: Date.now() + Math.random() + 1,
        route: route,
        name: pokemonData2.name,
        displayName: pokemonData2.displayName,
        nickname: nickname2 || pokemonData2.displayName,
        sprite: pokemonData2.sprite,
        animatedSprite: pokemonData2.animatedSprite,
        types: pokemonData2.types,
        player: 2,
        fainted: false,
        failedToCache: true // Mark as failed to catch
    };
    
    // Add to caught lists
    gameData.player1.caught.push(failedPokemon1);
    gameData.player2.caught.push(failedPokemon2);
    
    // Create soul link
    gameData.soulLinks.push({
        pokemon1: failedPokemon1,
        pokemon2: failedPokemon2
    });
    
    // Create a failed route record
    const failedRoute = {
        route: route,
        pokemon1: failedPokemon1,
        pokemon2: failedPokemon2,
        timestamp: new Date().toISOString()
    };
    
    gameData.failedRoutes.push(failedRoute);
    
    // Clear inputs
    document.getElementById('player1-pokemon').value = '';
    document.getElementById('player1-nickname').value = '';
    document.getElementById('player2-pokemon').value = '';
    document.getElementById('player2-nickname').value = '';
    document.getElementById('current-route').value = '';
    
    saveData();
    populateRoutes();
    renderAll();
    updateRouteSelector();
    updateCounts();
    
    showToast(`Failed encounter recorded for ${route} - ${failedPokemon1.nickname} and ${failedPokemon2.nickname} fainted during capture`, 'warning');
}

// Updated addBothPokemon function with generation validation
async function addBothPokemon() {
    const route = document.getElementById('current-route').value;
    const pokemon1Name = document.getElementById('player1-pokemon').value;
    const nickname1 = document.getElementById('player1-nickname').value;
    const pokemon2Name = document.getElementById('player2-pokemon').value;
    const nickname2 = document.getElementById('player2-nickname').value;
    
    if (!route) {
        showToast('Please select a route', 'error');
        return;
    }
    
    if (!pokemon1Name || !pokemon2Name) {
        showToast('Please enter Pokemon names for both players', 'error');
        return;
    }
    
    if (gameData.usedRoutes.includes(route)) {
        showToast('This route has already been completed!', 'error');
        return;
    }
    
    if (gameData.failedRoutes.some(failed => failed.route === route)) {
        showToast('This route has already been marked as failed!', 'error');
        return;
    }
    
    // Validate Pokemon are from correct generation
    if (!isPokemonValidForGeneration(pokemon1Name, gameData.currentGeneration)) {
        showToast(`${pokemon1Name} is not available in Generation ${generationRomanNumerals[gameData.currentGeneration]}!`, 'error');
        return;
    }
    
    if (!isPokemonValidForGeneration(pokemon2Name, gameData.currentGeneration)) {
        showToast(`${pokemon2Name} is not available in Generation ${generationRomanNumerals[gameData.currentGeneration]}!`, 'error');
        return;
    }
    
    // Check evolution line restrictions
    const evolution1Check = isPokemonOrEvolutionCaught(pokemon1Name, 1);
    if (evolution1Check.caught) {
        showToast(`${gameData.playerNames.player1} cannot catch ${pokemon1Name} - already has ${evolution1Check.caughtName} from same evolution line`, 'error');
        return;
    }
    
    const evolution2Check = isPokemonOrEvolutionCaught(pokemon2Name, 2);
    if (evolution2Check.caught) {
        showToast(`${gameData.playerNames.player2} cannot catch ${pokemon2Name} - already has ${evolution2Check.caughtName} from same evolution line`, 'error');
        return;
    }
    
    // Fetch Pokemon data
    const pokemonData1 = await getPokemonData(pokemon1Name);
    const pokemonData2 = await getPokemonData(pokemon2Name);
    
    if (!pokemonData1 || !pokemonData2) {
        showToast('One or both Pokemon not found! Please check the spelling.', 'error');
        return;
    }
    
    // Create Pokemon objects
    const pokemon1 = {
        id: Date.now() + Math.random(),
        route: route,
        name: pokemonData1.name,
        displayName: pokemonData1.displayName,
        nickname: nickname1 || pokemonData1.displayName,
        sprite: pokemonData1.sprite,
        animatedSprite: pokemonData1.animatedSprite,
        types: pokemonData1.types,
        player: 1,
        fainted: false,
        failedToCache: false
    };
    
    const pokemon2 = {
        id: Date.now() + Math.random() + 1,
        route: route,
        name: pokemonData2.name,
        displayName: pokemonData2.displayName,
        nickname: nickname2 || pokemonData2.displayName,
        sprite: pokemonData2.sprite,
        animatedSprite: pokemonData2.animatedSprite,
        types: pokemonData2.types,
        player: 2,
        fainted: false,
        failedToCache: false
    };
    
    // Add to caught lists
    gameData.player1.caught.push(pokemon1);
    gameData.player2.caught.push(pokemon2);
    
    // Create soul link
    gameData.soulLinks.push({
        pokemon1: pokemon1,
        pokemon2: pokemon2
    });
    
    // Mark route as used
    gameData.usedRoutes.push(route);
    
    // Clear inputs
    document.getElementById('player1-pokemon').value = '';
    document.getElementById('player1-nickname').value = '';
    document.getElementById('player2-pokemon').value = '';
    document.getElementById('player2-nickname').value = '';
    document.getElementById('current-route').value = '';
    
    saveData();
    populateRoutes();
    renderAll();
    updateRouteSelector();
    updateCounts();
    
    showToast(`Soul Link created: ${pokemon1.nickname} ⟷ ${pokemon2.nickname} on ${route}`, 'success');
}

// Render all UI elements
function renderAll() {
    renderTeams();
    renderAvailablePokemon();
    updateCounts();
}

// Helper function to find a Pokemon in the caught arrays by ID
function findPokemonById(pokemonId) {
    let pokemon = gameData.player1.caught.find(p => p.id.toString() === pokemonId.toString());
    if (pokemon) return { pokemon: pokemon, player: 1 };
    
    pokemon = gameData.player2.caught.find(p => p.id.toString() === pokemonId.toString());
    if (pokemon) return { pokemon: pokemon, player: 2 };
    
    return null;
}

// Faint a Pokemon and its soul link partner
function faintPokemon(player, pokemonId) {
    if (!confirm('Mark this Pokemon as fainted? This will also faint its soul-linked partner and remove both from all teams!')) return;
    
    const pokemonInfo = findPokemonById(pokemonId);
    if (!pokemonInfo) {
        console.error('Pokemon not found:', pokemonId);
        return;
    }
    
    const pokemon = pokemonInfo.pokemon;
    
    // Find the soul link containing this Pokemon
    const soulLink = gameData.soulLinks.find(link =>
        link.pokemon1.id.toString() === pokemonId.toString() || link.pokemon2.id.toString() === pokemonId.toString()
    );
    
    let partnerPokemon = null;
    
    if (soulLink) {
        partnerPokemon = soulLink.pokemon1.id.toString() === pokemonId.toString() ? soulLink.pokemon2 : soulLink.pokemon1;
        
        const partnerInfo = findPokemonById(partnerPokemon.id);
        if (partnerInfo) {
            partnerInfo.pokemon.fainted = true;
            if (soulLink.pokemon1.id.toString() === partnerPokemon.id.toString()) {
                soulLink.pokemon1.fainted = true;
            } else {
                soulLink.pokemon2.fainted = true;
            }
        }
    }
    
    pokemon.fainted = true;
    if (soulLink) {
        if (soulLink.pokemon1.id.toString() === pokemonId.toString()) {
            soulLink.pokemon1.fainted = true;
        } else {
            soulLink.pokemon2.fainted = true;
        }
    }
    
    // Remove both Pokemon from teams
    [1, 2].forEach(p => {
        const team = gameData[`player${p}`].team;
        for (let i = 0; i < team.length; i++) {
            if (team[i] && (team[i].id.toString() === pokemonId.toString() ||
                (partnerPokemon && team[i].id.toString() === partnerPokemon.id.toString()))) {
                team[i] = null;
            }
        }
    });
    
    saveData();
    renderAll();
    
    if (partnerPokemon) {
        showToast(`${pokemon.nickname} and ${partnerPokemon.nickname} have both fainted and been removed from teams`, 'error');
    } else {
        showToast(`${pokemon.nickname} has fainted and been removed from team`, 'error');
    }
}

// Revive a Pokemon and its soul link partner
function revivePokemon(player, pokemonId) {
    if (!confirm('Revive this Pokemon? This will also revive its soul-linked partner!')) return;
    
    const pokemonInfo = findPokemonById(pokemonId);
    if (!pokemonInfo) {
        console.error('Pokemon not found:', pokemonId);
        showToast('Error: Pokemon not found!', 'error');
        return;
    }
    
    const pokemon = pokemonInfo.pokemon;
    
    // Find the soul link containing this Pokemon
    const soulLink = gameData.soulLinks.find(link =>
        link.pokemon1.id.toString() === pokemonId.toString() || link.pokemon2.id.toString() === pokemonId.toString()
    );
    
    let partnerPokemon = null;
    
    if (soulLink) {
        partnerPokemon = soulLink.pokemon1.id.toString() === pokemonId.toString() ? soulLink.pokemon2 : soulLink.pokemon1;
        
        const partnerInfo = findPokemonById(partnerPokemon.id);
        if (partnerInfo) {
            partnerInfo.pokemon.fainted = false;
            if (soulLink.pokemon1.id.toString() === partnerPokemon.id.toString()) {
                soulLink.pokemon1.fainted = false;
            } else {
                soulLink.pokemon2.fainted = false;
            }
        }
    }
    
    pokemon.fainted = false;
    if (soulLink) {
        if (soulLink.pokemon1.id.toString() === pokemonId.toString()) {
            soulLink.pokemon1.fainted = false;
        } else {
            soulLink.pokemon2.fainted = false;
        }
    }
    
    saveData();
    renderAll();
    
    if (partnerPokemon) {
        showToast(`${pokemon.nickname} and ${partnerPokemon.nickname} have been revived!`, 'success');
    } else {
        showToast(`${pokemon.nickname} has been revived!`, 'success');
    }
}

// Delete a Pokemon
function deletePokemon(player, pokemonId) {
    if (!confirm('Delete this Pokemon and its soul link?')) return;
    
    const playerData = gameData[`player${player}`];
    const pokemon = playerData.caught.find(p => p.id.toString() === pokemonId.toString());
    
    // Find the soul link containing this Pokemon
    const soulLink = gameData.soulLinks.find(link =>
        link.pokemon1.id.toString() === pokemonId.toString() || link.pokemon2.id.toString() === pokemonId.toString()
    );
    
    let partnerPokemon = null;
    let partnerPlayer = null;
    
    if (soulLink) {
        partnerPokemon = soulLink.pokemon1.id.toString() === pokemonId.toString() ? soulLink.pokemon2 : soulLink.pokemon1;
        partnerPlayer = partnerPokemon.player || (player === 1 ? 2 : 1);
    }
    
    if (pokemon) {
        // Check if this was a failed encounter and remove from failedRoutes
        if (pokemon.failedToCache) {
            gameData.failedRoutes = gameData.failedRoutes.filter(failed =>
                failed.pokemon1.id.toString() !== pokemonId.toString() &&
                failed.pokemon2.id.toString() !== pokemonId.toString()
            );
        } else {
            // Remove route from used routes only if it was a successful catch
            gameData.usedRoutes = gameData.usedRoutes.filter(route => route !== pokemon.route);
        }
    }
    
    // Remove the clicked Pokemon from its player's data
    playerData.caught = playerData.caught.filter(p => p.id.toString() !== pokemonId.toString());
    playerData.team = playerData.team.map(p => p && p.id.toString() === pokemonId.toString() ? null : p);
    
    // If there's a soul-linked partner, remove it from the other player's data
    if (partnerPokemon && partnerPlayer) {
        const partnerPlayerData = gameData[`player${partnerPlayer}`];
        partnerPlayerData.caught = partnerPlayerData.caught.filter(p => p.id.toString() !== partnerPokemon.id.toString());
        partnerPlayerData.team = partnerPlayerData.team.map(p => p && p.id.toString() === partnerPokemon.id.toString() ? null : p);
    }
    
    // Remove the soul link
    gameData.soulLinks = gameData.soulLinks.filter(link =>
        link.pokemon1.id.toString() !== pokemonId.toString() && link.pokemon2.id.toString() !== pokemonId.toString()
    );
    
    saveData();
    populateRoutes();
    renderAll();
    updateRouteSelector();
    
    if (partnerPokemon) {
        showToast(`Deleted ${pokemon.nickname} and ${partnerPokemon.nickname} soul link pair`, 'info');
    } else {
        showToast(`Deleted ${pokemon.nickname}`, 'info');
    }
}

// Clear team slot
function clearTeamSlot(player, slot) {
    const team = gameData[`player${player}`].team;
    const pokemon = team[slot];
    
    if (pokemon) {
        // Find if this Pokemon has a soul link
        const soulLink = gameData.soulLinks.find(link =>
            link.pokemon1.id.toString() === pokemon.id.toString() || link.pokemon2.id.toString() === pokemon.id.toString()
        );
        
        let confirmMessage = 'Remove this Pokemon from the team?';
        let partnerPokemon = null;
        let otherPlayer = null;
        
        if (soulLink) {
            partnerPokemon = soulLink.pokemon1.id.toString() === pokemon.id.toString() ? soulLink.pokemon2 : soulLink.pokemon1;
            otherPlayer = player === 1 ? 2 : 1;
            confirmMessage = `Remove ${pokemon.nickname} and its soul-linked partner ${partnerPokemon.nickname} from both teams?`;
        }
        
        if (confirm(confirmMessage)) {
            team[slot] = null;
            
            if (partnerPokemon && otherPlayer) {
                const otherTeam = gameData[`player${otherPlayer}`].team;
                for (let i = 0; i < otherTeam.length; i++) {
                    if (otherTeam[i] && otherTeam[i].id.toString() === partnerPokemon.id.toString()) {
                        otherTeam[i] = null;
                        break;
                    }
                }
            }
            
            saveData();
            renderAll();
            
            if (partnerPokemon) {
                showToast(`Removed ${pokemon.nickname} and ${partnerPokemon.nickname} from teams`, 'info');
            } else {
                showToast(`Removed ${pokemon.nickname} from team`, 'info');
            }
        }
    }
}

// Render team slots
function renderTeams() {
    // Get strict mode violations
    const violations = checkStrictModeViolations();
    
    [1, 2].forEach(player => {
        const teamContainer = document.getElementById(`player${player}-team`);
        const slots = teamContainer.querySelectorAll('.team-slot');
        const team = gameData[`player${player}`].team;
        
        slots.forEach((slot, index) => {
            const pokemon = team[index];
            if (pokemon) {
                const isFainted = pokemon.fainted;
                
                // Check if this Pokemon violates strict mode
                const hasViolation = violations.some(v =>
                    v.player === player && v.slot === index
                );
                
                let className = `team-slot filled`;
                if (isFainted) {
                    className += ' fainted';
                }
                if (hasViolation) {
                    className += ' strict-violation';
                }
                
                slot.className = className;
                
                let overlayClass = '';
                if (isFainted) overlayClass += 'fainted-overlay ';
                if (hasViolation) overlayClass += 'strict-violation-overlay ';
                
                slot.innerHTML = `
                    <div class="${overlayClass}" style="position: relative;">
                        <img src="${pokemon.animatedSprite || pokemon.sprite}" class="pokemon-sprite" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                    </div>
                    <div>${pokemon.nickname}${isFainted ? ' (Fainted)' : ''}${hasViolation ? ' (Violation)' : ''}</div>
                    <div class="pokemon-types">
                        ${pokemon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
                    </div>
                `;
            } else {
                slot.className = 'team-slot';
                slot.innerHTML = 'Empty';
            }
        });
    });
}

// Enhanced type conflict checking with strict primary type mode
function getTypeConflictMessage(pokemon, team, player = null) {
    const teamPrimaryTypes = new Set();
    const teamAllTypes = new Set();
    
    team.forEach(p => {
        if (p && p.types.length > 0) {
            teamPrimaryTypes.add(p.types[0]);
            p.types.forEach(t => teamAllTypes.add(t));
        }
    });
    
    const pokemonPrimaryType = pokemon.types[0];
    const pokemonSecondaryType = pokemon.types[1];
    
    // Primary type cannot overlap with ANY type on the team
    if (teamAllTypes.has(pokemonPrimaryType)) {
        return `primary type ${pokemonPrimaryType} conflicts with team`;
    }
    
    // Secondary type cannot overlap with any PRIMARY type on the team
    if (pokemonSecondaryType && teamPrimaryTypes.has(pokemonSecondaryType)) {
        return `secondary type ${pokemonSecondaryType} conflicts with team's primary type`;
    }
    
    // Check strict primary type mode cross-player restrictions
    if (gameData.strictPrimaryTypeMode && player) {
        const otherPlayer = player === 1 ? 2 : 1;
        const otherTeam = gameData[`player${otherPlayer}`].team;
        const otherTeamPrimaryTypes = new Set();
        
        otherTeam.forEach(p => {
            if (p && p.types.length > 0) {
                otherTeamPrimaryTypes.add(p.types[0]);
            }
        });
        
        if (otherTeamPrimaryTypes.has(pokemonPrimaryType)) {
            const otherPlayerName = gameData.playerNames[`player${otherPlayer}`];
            return `primary type ${pokemonPrimaryType} conflicts with ${otherPlayerName}'s team (Strict Mode)`;
        }
    }
    
    return null; // No conflict
}

// Add Pokemon to team
function addToTeam(player, pokemon) {
    const team = gameData[`player${player}`].team;
    
    // Cannot add failed encounters to team
    if (pokemon.failedToCache) {
        showToast('Cannot add failed encounters to team!', 'error');
        return;
    }
    
    // Check if Pokemon is already in team
    if (team.some(p => p && p.id.toString() === pokemon.id.toString())) {
        showToast('This Pokemon is already on the team!', 'error');
        return;
    }
    
    // Check if team is full
    if (team.every(slot => slot !== null)) {
        showToast(`${gameData.playerNames[`player${player}`]}'s team is full!`, 'error');
        return;
    }
    
    // Check soul link rules
    const link = gameData.soulLinks.find(l =>
        l.pokemon1.id.toString() === pokemon.id.toString() || l.pokemon2.id.toString() === pokemon.id.toString()
    );
    
    if (link) {
        const linkedPokemon = link.pokemon1.id.toString() === pokemon.id.toString() ? link.pokemon2 : link.pokemon1;
        const otherPlayer = player === 1 ? 2 : 1;
        const otherTeam = gameData[`player${otherPlayer}`].team;
        
        // Check if either Pokemon is already in their respective teams
        if (otherTeam.some(p => p && p.id.toString() === linkedPokemon.id.toString())) {
            showToast('The soul-linked partner is already on the other team!', 'error');
            return;
        }
        
        // Check if other player's team is full
        if (otherTeam.every(slot => slot !== null)) {
            showToast(`Cannot add soul-linked pair: ${gameData.playerNames[`player${otherPlayer}`]}'s team is full!`, 'error');
            return;
        }
        
        // Check type conflicts for both Pokemon
        const currentConflict = getTypeConflictMessage(pokemon, team, player);
        const linkedConflict = getTypeConflictMessage(linkedPokemon, otherTeam, otherPlayer);
        
        if (currentConflict && linkedConflict) {
            showToast(`Cannot add soul-linked pair: ${pokemon.nickname} (${currentConflict}), ${linkedPokemon.nickname} (${linkedConflict})`, 'error');
            return;
        } else if (currentConflict) {
            showToast(`Cannot add ${pokemon.nickname}: ${currentConflict}`, 'error');
            return;
        } else if (linkedConflict) {
            showToast(`Cannot add soul-linked pair: ${linkedPokemon.nickname} (${linkedConflict})`, 'error');
            return;
        }
        
        // Both Pokemon pass all checks - add them to their respective teams
        const emptySlot = team.findIndex(slot => slot === null);
        const otherEmptySlot = otherTeam.findIndex(slot => slot === null);
        
        team[emptySlot] = pokemon;
        otherTeam[otherEmptySlot] = linkedPokemon;
        
        saveData();
        renderAll();
        showToast(`Added soul-linked pair: ${pokemon.nickname} and ${linkedPokemon.nickname} to teams!`, 'success');
        return;
    }
    
    // If not linked, check for type conflicts on current team only
    const conflict = getTypeConflictMessage(pokemon, team, player);
    if (conflict) {
        showToast(`Cannot add ${pokemon.nickname}: ${conflict}`, 'error');
        return;
    }
    
    // Add single Pokemon to team
    const emptySlot = team.findIndex(slot => slot === null);
    team[emptySlot] = pokemon;
    saveData();
    renderAll();
    showToast(`Added ${pokemon.nickname} to ${gameData.playerNames[`player${player}`]}'s team!`, 'success');
}

// Render available Pokemon for team building
function renderAvailablePokemon() {
    const container = document.getElementById('available-pokemon');
    const allPokemon = [
        ...gameData.player1.caught.map(p => ({ ...p, player: 1 })),
        ...gameData.player2.caught.map(p => ({ ...p, player: 2 }))
    ];
    
    if (allPokemon.length === 0) {
        container.innerHTML = '<div class="loading">No Pokemon caught yet!</div>';
        return;
    }
    
    container.innerHTML = '';
    
    const linkedPairs = [];
    const processedIds = new Set();
    
    // Process soul-linked pairs first
    gameData.soulLinks.forEach(link => {
        if (!processedIds.has(link.pokemon1.id) && !processedIds.has(link.pokemon2.id)) {
            linkedPairs.push([
                { ...link.pokemon1, player: link.pokemon1.player || 1 },
                { ...link.pokemon2, player: link.pokemon2.player || 2 }
            ]);
            processedIds.add(link.pokemon1.id);
            processedIds.add(link.pokemon2.id);
        }
    });
    
    // Then process individual Pokemon
    allPokemon.forEach(pokemon => {
        if (!processedIds.has(pokemon.id)) {
            linkedPairs.push([pokemon]);
        }
    });
    
    linkedPairs.forEach(pair => {
        const pairDiv = document.createElement('div');
        pairDiv.style.marginBottom = '8px';
        pairDiv.style.border = '2px solid #78c850';
        pairDiv.style.borderRadius = '8px';
        pairDiv.style.padding = '8px';
        
        // Set different background colors based on encounter type
        if (pair.length === 2) {
            if (pair[0].failedToCache || pair[1].failedToCache) {
                pairDiv.style.background = '#fff2f2';
                pairDiv.classList.add('failed-item');
            } else {
                pairDiv.style.background = '#f0fff0';
            }
        } else {
            if (pair[0].failedToCache) {
                pairDiv.style.background = '#fff2f2';
                pairDiv.classList.add('failed-item');
            } else {
                pairDiv.style.background = '#fff0f0';
            }
        }
        
        if (pair.length === 2) {
            // Soul-linked pair or failed encounter pair
            const pokemon1 = pair[0];
            const pokemon2 = pair[1];
            
            // Check if both can be added to teams
            const team1 = gameData[`player${pokemon1.player}`].team;
            const team2 = gameData[`player${pokemon2.player}`].team;
            
            const team1Full = team1.every(slot => slot !== null);
            const team2Full = team2.every(slot => slot !== null);
            const pokemon1InTeam = team1.some(p => p && p.id.toString() === pokemon1.id.toString());
            const pokemon2InTeam = team2.some(p => p && p.id.toString() === pokemon2.id.toString());
            const isPairFainted = pokemon1.fainted || pokemon2.fainted;
            const isFailedEncounter = pokemon1.failedToCache || pokemon2.failedToCache;
            
            let pairIsValid = true;
            let conflictMessage = '';
            
            if (isFailedEncounter) {
                pairIsValid = false;
                conflictMessage = 'Failed to catch';
            } else if (isPairFainted) {
                pairIsValid = false;
                conflictMessage = 'Fainted';
            } else if (pokemon1InTeam || pokemon2InTeam) {
                pairIsValid = false;
                conflictMessage = 'Already on team';
            } else if (team1Full || team2Full) {
                pairIsValid = false;
                conflictMessage = 'Team(s) full';
            } else {
                const conflict1 = getTypeConflictMessage(pokemon1, team1, pokemon1.player);
                const conflict2 = getTypeConflictMessage(pokemon2, team2, pokemon2.player);
                
                if (conflict1 || conflict2) {
                    pairIsValid = false;
                    conflictMessage = conflict1 || conflict2;
                }
            }
            
            let pairClassName = 'available-item';
            if (isFailedEncounter) {
                pairClassName += ' failed-item';
            } else if (isPairFainted) {
                pairClassName += ' fainted';
            } else if (!pairIsValid) {
                pairClassName += ' invalid';
            }
            
            pairDiv.className = pairClassName;
            
            const getOverlayClass = (pokemon) => {
                let overlayClass = '';
                if (pokemon.failedToCache) overlayClass += 'failed-overlay ';
                if (pokemon.fainted) overlayClass += 'fainted-overlay ';
                return overlayClass;
            };
            
            const getSpriteFilter = (pokemon) => {
                if (pokemon.fainted) return 'filter: grayscale(100%) contrast(50%);';
                if (pokemon.failedToCache) return 'filter: grayscale(80%) opacity(70%);';
                return '';
            };
            
            pairDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <!-- Player 1 Pokemon -->
                    <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                        <div class="${getOverlayClass(pokemon1)}" style="position: relative;">
                            <img src="${pokemon1.sprite}" style="width: 48px; height: 48px; image-rendering: pixelated; ${getSpriteFilter(pokemon1)}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                        </div>
                        <div>
                            <div style="font-weight: bold; color: #2980b9;">${gameData.playerNames.player1}'s ${pokemon1.nickname}</div>
                            <div style="font-size: 7px; color: #666;">${pokemon1.route}</div>
                            <div style="display: flex; gap: 3px; margin-top: 2px;">
                                ${pokemon1.types.map(t => `<span class="type-badge type-${t}" style="font-size: 6px; padding: 1px 4px;">${t}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Soul Link Arrow -->
                    <div style="color: ${isFailedEncounter ? '#e74c3c' : '#e74c3c'}; font-size: 16px; font-weight: bold;">⟷</div>
                    
                    <!-- Player 2 Pokemon -->
                    <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                        <div class="${getOverlayClass(pokemon2)}" style="position: relative;">
                            <img src="${pokemon2.sprite}" style="width: 48px; height: 48px; image-rendering: pixelated; ${getSpriteFilter(pokemon2)}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                        </div>
                        <div>
                            <div style="font-weight: bold; color: #c0392b;">${gameData.playerNames.player2}'s ${pokemon2.nickname}</div>
                            <div style="font-size: 7px; color: #666;">${pokemon2.route}</div>
                            <div style="display: flex; gap: 3px; margin-top: 2px;">
                                ${pokemon2.types.map(t => `<span class="type-badge type-${t}" style="font-size: 6px; padding: 1px 4px;">${t}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        ${isPairFainted ?
                            `<button class="faint-btn" onclick="revivePokemon(${pokemon1.player}, '${pokemon1.id}')" style="background: #27ae60; border-color: #229954;">Revive</button>` :
                            isFailedEncounter ? '' :
                                `<button class="faint-btn" onclick="faintPokemon(${pokemon1.player}, '${pokemon1.id}')">Faint</button>`
                        }
                        <button class="delete-btn" onclick="deletePokemon(${pokemon1.player}, '${pokemon1.id}')" style="font-size: 8px; padding: 4px 6px;">Delete</button>
                    </div>
                </div>
            `;
            
            if (pairIsValid && !isPairFainted && !isFailedEncounter) {
                pairDiv.style.cursor = 'pointer';
                pairDiv.onclick = (e) => {
                    if (!e.target.matches('button, .delete-btn, .faint-btn')) {
                        addToTeam(pokemon1.player, pokemon1);
                    }
                };
            } else {
                pairDiv.title = conflictMessage;
            }
            
        } else {
            // Single Pokemon
            const pokemon = pair[0];
            const team = gameData[`player${pokemon.player}`].team;
            const isFainted = pokemon.fainted;
            const isFailedEncounter = pokemon.failedToCache;
            
            let isValid = true;
            let conflictMessage = '';
            
            if (isFailedEncounter) {
                isValid = false;
                conflictMessage = 'Failed to catch';
            } else if (isFainted) {
                isValid = false;
                conflictMessage = 'Fainted';
            } else if (team.some(p => p && p.id.toString() === pokemon.id.toString())) {
                isValid = false;
                conflictMessage = 'Already on team';
            } else if (team.every(slot => slot !== null)) {
                isValid = false;
                conflictMessage = 'Team full';
            } else {
                const conflict = getTypeConflictMessage(pokemon, team, pokemon.player);
                if (conflict) {
                    isValid = false;
                    conflictMessage = conflict;
                }
            }
            
            let itemClassName = 'available-item';
            if (isFailedEncounter) {
                itemClassName += ' failed-item';
            } else if (isFainted) {
                itemClassName += ' fainted';
            } else if (!isValid) {
                itemClassName += ' invalid';
            }
            
            pairDiv.className = itemClassName;
            
            const getOverlayClass = (pokemon) => {
                let overlayClass = '';
                if (pokemon.failedToCache) overlayClass += 'failed-overlay ';
                if (pokemon.fainted) overlayClass += 'fainted-overlay ';
                return overlayClass;
            };
            
            const getSpriteFilter = (pokemon) => {
                if (pokemon.fainted) return 'filter: grayscale(100%) contrast(50%);';
                if (pokemon.failedToCache) return 'filter: grayscale(80%) opacity(70%);';
                return '';
            };
            
            pairDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="${getOverlayClass(pokemon)}" style="position: relative;">
                        <img src="${pokemon.sprite}" style="width: 48px; height: 48px; image-rendering: pixelated; ${getSpriteFilter(pokemon)}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="font-weight: bold; color: ${pokemon.player === 1 ? '#2980b9' : '#c0392b'};">${gameData.playerNames[`player${pokemon.player}`]}'s ${pokemon.nickname}${isFainted ? ' (Fainted)' : ''}${isFailedEncounter ? ' (Failed)' : ''}</div>
                        <div style="font-size: 7px; color: #666;">${pokemon.route}</div>
                        <div style="display: flex; gap: 3px; margin-top: 2px;">
                            ${pokemon.types.map(t => `<span class="type-badge type-${t}" style="font-size: 6px; padding: 1px 4px;">${t}</span>`).join('')}
                        </div>
                    </div>
                    <div style="color: #999; font-size: 8px; margin-right: 10px;">No Link</div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        ${isFainted ?
                            `<button class="faint-btn" onclick="revivePokemon(${pokemon.player}, '${pokemon.id}')" style="background: #27ae60; border-color: #229954;">Revive</button>` :
                            isFailedEncounter ? '' :
                                `<button class="faint-btn" onclick="faintPokemon(${pokemon.player}, '${pokemon.id}')">Faint</button>`
                        }
                        <button class="delete-btn" onclick="deletePokemon(${pokemon.player}, '${pokemon.id}')" style="font-size: 8px; padding: 4px 6px;">Delete</button>
                    </div>
                </div>
            `;
            
            if (isValid && !isFainted && !isFailedEncounter) {
                pairDiv.style.cursor = 'pointer';
                pairDiv.onclick = (e) => {
                    if (!e.target.matches('button, .delete-btn, .faint-btn')) {
                        addToTeam(pokemon.player, pokemon);
                    }
                };
            } else {
                pairDiv.title = conflictMessage;
            }
        }
        
        container.appendChild(pairDiv);
    });
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('soulLinkDataMultiGen', JSON.stringify(gameData));
}

// Load data from localStorage with generation support
function loadData() {
    const saved = localStorage.getItem('soulLinkDataMultiGen');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            gameData = {
                ...gameData,
                ...loaded,
                // Ensure all properties exist
                usedRoutes: loaded.usedRoutes || [],
                failedRoutes: loaded.failedRoutes || [],
                playerNames: loaded.playerNames || {
                    player1: 'Player 1',
                    player2: 'Player 2'
                },
                strictPrimaryTypeMode: loaded.strictPrimaryTypeMode !== undefined ? loaded.strictPrimaryTypeMode : true,
                currentGame: loaded.currentGame,
                currentGeneration: loaded.currentGeneration
            };
            
            // Add backwards compatibility properties
            ['player1', 'player2'].forEach(player => {
                if (gameData[player] && gameData[player].caught) {
                    gameData[player].caught.forEach(pokemon => {
                        if (pokemon.fainted === undefined) {
                            pokemon.fainted = false;
                        }
                        if (pokemon.failedToCache === undefined) {
                            pokemon.failedToCache = false;
                        }
                    });
                }
            });
            
            // Update soulLinks to include failedToCache property
            gameData.soulLinks.forEach(link => {
                if (link.pokemon1.failedToCache === undefined) {
                    link.pokemon1.failedToCache = false;
                }
                if (link.pokemon2.failedToCache === undefined) {
                    link.pokemon2.failedToCache = false;
                }
            });
            
            console.log('Data loaded successfully');
        } catch (e) {
            console.error('Error loading saved data:', e);
            showToast('Error loading saved data. Starting fresh.', 'warning');
        }
    }
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        gameData = {
            player1: {
                caught: [],
                team: [null, null, null, null, null, null]
            },
            player2: {
                caught: [],
                team: [null, null, null, null, null, null]
            },
            soulLinks: [],
            usedRoutes: [],
            failedRoutes: [],
            playerNames: {
                player1: 'Player 1',
                player2: 'Player 2'
            },
            strictPrimaryTypeMode: true,
            currentGame: null,
            currentGeneration: null
        };
        saveData();
        
        // Show generation selector again
        initializeCarousel();
        document.getElementById('generation-selector-modal').style.display = 'flex';
        selectedGeneration = null;
        selectedGame = null;
        
        showToast('All data cleared successfully!', 'info');
    }
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `soul-link-save-gen${gameData.currentGeneration}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Save file exported successfully!', 'success');
}

// Import data
function importData() {
    document.getElementById('importFile').click();
}

// Handle file import with generation support
document.addEventListener('DOMContentLoaded', function() {
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (imported.player1 && imported.player2 && imported.soulLinks) {
                        gameData = {
                            ...imported,
                            usedRoutes: imported.usedRoutes || [],
                            failedRoutes: imported.failedRoutes || [],
                            playerNames: imported.playerNames || {
                                player1: 'Player 1',
                                player2: 'Player 2'
                            },
                            strictPrimaryTypeMode: imported.strictPrimaryTypeMode !== undefined ? imported.strictPrimaryTypeMode : true,
                            currentGame: imported.currentGame || 'hoenn_gen3',
                            currentGeneration: imported.currentGeneration || 3
                        };
                        
                        // Update Pokemon names and evolution lines based on imported generation
                        updatePokemonNamesForGeneration(gameData.currentGeneration);
                        if (typeof updateEvolutionLinesForGeneration === 'function') {
                            updateEvolutionLinesForGeneration(gameData.currentGeneration);
                        }
                        
                        saveData();
                        initializeApp();
                        showToast('Save file imported successfully!', 'success');
                    } else {
                        showToast('Invalid save file format!', 'error');
                    }
                } catch (error) {
                    showToast('Error reading save file: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
            
            // Reset the file input
            e.target.value = '';
        });
    }
});

// Function to check if a Pokemon violates strict mode rules when already on teams
function checkStrictModeViolations() {
    if (!gameData.strictPrimaryTypeMode) return [];
    
    const violations = [];
    const team1PrimaryTypes = new Set();
    const team2PrimaryTypes = new Set();
    
    // Collect primary types from both teams
    gameData.player1.team.forEach((pokemon, index) => {
        if (pokemon && pokemon.types && pokemon.types.length > 0) {
            team1PrimaryTypes.add(pokemon.types[0]);
        }
    });
    
    gameData.player2.team.forEach((pokemon, index) => {
        if (pokemon && pokemon.types && pokemon.types.length > 0) {
            team2PrimaryTypes.add(pokemon.types[0]);
        }
    });
    
    // Check for violations
    gameData.player1.team.forEach((pokemon, index) => {
        if (pokemon && pokemon.types && pokemon.types.length > 0) {
            const primaryType = pokemon.types[0];
            if (team2PrimaryTypes.has(primaryType)) {
                violations.push({ player: 1, slot: index, pokemon: pokemon });
            }
        }
    });
    
    gameData.player2.team.forEach((pokemon, index) => {
        if (pokemon && pokemon.types && pokemon.types.length > 0) {
            const primaryType = pokemon.types[0];
            if (team1PrimaryTypes.has(primaryType)) {
                violations.push({ player: 2, slot: index, pokemon: pokemon });
            }
        }
    });
    
    return violations;
}

// Toggle strict primary type mode
function toggleStrictMode() {
    gameData.strictPrimaryTypeMode = !gameData.strictPrimaryTypeMode;
    updateStrictModeUI();
    saveData();
    renderAll();
    
    showToast(`Strict Mode ${gameData.strictPrimaryTypeMode ? 'enabled' : 'disabled'}!`, 'info');
}

// Update strict mode UI display
function updateStrictModeUI() {
    const button = document.getElementById('strict-mode-btn');
    const label = document.getElementById('strict-mode-label');
    
    if (gameData.strictPrimaryTypeMode) {
        button.classList.add('active');
        label.textContent = 'Strict Mode: ON';
    } else {
        button.classList.remove('active');
        label.textContent = 'Strict Mode: OFF';
    }
}

// Edit player name function
function editPlayerName(player) {
    const currentName = gameData.playerNames[`player${player}`];
    const newName = prompt(`Enter name for Player ${player}:`, currentName);
    
    if (newName && newName.trim()) {
        gameData.playerNames[`player${player}`] = newName.trim();
        saveData();
        updatePlayerNameDisplays();
        showToast(`Player ${player} name updated to ${newName.trim()}!`, 'success');
    }
}

// Update all player name displays throughout the UI
function updatePlayerNameDisplays() {
    const player1Name = gameData.playerNames.player1;
    const player2Name = gameData.playerNames.player2;
    
    // Update team headers
    document.getElementById('player1-team-header').textContent = `${player1Name}'s Team`;
    document.getElementById('player2-team-header').textContent = `${player2Name}'s Team`;
    
    // Update input section headers
    document.getElementById('input-player1-name').textContent = player1Name;
    document.getElementById('input-player2-name').textContent = player2Name;
    
    // Re-render available Pokemon to update player labels
    renderAvailablePokemon();
}

// Team Suggestion Functions

// Main function to suggest full teams
function suggestFullTeams() {
    const suggestions = findOptimalTeamCombinations();
    
    if (suggestions.length === 0) {
        showToast('No valid full team combinations found! You may need to catch more Pokemon or check for type conflicts.', 'warning');
        return;
    }
    
    storeSuggestionsForApply(suggestions);
    displaySuggestions(suggestions);
    document.getElementById('suggestion-modal').style.display = 'block';
    
    showToast(`Found ${suggestions.length} team combination${suggestions.length === 1 ? '' : 's'}!`, 'info');
}

// Find optimal team combinations
function findOptimalTeamCombinations() {
    // Get all available Pokemon (not fainted and not failed encounters)
    const availablePokemon = [
        ...gameData.player1.caught.filter(p => !p.fainted && !p.failedToCache).map(p => ({ ...p, player: 1 })),
        ...gameData.player2.caught.filter(p => !p.fainted && !p.failedToCache).map(p => ({ ...p, player: 2 }))
    ];
    
    if (availablePokemon.length < 12) {
        return []; // Need at least 12 Pokemon for full teams
    }
    
    // Group Pokemon by soul links and individuals
    const soulLinkPairs = [];
    const individuals = [];
    const processedIds = new Set();
    
    // Process soul links first
    gameData.soulLinks.forEach(link => {
        const pokemon1 = availablePokemon.find(p => p.id === link.pokemon1.id && !link.pokemon1.fainted && !link.pokemon1.failedToCache);
        const pokemon2 = availablePokemon.find(p => p.id === link.pokemon2.id && !link.pokemon2.fainted && !link.pokemon2.failedToCache);
        
        if (pokemon1 && pokemon2 && !processedIds.has(pokemon1.id) && !processedIds.has(pokemon2.id)) {
            soulLinkPairs.push([pokemon1, pokemon2]);
            processedIds.add(pokemon1.id);
            processedIds.add(pokemon2.id);
        }
    });
    
    // Add individual Pokemon
    availablePokemon.forEach(pokemon => {
        if (!processedIds.has(pokemon.id)) {
            individuals.push(pokemon);
        }
    });
    
    // Try to find valid combinations
    const suggestions = [];
    const maxAttempts = 10;
    
    // Try different combinations starting with soul link pairs
    for (let attempt = 0; attempt < maxAttempts && suggestions.length < 3; attempt++) {
        const combination = findValidTeamCombination(soulLinkPairs, individuals);
        if (combination && !isDuplicateSuggestion(combination, suggestions)) {
            suggestions.push(combination);
        }
    }
    
    return suggestions;
}

// Enhanced type conflict checking specifically for team suggestions
function getSuggestionTypeConflictMessage(pokemon, team, player, otherTeam) {
    const teamPrimaryTypes = new Set();
    const teamAllTypes = new Set();
    
    team.forEach(p => {
        if (p && p.types.length > 0) {
            teamPrimaryTypes.add(p.types[0]);
            p.types.forEach(t => teamAllTypes.add(t));
        }
    });
    
    const pokemonPrimaryType = pokemon.types[0];
    const pokemonSecondaryType = pokemon.types[1];
    
    // Primary type cannot overlap with ANY type on the team
    if (teamAllTypes.has(pokemonPrimaryType)) {
        return `primary type ${pokemonPrimaryType} conflicts with team`;
    }
    
    // Secondary type cannot overlap with any PRIMARY type on the team
    if (pokemonSecondaryType && teamPrimaryTypes.has(pokemonSecondaryType)) {
        return `secondary type ${pokemonSecondaryType} conflicts with team's primary type`;
    }
    
    // Check strict primary type mode cross-player restrictions using the other team being built
    if (gameData.strictPrimaryTypeMode && otherTeam) {
        const otherTeamPrimaryTypes = new Set();
        
        otherTeam.forEach(p => {
            if (p && p.types.length > 0) {
                otherTeamPrimaryTypes.add(p.types[0]);
            }
        });
        
        if (otherTeamPrimaryTypes.has(pokemonPrimaryType)) {
            const otherPlayerName = player === 1 ? gameData.playerNames.player2 : gameData.playerNames.player1;
            return `primary type ${pokemonPrimaryType} conflicts with ${otherPlayerName}'s team (Strict Mode)`;
        }
    }
    
    return null; // No conflict
}

// Find a single valid team combination
function findValidTeamCombination(soulLinkPairs, individuals) {
    const team1 = [];
    const team2 = [];
    const usedPairs = new Set();
    const usedIndividuals = new Set();
    
    // Shuffle arrays for different combinations
    const shuffledPairs = [...soulLinkPairs].sort(() => Math.random() - 0.5);
    const shuffledIndividuals = [...individuals].sort(() => Math.random() - 0.5);
    
    // Try to fill teams with soul link pairs first
    for (const pair of shuffledPairs) {
        if (team1.length >= 6 || team2.length >= 6) break;
        
        const [pokemon1, pokemon2] = pair;
        
        // First check if the soul link pair violates strict mode (same primary types)
        if (gameData.strictPrimaryTypeMode && pokemon1.types[0] === pokemon2.types[0]) {
            continue; // Skip this pair as it violates strict mode
        }
        
        // Check if both Pokemon can be added without conflicts using the teams being built
        const conflict1 = getSuggestionTypeConflictMessage(pokemon1, team1, 1, team2);
        const conflict2 = getSuggestionTypeConflictMessage(pokemon2, team2, 2, team1);
        
        if (!conflict1 && !conflict2) {
            team1.push(pokemon1);
            team2.push(pokemon2);
            usedPairs.add(pair);
        }
    }
    
    // Fill remaining slots with individuals, trying to balance teams
    for (const pokemon of shuffledIndividuals) {
        if (team1.length >= 6 && team2.length >= 6) break;
        
        const targetPlayer = pokemon.player;
        const targetTeam = targetPlayer === 1 ? team1 : team2;
        const otherTeam = targetPlayer === 1 ? team2 : team1;
        
        if (targetTeam.length < 6) {
            const conflict = getSuggestionTypeConflictMessage(pokemon, targetTeam, targetPlayer, otherTeam);
            if (!conflict) {
                targetTeam.push(pokemon);
                usedIndividuals.add(pokemon);
            }
        }
    }
    
    // If teams aren't full, try to fill with any available Pokemon
    const allRemaining = shuffledIndividuals.filter(p => !usedIndividuals.has(p));
    
    for (const pokemon of allRemaining) {
        if (team1.length >= 6 && team2.length >= 6) break;
        
        // Try player 1's team first if not full
        if (team1.length < 6) {
            const conflict = getSuggestionTypeConflictMessage(pokemon, team1, 1, team2);
            if (!conflict) {
                team1.push(pokemon);
                continue;
            }
        }
        
        // Try player 2's team if player 1's failed or is full
        if (team2.length < 6) {
            const conflict = getSuggestionTypeConflictMessage(pokemon, team2, 2, team1);
            if (!conflict) {
                team2.push(pokemon);
            }
        }
    }
    
    // Return only if both teams are full
    if (team1.length === 6 && team2.length === 6) {
        return {
            team1: team1,
            team2: team2,
            soulLinkPairs: Array.from(usedPairs),
            individuals: Array.from(usedIndividuals)
        };
    }
    
    return null;
}

// Check if a suggestion is a duplicate
function isDuplicateSuggestion(newSuggestion, existingSuggestions) {
    return existingSuggestions.some(existing => {
        const newIds1 = new Set(newSuggestion.team1.map(p => p.id));
        const newIds2 = new Set(newSuggestion.team2.map(p => p.id));
        const existingIds1 = new Set(existing.team1.map(p => p.id));
        const existingIds2 = new Set(existing.team2.map(p => p.id));
        
        return newIds1.size === existingIds1.size &&
            newIds2.size === existingIds2.size &&
            [...newIds1].every(id => existingIds1.has(id)) &&
            [...newIds2].every(id => existingIds2.has(id));
    });
}

// Display suggestions in modal
function displaySuggestions(suggestions) {
    const content = document.getElementById('suggestion-content');
    
    if (suggestions.length === 0) {
        content.innerHTML = '<div class="no-suggestions">No valid full team combinations found.</div>';
        return;
    }
    
    content.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'suggestion-option';
        optionDiv.style.border = '3px solid #78c850';
        optionDiv.style.borderRadius = '8px';
        optionDiv.style.padding = '15px';
        optionDiv.style.background = '#fff';
        optionDiv.style.marginBottom = '15px';
        
        optionDiv.innerHTML = `
            <h3 style="color: #2a5834; margin-bottom: 10px; font-size: 12px;">Option ${index + 1}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div style="border: 2px solid #2a5834; border-radius: 6px; padding: 10px; background: #f0f8ff;">
                    <h4 style="color: #2a5834; margin-bottom: 8px; font-size: 10px;">${gameData.playerNames.player1}'s Team</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        ${suggestion.team1.map(pokemon => `
                            <div style="display: flex; align-items: center; gap: 6px; padding: 4px; background: #fff; border: 1px solid #ddd; border-radius: 4px; font-size: 8px;">
                                <img src="${pokemon.sprite}" style="width: 32px; height: 32px; image-rendering: pixelated;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                                <div>
                                    <div style="font-weight: bold;">${pokemon.nickname}</div>
                                    <div style="font-size: 6px; color: #666;">${pokemon.types.join('/')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="border: 2px solid #2a5834; border-radius: 6px; padding: 10px; background: #f0f8ff;">
                    <h4 style="color: #2a5834; margin-bottom: 8px; font-size: 10px;">${gameData.playerNames.player2}'s Team</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        ${suggestion.team2.map(pokemon => `
                            <div style="display: flex; align-items: center; gap: 6px; padding: 4px; background: #fff; border: 1px solid #ddd; border-radius: 4px; font-size: 8px;">
                                <img src="${pokemon.sprite}" style="width: 32px; height: 32px; image-rendering: pixelated;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                                <div>
                                    <div style="font-weight: bold;">${pokemon.nickname}</div>
                                    <div style="font-size: 6px; color: #666;">${pokemon.types.join('/')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <button style="background: #27ae60; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-family: 'Press Start 2P', monospace; font-size: 10px; width: 100%;" onclick="applySuggestion(${index})">Apply This Team Combination</button>
        `;
        
        content.appendChild(optionDiv);
    });
}

// Apply a suggested team combination
function applySuggestion(suggestionIndex) {
    const suggestions = JSON.parse(sessionStorage.getItem('currentSuggestions') || '[]');
    const suggestion = suggestions[suggestionIndex];
    
    if (!suggestion) return;
    
    const confirmMessage = `Replace current teams with suggested combination?\n\n${gameData.playerNames.player1}: ${suggestion.team1.map(p => p.nickname).join(', ')}\n\n${gameData.playerNames.player2}: ${suggestion.team2.map(p => p.nickname).join(', ')}`;
    
    if (confirm(confirmMessage)) {
        // Clear current teams
        gameData.player1.team = [null, null, null, null, null, null];
        gameData.player2.team = [null, null, null, null, null, null];
        
        // Apply new teams
        suggestion.team1.forEach((pokemon, index) => {
            gameData.player1.team[index] = pokemon;
        });
        
        suggestion.team2.forEach((pokemon, index) => {
            gameData.player2.team[index] = pokemon;
        });
        
        saveData();
        renderAll();
        closeSuggestionModal();
        
        showToast('Teams have been updated with the suggested combination!', 'success');
    }
}

// Store suggestions for apply function
function storeSuggestionsForApply(suggestions) {
    sessionStorage.setItem('currentSuggestions', JSON.stringify(suggestions));
}

// Close suggestion modal
function closeSuggestionModal() {
    document.getElementById('suggestion-modal').style.display = 'none';
    sessionStorage.removeItem('currentSuggestions');
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    const modal = document.getElementById('suggestion-modal');
    if (e.target === modal) {
        closeSuggestionModal();
    }
});

// Make toast testing function available globally for debugging
window.testToast = testToast;
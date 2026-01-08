// --- CONFIGURATION ---
const API_BASE = ""; // Keep empty for relative path (works on Azure & Localhost)

// --- STATE MANAGEMENT ---
const state = {
    token: localStorage.getItem('token'),
    user: null // Will store decoded token data { userId, role }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Attach Event Listeners
    document.getElementById('link-to-register').addEventListener('click', () => switchScreen('register-screen'));
    document.getElementById('link-to-login').addEventListener('click', () => switchScreen('login-screen'));
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('ride-request-form').addEventListener('submit', handleRideRequest);
    document.getElementById('refresh-rides-btn').addEventListener('click', loadDriverRides);

    // 2. Check if already logged in
    if (state.token) {
        try {
            // Decode token safely
            const payload = JSON.parse(atob(state.token.split('.')[1]));
            state.user = payload;
            showDashboard();
        } catch (e) {
            console.error("Invalid token:", e);
            logout();
        }
    } else {
        switchScreen('login-screen');
    }
}

// --- CORE FUNCTIONS ---

async function handleLogin(e) {
    e.preventDefault(); // Stop page reload
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const data = await fetchAPI('/auth/login', 'POST', { email, password });
    
    if (data && data.token) {
        // Success
        state.token = data.token;
        localStorage.setItem('token', data.token);
        
        const payload = JSON.parse(atob(state.token.split('.')[1]));
        state.user = payload;
        
        showNotification('Login Successful!', 'success');
        showDashboard();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value;
    const role = document.getElementById('reg-role').value;

    const endpoint = role === 'driver' ? '/drivers' : '/customers';
    
    const data = await fetchAPI(endpoint, 'POST', { name, email, password, phone });

    if (data) {
        showNotification('Registration successful! Please log in.', 'success');
        switchScreen('login-screen');
        // Clear form
        document.getElementById('register-form').reset();
    }
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    switchScreen('login-screen');
    showNotification('Logged out.', 'info');
}

// --- DASHBOARD LOGIC ---

function showDashboard() {
    switchScreen('dashboard-screen');
    document.getElementById('user-name-display').innerText = state.user.role.toUpperCase();

    if (state.user.role === 'customer') {
        document.getElementById('customer-panel').classList.remove('hidden');
        document.getElementById('driver-panel').classList.add('hidden');
        loadCustomerHistory();
    } else {
        document.getElementById('driver-panel').classList.remove('hidden');
        document.getElementById('customer-panel').classList.add('hidden');
        loadDriverRides();
    }
}

async function handleRideRequest(e) {
    e.preventDefault();
    const pickup = document.getElementById('pickup').value;
    const destination = document.getElementById('destination').value;

    const data = await fetchAPI('/rides', 'POST', { pickup, destination });
    
    if (data) {
        showNotification('Ride requested successfully!', 'success');
        document.getElementById('ride-request-form').reset();
        loadCustomerHistory();
    }
}

async function loadCustomerHistory() {
    const list = document.getElementById('customer-ride-list');
    list.innerHTML = '<li>Loading...</li>';

    // We use the ID from the token state
    const data = await fetchAPI(`/customers/${state.user.userId}/rides`, 'GET');
    
    if (data) {
        list.innerHTML = data.length ? '' : '<li>No ride history found.</li>';
        data.forEach(ride => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${ride.pickup} ➡ ${ride.destination}</strong> <br> <small>Status: ${ride.status}</small>`;
            list.appendChild(li);
        });
    }
}

async function loadDriverRides() {
    const list = document.getElementById('driver-ride-list');
    list.innerHTML = '<li>Refreshing...</li>';

    // NOTE: In a real app, this would be GET /rides?status=requested
    // For this assignment, we might fetch all and filter, or use an admin endpoint if regular drivers can't see all.
    // Let's assume we fetch requests assigned to this driver OR all available (depending on your backend logic).
    // If your backend doesn't have "View Available Rides", we might need to add it.
    // For now, let's try the driver's own history:
    const data = await fetchAPI(`/drivers/${state.user.userId}/rides`, 'GET');

    if (data) {
        list.innerHTML = data.length ? '' : '<li>No rides assigned yet.</li>';
        data.forEach(ride => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>From: ${ride.pickup}</strong> <br> <small>Status: ${ride.status}</small>`;
            list.appendChild(li);
        });
    }
}

// --- UTILITIES ---

async function fetchAPI(endpoint, method, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'API Error');
        }
        return data;
    } catch (err) {
        console.error(err);
        showNotification(err.message, 'error');
        return null;
    }
}

function switchScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    // Show target
    document.getElementById(screenId).classList.remove('hidden');
}

function showNotification(msg, type) {
    const el = document.getElementById('notification');
    el.innerText = msg;
    el.className = `notification ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}
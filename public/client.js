const API_URL = ""; // Empty string means "same domain" (works for deployment)
let token = localStorage.getItem('token');
let userRole = localStorage.getItem('role');

// --- UI NAVIGATION ---
function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');

    // Show different views based on role
    if (userRole === 'customer') {
        document.getElementById('customer-view').classList.remove('hidden');
        document.getElementById('driver-view').classList.add('hidden');
        loadCustomerRides();
    } else {
        document.getElementById('customer-view').classList.add('hidden');
        document.getElementById('driver-view').classList.remove('hidden');
        // You would load available rides here for drivers
    }
}

// --- AUTHENTICATION ---
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            token = data.token;
            // Decode token to get role (simple way for demo)
            const payload = JSON.parse(atob(token.split('.')[1]));
            userRole = payload.role;
            
            localStorage.setItem('token', token);
            localStorage.setItem('role', userRole);
            showDashboard();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Login failed");
    }
}

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

// --- RIDE FUNCTIONS ---
async function requestRide() {
    const pickup = document.getElementById('pickup').value;
    const destination = document.getElementById('dest').value;
    const fare = document.getElementById('fare').value;

    const res = await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pickup, destination, fare: Number(fare) })
    });

    if (res.ok) {
        alert("Ride Requested!");
        loadCustomerRides();
    } else {
        alert("Failed to request ride");
    }
}

async function loadCustomerRides() {
    // We need the User ID for this endpoint. 
    // Ideally, the backend should just use req.user.userId, 
    // but your endpoint is /customers/:id/rides.
    // Let's extract ID from token again.
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    const res = await fetch(`${API_URL}/customers/${userId}/rides`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const rides = await res.json();
    const list = document.getElementById('ride-list');
    list.innerHTML = rides.map(r => `<li>${r.pickup} to ${r.destination} (${r.status}) - RM${r.fare}</li>`).join('');
}

// --- INITIAL LOAD ---
if (token) {
    showDashboard();
}
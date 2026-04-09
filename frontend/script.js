// Config
const API_BASE = 'http://localhost:3000'; // Gateway

// State
let token = localStorage.getItem('raksha_token') || null;
let user = JSON.parse(localStorage.getItem('raksha_user')) || null;

// DOM Mounts
document.addEventListener("DOMContentLoaded", () => {
    // Auth Tabs
    document.querySelectorAll('.auth-card .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            document.querySelectorAll('.auth-card .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`form-${target}`).classList.add('active');
        });
    });

    // Boot
    if (token) {
        initDashboard();
    } else {
        document.getElementById('view-auth').classList.add('active');
    }
});

// Notifications
function showToast(msg, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'err' : 'succ'} show`;
    toast.innerHTML = `<span class="icon">${isError ? '⚠️' : '✅'}</span><span class="msg">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function toggleLoader(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if(!btn) return;
    btn.querySelector('.btn-text').style.display = isLoading ? 'none' : 'block';
    btn.querySelector('.loader').style.display = isLoading ? 'block' : 'none';
    btn.disabled = isLoading;
}

// Authentication
async function handleAuth(e, type) {
    e.preventDefault();
    const btnId = `btn-${type}`;
    toggleLoader(btnId, true);
    
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(`${API_BASE}/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || data.error || 'Authentication failed');

        if (type === 'login') {
            token = data.token;
            // Decode simple data if backend doesn't return full user
            user = { phone: payload.phone, role: data.role || 'CIVILIAN' }; 
            localStorage.setItem('raksha_token', token);
            localStorage.setItem('raksha_user', JSON.stringify(user));
            initDashboard();
        } else {
            showToast('Registration successful! Please login.');
            document.querySelector('.tab-btn[data-target="login"]').click();
        }
    } catch (err) {
        showToast(err.message, true);
    } finally {
        toggleLoader(btnId, false);
    }
}

// Routing & Dashboard
function initDashboard() {
    document.getElementById('view-auth').classList.remove('active');
    document.getElementById('view-dashboard').classList.add('active');
    
    if (user) {
        document.getElementById('display-name').textContent = user.name || user.phone;
        document.getElementById('display-role').textContent = user.role;
        document.getElementById('user-avatar').textContent = (user.name ? user.name[0] : 'U').toUpperCase();
    }
    
    navigate('overview');
}

function navigate(viewId) {
    // Update Menu
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[onclick="navigate('${viewId}')"]`)?.classList.add('active');
    
    // Update Title
    const titles = {
        'overview': 'Overview',
        'sos': 'SOS Center',
        'supply': 'Supplies & Aid',
        'safezone': 'Safe Zone Locator',
        'mentalhealth': 'Crisis Support AI',
        'settings': 'Profile Diagnostics'
    };
    document.getElementById('current-page-title').textContent = titles[viewId] || 'Dashboard';

    // Swap Modules
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    document.getElementById(`module-${viewId}`).classList.add('active');
}

function logout() {
    token = null;
    user = null;
    localStorage.removeItem('raksha_token');
    localStorage.removeItem('raksha_user');
    document.getElementById('view-dashboard').classList.remove('active');
    document.getElementById('view-auth').classList.add('active');
}

// Global API Fetcher with Auth
async function api(endpoint, options = {}) {
    if(!token) { logout(); throw new Error('Not authenticated'); }
    
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers };
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    
    if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error('Session expired');
    }
    
    return res.json();
}

// Module Specific Functions
async function testService(endpoint) {
    // Determines which output box to use based on the endpoint path
    let outputId = 'overview-data';
    if(endpoint.includes('auth')) outputId = 'profile-data';
    if(endpoint.includes('supply')) outputId = 'supply-data';
    if(endpoint.includes('safezone')) outputId = 'safezone-data';
    
    const out = document.getElementById(outputId);
    if(out) out.textContent = 'Executing request...\n';
    
    try {
        const data = await api(endpoint);
        if(out) out.textContent += JSON.stringify(data, null, 2);
    } catch(err) {
        if(out) out.textContent += `[ERROR] ${err.message}\nMake sure that specific service is fully implemented in the backend.`;
    }
}

async function reportEmergency(e) {
    e.preventDefault();
    const btnId = 'btn-sos-submit';
    toggleLoader(btnId, true);
    
    const desc = document.getElementById('sos-description').value;
    const out = document.getElementById('sos-result');
    out.classList.remove('hidden');
    out.innerHTML = '<span class="pulse-dot" style="display:inline-block"></span> Triage mechanism analyzing via Gemini...';
    
    try {
        const data = await api('/sos/report', {
            method: 'POST',
            body: JSON.stringify({ location: 'Unknown', description: desc, mediaUrls: [] })
        });
        out.innerHTML = `<strong>Triage Complete:</strong><pre>${JSON.stringify(data, null, 2)}</pre>`;
        document.getElementById('sos-form').reset();
    } catch(err) {
        // Fallback or show error visually if /sos/report doesn't exist yet
        out.innerHTML = `<span style="color:var(--danger)">Error connecting to SOS routing: ${err.message}</span>\n<br><small>Does POST /sos/report exist?</small>`;
    } finally {
        toggleLoader(btnId, false);
    }
}

function triggerSOS() {
    navigate('sos');
    document.getElementById('sos-description').focus();
    showToast('Emergency module engaged.', true);
}

// Chat UI
async function sendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    
    appendChat(msg, 'user');
    input.value = '';
    
    // Simulate thinking state
    const botReplyId = appendChat('...', 'bot');
    
    try {
        const data = await api('/mentalhealth/chat', {
            method: 'POST',
            body: JSON.stringify({ message: msg })
        });
        document.getElementById(botReplyId).textContent = data.reply || data.response || "Here's a response.";
    } catch (err) {
        document.getElementById(botReplyId).textContent = `[System Offline] Unable to connect to inference server. (${err.message})`;
    }
}

function appendChat(text, sender) {
    const history = document.getElementById('chat-history');
    const msgDiv = document.createElement('div');
    const id = 'msg-' + Date.now();
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `<div class="msg-bubble" id="${id}">${text}</div>`;
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
    return id;
}

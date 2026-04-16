import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';
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

    const recaptchaToken = grecaptcha.getResponse();
    if (!recaptchaToken){
        showToast('Please verify you are not a robot', true);
        toggleLoader(btnId, false);
        return;
    }
    try {
       let firebaseUser;

       if (type === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
        firebaseUser = cred.user;

        await fetch(`${API_BASE}/auth/register`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: payload.name,
                email: payload.email,
                phone: payload.phone || '',
                role: payload.role || 'CIVILIAN',
                firebaseUser: firebaseUser.uid
            })
        });
        showToast('Registered! Please login.');
        document.querySelector('.tab-btn[data-target="login"]').click();
    }else{
        const cred = await signInWithEmailAndPassword(auth, payload.email, payload.password);
        firebaseUser = cred.user;
        token = await firebaseUser.getIdToken();
        user = { name: firebaseUser.displayName || payload.email, email: firebaseUser.email, role: 'CIVILIAN' };
        localStorage.setItem('raksha_token', token);
        localStorage.setItem('raksha_user', JSON.stringify(user));
        initDashboard();
    }
    } catch (err) {
        showToast(err.message, true);
    } finally {
        toggleLoader(btnId, false);
        grecaptcha.reset();
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

async function logout() {
    await signOut(auth);
    token = null;
    user = null;
    localStorage.removeItem('raksha_token');
    localStorage.removeItem('raksha_user');
    document.getElementById('view-dashboard').classList.remove('active');
    document.getElementById('view-auth').classList.add('active');
}

//Google-SignIn
async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;
        token = await firebaseUser.getIdToken();
        user = {
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            role: 'CIVILIAN'
        };
        localStorage.setItem('raksha_token', token);
        localStorage.setItem('raksha_user', JSON.stringify(user));
        initDashboard();
    } catch (err) {
        showToast(err.message, true);
    }
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
        const data = await api('/sos/trigger', {
            method: 'POST',
            body: JSON.stringify({ latitude: 0.0, longitude: 0.0, description: desc })
        });
        out.innerHTML = `<strong>Triage Complete:</strong><pre>${JSON.stringify(data, null, 2)}</pre>`;
        document.getElementById('sos-form').reset();
    } catch(err) {
        // Fallback or show error visually if /sos/trigger fails
        out.innerHTML = `<span style="color:var(--danger)">Error connecting to SOS routing: ${err.message}</span>\n<br><small>Does POST /sos/trigger exist?</small>`;
    } finally {
        toggleLoader(btnId, false);
    }
}

function triggerSOS() {
    navigate('sos');
    document.getElementById('sos-description').focus();
    showToast('Emergency module engaged.', true);
}

async function requestSupply(e) {
    e.preventDefault();
    const btnId = 'btn-supply-submit';
    toggleLoader(btnId, true);
    
    const type = document.getElementById('supply-type').value;
    const desc = document.getElementById('supply-desc').value;
    
    try {
        const data = await api('/supply/request', {
            method: 'POST',
            body: JSON.stringify({ type, description: desc, latitude: 0.0, longitude: 0.0 })
        });
        showToast('Resource request submitted successfully!');
        document.getElementById('supply-form').reset();
        
        // Auto-fetch updated list
        testService('/supply/requests');
    } catch(err) {
        showToast(err.message, true);
    } finally {
        toggleLoader(btnId, false);
    }
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
    
    // Support new UI structure with avatars
    const isBot = sender === 'bot';
    const authorName = isBot ? 'Raksha Assistant' : 'You';
    const iconName = isBot ? 'bot' : 'user';
    const bgClass = isBot ? 'info-bg' : 'primary-bg';
    
    msgDiv.innerHTML = `
        <div class="avatar-small ${bgClass}"><i data-lucide="${iconName}"></i></div>
        <div class="msg-content">
            <div class="msg-author">${authorName} <span class="time">Just now</span></div>
            <div class="msg-bubble" id="${id}">${text}</div>
        </div>
    `;
    
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
    
    // Re-initialize icons for newly added elements
    if (window.lucide) {
        lucide.createIcons();
    }
    
    return id;
}


async function fetchSupplyRequests() {
    const container = document.getElementById('supply-cards');
    if (!container) return;
    container.innerHTML = `<p style="color:var(--text-muted);padding:0.5rem 0">Loading requests...</p>`;
    try {
        const data = await api('/supply/requests');
        const requests = Array.isArray(data) ? data : (data.requests || []);
        if (requests.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);padding:0.5rem 0">No open supply requests.</p>`;
            return;
        }
        const urgencyColor = (u) => u >= 8 ? 'var(--danger)' : u >= 5 ? 'var(--warning)' : 'var(--success)';
        const urgencyLabel = (u) => u >= 8 ? 'Critical' : u >= 5 ? 'Moderate' : 'Low';
        const typeIcon = { FOOD: '🍞', MEDICAL: '💊', SHELTER: '🏕️' };
        container.innerHTML = requests.map(r => `
            <div style="display:flex;align-items:flex-start;gap:1rem;padding:1rem;background:var(--bg-elevated);border-radius:10px;border:1px solid var(--border-light);margin-bottom:0.6rem">
                <div style="font-size:1.5rem;line-height:1">${typeIcon[r.type] || '📦'}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem">
                        <strong style="font-size:0.9rem">${r.type} — ${r.category || 'General'}</strong>
                        <span style="font-size:0.75rem;font-weight:600;color:${urgencyColor(r.urgency)};padding:0.2rem 0.6rem;border-radius:20px">${urgencyLabel(r.urgency)} (${r.urgency}/10)</span>
                    </div>
                    <p style="color:var(--text-muted);font-size:0.83rem;margin:0">${r.description}</p>
                    <span style="font-size:0.72rem;color:var(--text-muted)">${new Date(r.createdAt).toLocaleString()}</span>
                </div>
            </div>`).join('');
    } catch (err) {
        container.innerHTML = `<p style="color:var(--danger)">Failed to load: ${err.message}</p>`;
    }
}

async function fetchSafeZones() {
    const container = document.getElementById('safezone-cards');
    if (!container) return;
    container.innerHTML = `<p style="color:var(--text-muted);padding:0.5rem 0">Scanning for safe zones...</p>`;
    try {
        const data = await api('/safezone');
        const zones = Array.isArray(data) ? data : (data.zones || []);
        if (zones.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);padding:0.5rem 0">No safe zones registered yet.</p>`;
            return;
        }
        const typeIcon = { MEDICAL: '🏥', SHELTER: '🏕️', FOOD: '🍞', GENERAL: '🛡️' };
        container.innerHTML = zones.map(z => `
            <div style="display:flex;align-items:flex-start;gap:1rem;padding:1rem;background:var(--bg-elevated);border-radius:10px;border:1px solid var(--border-light);margin-bottom:0.6rem">
                <div style="font-size:1.5rem;line-height:1">${typeIcon[z.type] || '📍'}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem">
                        <strong style="font-size:0.9rem">${z.type || 'Safe Zone'}</strong>
                        <span style="font-size:0.75rem;font-weight:600;color:${z.isVerified ? 'var(--success)' : 'var(--warning)'}">
                            ${z.isVerified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                    </div>
                    <p style="color:var(--text-muted);font-size:0.83rem;margin:0">${z.description || 'No description'}</p>
                    <span style="font-size:0.72rem;color:var(--text-muted)">${new Date(z.createdAt).toLocaleString()}</span>
                </div>
            </div>`).join('');
    } catch (err) {
        container.innerHTML = `<p style="color:var(--danger)">Failed to load: ${err.message}</p>`;
    }
}

// Expose functions globally for HTML onclick handlers
window.handleAuth = handleAuth;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.navigate = navigate;
window.triggerSOS = triggerSOS;
window.reportEmergency = reportEmergency;
window.requestSupply = requestSupply;
window.fetchSupplyRequests = fetchSupplyRequests;
window.fetchSafeZones = fetchSafeZones;
window.sendChatMessage = sendChatMessage;
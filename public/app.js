let currentUser = JSON.parse(localStorage.getItem('rp_user')) || null;
let currentView = 'feed'; 
let activeProfileUser = null;
let isSignUp = false;

const authView = document.getElementById('authView');
const hubView = document.getElementById('hubView');
const profileView = document.getElementById('profileView');
const authStatus = document.getElementById('authStatus');

function init() {
    updateAuthHeader();
    if (!currentUser) {
        showView('auth');
    } else {
        showView('feed');
        loadFeed();
    }
}

function showView(view) {
    authView.classList.add('hide');
    hubView.classList.add('hide');
    profileView.classList.add('hide');

    if (view === 'auth') authView.classList.remove('hide');
    if (view === 'feed') hubView.classList.remove('hide');
    if (view === 'profile') profileView.classList.remove('hide');
}

function updateAuthHeader() {
    if (currentUser) {
        const pfpColor = getColorForLetter(currentUser.pfpLetter);
        authStatus.innerHTML = `
            <div class="avatar" style="background-color: ${pfpColor};">${currentUser.pfpLetter}</div>
            <span>${currentUser.username}</span>
            <button id="logoutBtn" class="mc-btn" style="padding:4px 8px; font-size:11px;">X</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('rp_user');
            currentUser = null;
            init();
        });
    } else {
        authStatus.innerHTML = '<span>Not Logged In</span>';
    }
}

function getColorForLetter(letter) {
    const colors = ['#ff5555', '#55ff55', '#55ffff', '#ffaa00', '#ff55ff', '#ffff55', '#aa00aa', '#00aa00'];
    const idx = letter.charCodeAt(0) % colors.length;
    return colors[idx];
}

document.getElementById('authToggleBtn').addEventListener('click', () => {
    isSignUp = !isSignUp;
    document.getElementById('authTitle').innerText = isSignUp ? "Register Hub Account" : "Log in to Hub";
    document.getElementById('authPrimaryBtn').innerText = isSignUp ? "Sign Up" : "Log In";
    document.getElementById('authToggleBtn').innerText = isSignUp ? "Already registered? Log In" : "Create an account";
});

document.getElementById('authPrimaryBtn').addEventListener('click', async () => {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    if (!username || !password) return alert("Fill out all boxes!");

    const endpoint = isSignUp ? '/api/signup' : '/api/login';
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = data.user;
            localStorage.setItem('rp_user', JSON.stringify(currentUser));
            init();
        } else {
            alert(data.error || "Authentication failed!");
        }
    } catch (err) { console.error(err); }
});

document.getElementById('submitPostBtn').addEventListener('click', async () => {
    const content = document.getElementById('postContent').value;
    if (!content.trim() || !currentUser) return;

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, pfpLetter: currentUser.pfpLetter, content })
        });
        if (response.ok) {
            document.getElementById('postContent').value = '';
            loadFeed();
        }
    } catch (err) { console.error(err); }
});

async function loadFeed() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        renderPostsList(posts, document.getElementById('feedContainer'));
    } catch (err) { console.error(err); }
}

function renderPostsList(posts, container) {
    container.innerHTML = '';
    if (posts.length === 0) {
        container.innerHTML = '<div class="mc-panel" style="text-align:center;">No blocks placed in this chunk yet.</div>';
        return;
    }
    posts.forEach(post => {
        const pfpColor = getColorForLetter(post.pfpLetter);
        
        // Assemble comment elements
        let commentsHtml = '';
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(comment => {
                const cPfpColor = getColorForLetter(comment.pfpLetter);
                commentsHtml += `
                    <div class="mc-comment" style="margin-left: 20px; margin-top: 10px; padding: 10px; border-left: 4px solid #1e1e1e; background: #3d3d3d; box-shadow: inset 2px 2px #555;">
                        <div class="post-header" style="font-size: 12px; margin-bottom: 5px;">
                            <div class="avatar" style="width:20px; height:20px; font-size:10px; background-color: ${cPfpColor};">${comment.pfpLetter}</div>
                            <span style="color: #55ffff;">${comment.username}</span>
                        </div>
                        <p style="margin: 0; font-size: 14px; text-shadow: 1px 1px #000;">${comment.content}</p>
                    </div>
                `;
            });
        }

        const el = document.createElement('div');
        el.className = 'mc-panel mc-post';
        el.innerHTML = `
            <div class="post-header">
                <div class="avatar" style="background-color: ${pfpColor};">${post.pfpLetter}</div>
                <div class="username-link" data-username="${post.username}">${post.username}</div>
            </div>
            <p class="post-body">${post.content}</p>
            <div class="post-actions">
                <button class="mc-btn" onclick="react(${post.id}, 'fire')">🔥 Fire (${post.fire || 0})</button>
                <button class="mc-btn" onclick="react(${post.id}, 'heart')">❤️ Heart (${post.heart || 0})</button>
            </div>
            
            <!-- RedStonePosting Comments Segment -->
            <div class="comments-section" style="margin-top: 20px; border-top: 4px solid #1e1e1e; padding-top: 15px;">
                <div class="comments-list">${commentsHtml}</div>
                
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <input type="text" id="commInput-${post.id}" placeholder="Reply to this block..." class="mc-input" style="font-size: 12px; padding: 6px;">
                    <button class="mc-btn" onclick="submitComment(${post.id})" style="font-size: 12px; padding: 4px 12px;">REPLY</button>
                </div>
            </div>
        `;
        
        el.querySelector('.username-link').addEventListener('click', (e) => {
            viewProfile(e.target.getAttribute('data-username'));
        });
        container.appendChild(el);
    });
}

async function react(postId, type) {
    try {
        await fetch('/api/react', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, type })
        });
        if (currentView === 'profile') {
            viewProfile(activeProfileUser);
        } else {
            loadFeed();
        }
    } catch (err) { console.error(err); }
}

async function viewProfile(username) {
    currentView = 'profile';
    activeProfileUser = username;
    showView('profile');
    
    const pfpLetter = username.charAt(0).toUpperCase();
    const pfpColor = getColorForLetter(pfpLetter);
    
    document.getElementById('profileUsername').innerText = username;
    const pfpBox = document.getElementById('profilePfp');
    pfpBox.innerText = pfpLetter;
    pfpBox.style.backgroundColor = pfpColor;

    try {
        const response = await fetch(`/api/posts?username=${encodeURIComponent(username)}`);
        const userPosts = await response.json();
        renderPostsList(userPosts, document.getElementById('profileFeedContainer'));
    } catch (err) { console.error(err); }
}

document.getElementById('backToFeedBtn').addEventListener('click', () => {
    currentView = 'feed';
    showView('feed');
    loadFeed();
});
document.getElementById('goHome').addEventListener('click', () => {
    if (currentUser) {
        currentView = 'feed';
        showView('feed');
        loadFeed();
    }
});

async function submitComment(postId) {
    const input = document.getElementById(`commInput-${postId}`);
    const content = input.value.trim();
    if (!content || !currentUser) return alert("You must write a message and be logged in!");

    try {
        const response = await fetch('/api/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId: postId,
                username: currentUser.username,
                pfpLetter: currentUser.pfpLetter,
                content: content
            })
        });
        if (response.ok) {
            input.value = '';
            loadFeed(); 
        }
    } catch (err) { console.error(err); }
}

window.react = react;
window.submitComment = submitComment;
init();


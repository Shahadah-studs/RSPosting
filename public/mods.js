const binId = "https://api.jsonbin.io/v3/b/6ad3cb18ffd5d16053743827";
const apiKey = "$2a$10$GCbhOTd8yjlnA4ZNTtiTQOHFkHJNj6aaAwCnD3V0kgcOIdEFyGA7S";

async function fetchAllModsFromCloud() {
    const scrollerBox = document.getElementById('modsScrollerBox');
    if (!scrollerBox) return;

    try {
        const response = await fetch(`https://jsonbin.io{binId}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': apiKey }
        });

        const resData = await response.json();
        const documents = resData.record || [];

        scrollerBox.innerHTML = "";

        if (documents.length === 0) {
            scrollerBox.innerHTML = `<div class="rsp-empty-indicator">No scripts found in the data repository cloud.</div>`;
            return;
        }

        documents.forEach(doc => {
            const itemCard = document.createElement('div');
            itemCard.className = 'mod-scroller-item';
            itemCard.onclick = () => openModPreviewPopup(doc.title, doc.username, doc.code);

            itemCard.innerHTML = `
                <div class="rsp-item-title-text">${doc.title}</div>
                <div class="rsp-item-author-text">CONTRIBUTED BY: @${doc.username}</div>
                <span class="rsp-item-action-trigger">View Code</span>
            `;
            scrollerBox.appendChild(itemCard);
        });
    } catch (err) {
        console.error("RSP Fetch Error:", err);
    }
}

async function publishModToCloud() {
    const userIn = document.getElementById('mod-username');
    const titleIn = document.getElementById('mod-title');
    const codeIn = document.getElementById('mod-code');

    if (!userIn || !titleIn || !codeIn || !userIn.value.trim() || !titleIn.value.trim() || !codeIn.value.trim()) return;

    try {
        const cleanUser = userIn.value.trim().replace(/[<>]/g, "");
        const cleanTitle = titleIn.value.trim().replace(/[<>]/g, "");

        const getResponse = await fetch(`https://jsonbin.io{binId}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': apiKey }
        });
        const currentData = await getResponse.json();
        let modArray = currentData.record || [];

        if (!Array.isArray(modArray)) {
            modArray = [];
        }

        const newMod = {
            username: cleanUser,
            title: cleanTitle,
            code: codeIn.value,
            created_at: new Date().toISOString()
        };

        modArray.unshift(newMod);

        const updateResponse = await fetch(`https://jsonbin.io{binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify(modArray)
        });

        if (updateResponse.ok) {
            userIn.value = "";
            titleIn.value = "";
            codeIn.value = "";
            await fetchAllModsFromCloud();
        }
    } catch (err) {
        console.error("RSP Post Error:", err);
    }
}

function openModPreviewPopup(title, author, rawCode) {
    document.getElementById('popupModTitle').textContent = title;
    document.getElementById('popupModMeta').textContent = "Contributed By: @" + author + " | Verification Clear";
    document.getElementById('popupModCodeDisplay').value = rawCode;
    document.getElementById('modPopupOverlay').style.display = 'flex';
}

function closeModPreviewPopup() {
    document.getElementById('modPopupOverlay').style.display = 'none';
}

fn copyPopupCodeToClipboard() {
    const codeTextarea = document.getElementById('popupModCodeDisplay');
    if (!codeTextarea) return;
    codeTextarea.select();
    codeTextarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(codeTextarea.value);
}

window.addEventListener('load', fetchAllModsFromCloud);

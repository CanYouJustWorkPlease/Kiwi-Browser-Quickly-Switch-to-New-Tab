let activeOverlayTabId = null;

chrome.tabs.onCreated.addListener(function (tab) {
    if (!tab.active) {
        showNotification(tab.id);
    }
});

function showNotification(tabId) {
    if (activeOverlayTabId) {
        removeExistingOverlay();
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
        chrome.scripting.executeScript({
            target: { tabId: activeTabs[0].id },
            func: createOverlay,
            args: [tabId]
        });
    });

    activeOverlayTabId = tabId;
}

function createOverlay(newTabId) {
    const existingOverlay = document.getElementById('newTabOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'newTabOverlay';
    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.width = '80%';
    overlay.style.maxWidth = '500px';
    overlay.style.backgroundColor = '#6ACED2';
    overlay.style.color = 'white';
    overlay.style.padding = '12px 20px';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'space-between';
    overlay.style.alignItems = 'center';
    overlay.style.fontSize = '16px';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.zIndex = '10000';
    overlay.style.cursor = 'pointer';
    overlay.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.5)';
    overlay.style.borderRadius = '10px';

    const text = document.createElement('span');
    text.innerText = 'New tab opened';
    text.style.fontSize = '16px';

    const switchButton = document.createElement('span');
    switchButton.innerText = 'SWITCH';
    switchButton.style.color = 'white';
    switchButton.style.fontWeight = 'bold';
    switchButton.style.fontSize = '14px';
    switchButton.style.marginRight = '10px';

    overlay.appendChild(text);
    overlay.appendChild(switchButton);

    document.body.appendChild(overlay);

    const switchTabHandler = () => {
        chrome.runtime.sendMessage({ action: 'switchTab', tabId: newTabId });
        document.body.removeChild(overlay);
    };
    overlay.addEventListener('click', switchTabHandler);
    overlay.addEventListener('touchstart', switchTabHandler);

    setTimeout(() => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }, 2000);
}

function removeExistingOverlay() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
        chrome.scripting.executeScript({
            target: { tabId: activeTabs[0].id },
            func: () => {
                const existingOverlay = document.getElementById('newTabOverlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'switchTab' && request.tabId) {
        chrome.tabs.update(request.tabId, { active: true });
    }
});
// vibecoded btw my first script did NOT work :wilted-flower
function checkActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: () => {
                    chrome.runtime.sendMessage({ hostname: window.location.hostname });
                }
            });
        }
    });
}

setInterval(checkActiveTab, 5000);

chrome.runtime.onMessage.addListener((msg, sender) => {
    console.log(msg.hostname);
    // ben its up to you <3
});

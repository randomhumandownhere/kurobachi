import browser from 'webextension-polyfill';
browser.runtime.sendMessage({ action: "log", value: "script loaded" });

document.getElementById("session-info").innerText = "Loading session...";
browser.storage.local.get('sessionKey').then(session => {
    if (session) {
        document.getElementById("session-info").innerText = `session: ${JSON.stringify(session)}`;
    } else {
        document.getElementById("session-info").innerText = "u failure :3";
    }
});

function handleSignIn() {
    browser.runtime.sendMessage({ action: "oauth" }).then(response => {
        if (response.data) {
            browser.runtime.sendMessage({ action: "log", value: response.data });
        } else {
            browser.runtime.sendMessage({ action: "log", value: "nodata" });
        }
    }).catch(error => {
        browser.runtime.sendMessage({ action: "log", value: `err: ${error.message}` });
    });
}

document.getElementById("sign-in-btn").addEventListener("click", handleSignIn);
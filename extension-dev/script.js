import browser from 'webextension-polyfill';

/*
browser.storage.local.get('sessionKey').then(session => {
    if (session) {
        document.getElementById("session-info").innerText = `session: ${JSON.stringify(session)}`;
    } else {
        document.getElementById("session-info").innerText = "u failure :3";
    }
});
*/

browser.runtime.sendMessage({ action: "getSession" }).then(response => {
    // browser.runtime.sendMessage({ action: "log", value: `data: ${response.data.session}` });
    if (response?.data.session) {
        document.getElementById("signin").style.display = "none";
        document.getElementById("stats").style.display = "block";
    }
});

function handleSignIn() {
    browser.storage.local.get('oauthInProgress').then(({ oauthInProgress }) => {
        console.log(oauthInProgress);
        if (oauthInProgress === false) {
            // prevent multiple windows
            browser.storage.local.set({ oauthInProgress: true });
            browser.runtime.sendMessage({ action: "oauth" }).then(response => {
                if (response?.data) {
                    // browser.runtime.sendMessage({ action: "log", value: response.data });
                } else {
                    browser.runtime.sendMessage({ action: "log", value: "no data" });
                }
            }).catch(error => {
                browser.runtime.sendMessage({ action: "log", value: `err: ${error.message}` });
            });
        }
    })

}

document.getElementById("sign-in-btn").addEventListener("click", handleSignIn);
document.getElementById("test").addEventListener("click", () => {
    browser.runtime.sendMessage({ action: "post" }).then(response => {
        if (response) {
            browser.runtime.sendMessage({ action: "log", value: `test response: ${JSON.stringify(response)}` });
        } else {
            browser.runtime.sendMessage({ action: "log", value: "no response" });
        }
    }).catch(error => {
        browser.runtime.sendMessage({ action: "log", value: `test error: ${error.message}` });
    });
});

browser.runtime.onMessage.addListener((msg) => {
    if (msg.action === "auth_success") {
        document.getElementById("signin").style.display = "none";
        document.getElementById("stats").style.display = "block";
    }
    return false;
});
const manifest = chrome.runtime.getManifest()

const url = new URL('https://accounts.google.com/o/oauth2/auth')

url.searchParams.set('client_id', manifest.oauth2.client_id)
url.searchParams.set('response_type', 'id_token')
url.searchParams.set('access_type', 'offline')
url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`)
url.searchParams.set('scope', manifest.oauth2.scopes.join(' '))

chrome.identity.launchWebAuthFlow(
  {
    url: url.href,
    interactive: true,
  },
  async (redirectedTo) => {
    if (chrome.runtime.lastError) {
      // auth was not successful
    } else {
      // auth was successful, extract the ID token from the redirectedTo URL
      const url = new URL(redirectedTo)
      const params = new URLSearchParams(url.hash)

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: params.get('id_token'),
      })
    }
  }
)

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

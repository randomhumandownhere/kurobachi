import supabase from './supabase_client';

export async function loginWithGoogle(): Promise<void> {
    const manifest = chrome.runtime.getManifest();
    
    if (!manifest.oauth2) {
        throw new Error('meow');
    }

    const url = new URL('https://accounts.google.com/o/oauth2/auth');
    url.searchParams.set('client_id', manifest.oauth2.client_id);
    url.searchParams.set('response_type', 'id_token');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`)
    url.searchParams.set('scope', manifest.oauth2.scopes?.join(' ') || '');

    return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
            {
                url: url.href,
                interactive: true,
            },
            async (redirectedTo) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    try {
                        const url = new URL(redirectedTo || '');
                        const params = new URLSearchParams(url.hash.replace(/^#/, ''));
                        const id_token = params.get('id_token');
                        
                        if (!id_token) {
                            reject(new Error('No id_token found in redirect URL'));
                            return;
                        }

                        const { data, error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: id_token,
                        });
                        
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    } catch (err) {
                        reject(err);
                    }
                }
            }
        );
    });
}
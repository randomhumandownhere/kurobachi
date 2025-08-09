import browser from "webextension-polyfill";
import supabase from './src/supabase_client';
import { loginWithGoogle } from "./src/oauth";

type Message = {
  action: 'getSession' | 'signout' | 'oauth' | 'post',
  value?: string
} | {
  action: 'log',
  value: string
}

type ResponseCallback = (data: any) => void

interface TrackerEntry {
  user_id: string;
  url: string;
}
browser.storage.local.set({ hbTemp: [] });
let hbSave: TrackerEntry[] = [];

browser.storage.local.set({ oauthInProgress: false });

async function handleMessage({ action, value }: Message, response: ResponseCallback) {
  if (action === 'oauth') {
    await loginWithGoogle();
    const { data: session } = await supabase.auth.getSession();
    response({ data: session });

  } else if (action === 'getSession') {
    const { data: session } = await supabase.auth.getSession();
    response({ data: session });

  } else if (action === 'signout') {
    const { error } = await supabase.auth.signOut()
    response({ data: null, error });

  } else if (action === 'log') {
    console.log(value);
    response({ data: 'logged' });

  } else if (action === 'post') {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    // console.log(token);

    const fetchResponse = await fetch('http://localhost:3000/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const res = await fetchResponse.json();
    console.log(res);
    response({ data: res });

  } else {
    response({ data: null, error: 'Unknown action' });

  }
}

async function track(value: string) {
  if (!value) return;

  const { hbTemp } = await browser.storage.local.get('hbTemp');
  hbSave = hbTemp || [];

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {/*
    console.log('re-sign in');
    const { oauthInProgress } = await browser.storage.local.get('oauthInProgress');
    if (oauthInProgress === false) {
      // prevent multiple windows
      await browser.storage.local.set({ oauthInProgress: true });
      await loginWithGoogle().catch(e => {
        console.log(e);
      });
    }

    const result = await supabase.auth.getSession();
    if (result.error) {
      console.error('err:', result.error);
      return;
    }

    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (!newUser) {
      console.log('failed after login');
      return;
    }
    hbSave.push({
      user_id: newUser.id,
      url: value
    })*/
    console.log("user not signed in");
  } else {
    hbSave.push({
      user_id: user.id,
      url: value
    });
  }
  await browser.storage.local.set({ hbTemp: hbSave });
  console.log(hbSave);
}

async function getUrl(): Promise<string> {
  interface ActiveTab extends browser.Tabs.Tab {
    id: number;
  }

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const activeTab: ActiveTab = tabs[0] as ActiveTab;

  if (!activeTab || !activeTab.url) {
    return '';
  }

  if (activeTab.url?.startsWith('chrome://')) {
    return 'chrome://';
  }

  if (activeTab.id) {
    const results = await browser.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => window.location.hostname
    });
    return results[0].result as string;
  }
  return '';
}

setInterval(async () => {
  const url = await getUrl();
  await track(url);
}, 10000);

// disable if needed :p
async function add() {
  console.log('adding');
  const { data, error } = await supabase
    .from('tracker')
    .insert(hbSave)

  if (error) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session == null) {
      console.log('user not signed in')
      return;
    }
  } else {
    hbSave = [];
    await browser.storage.local.set({ hbTemp: [] });
  }
  setTimeout(add, 60000);
}

setTimeout(add, 60000);

// @ts-ignore
browser.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, response);
  return true;
})
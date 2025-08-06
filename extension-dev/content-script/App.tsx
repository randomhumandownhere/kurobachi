import browser from "webextension-polyfill";
import React, { useEffect, useState } from "react";
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  /*
  useEffect(() => {
    (async () => {
      const result = await browser.runtime.sendMessage({ action: "getSession" });
      await browser.runtime.sendMessage({ action: "log", value: JSON.stringify(result) });
      const currentSession = result?.data?.session ?? null;
      setSession(currentSession);

      await browser.runtime.sendMessage({ action: "getSession" }).then(result => {
        browser.runtime.sendMessage({ action: "log", value: JSON.stringify(result) });
      });

      if (!currentSession) {
        const storage = await browser.storage.local.get("oauthInProgress");
        await browser.runtime.sendMessage({ action: "log", value: `session is null, ${JSON.stringify(storage)}` });
        if (!storage.oauthInProgress) {
          await browser.storage.local.set({ oauthInProgress: true });
          browser.runtime.sendMessage({ action: "oauth" }).then(result => {
            setSession(result.data.session);
            browser.runtime.sendMessage({ action: "log", value: JSON.stringify(result) });
            browser.storage.local.set({ oauthInProgress: false });
          });
        }
      }
    })();
  }, []);
  */

  function renderApp() {
    return (
      <>
        <p></p>
      </>
    );
  }

  return (<>{renderApp()}</>);
};

export default App;
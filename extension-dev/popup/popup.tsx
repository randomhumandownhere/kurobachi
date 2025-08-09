// def not vibecoded last minute
import React, { useEffect, useState, useCallback } from "react";
import browser from "webextension-polyfill";
import { Session } from '@supabase/supabase-js';
import "./index.css";
import { Bar } from 'react-chartjs-2';
import supabase from '../src/supabase_client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Popup: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "minutes spent",
        barPercentage: 0.5,
        barThickness: 14,
        maxBarThickness: 20,
        minBarLength: 6,
        data: [] as number[],
        backgroundColor: [] as string[],
        borderColor: [] as string[],
        borderWidth: 1
      }
    ]
  });

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await browser.runtime.sendMessage({ action: "getSession" });
      const session = res?.data?.session;
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
      setSession(session || null);
    } catch (error) {
      console.error("Failed to get session:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const messageListener = async (msg: any) => {
      if (msg.action === "auth_success") {
        await checkSession();
      }
    };

    browser.runtime.onMessage.addListener(messageListener);
    checkSession();

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, [checkSession]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('tracker')
      .select('url')
      .eq('user_id', session?.user?.id);

    if (error) {
      console.error('err:', error);
      return;
    }
    if (!data) return;

    const urlCounts: Record<string, number> = {};
    for (const row of data) {
      const url = row.url;
      if (!url) continue;
      urlCounts[url] = (urlCounts[url] || 0) + 1;
    }

    const filteredData = Object.entries(urlCounts)
      .map(([url, count]) => ({
      url,
      minutes: Math.floor(count / 6)
      }))
      .filter(item => item.minutes > 0);

    const labels = filteredData.map(item => item.url);
    const counts = filteredData.map(item => item.minutes);

    setChartData({
      labels,
      datasets: [
        {
          label: "minutes spent",
          barPercentage: 0.5,
          barThickness: 14,
          maxBarThickness: 20,
          minBarLength: 6,
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }
      ]
    });
  };

  const handleSignIn = async () => {
    try {
      const { oauthInProgress } = await browser.storage.local.get('oauthInProgress');
      if (!oauthInProgress) {
        await browser.storage.local.set({ oauthInProgress: true });
        const response = await browser.runtime.sendMessage({ action: "oauth" });
        if (response?.data?.session) {
          const session = response.data.session;
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          setSession(session);
        } else {
          await browser.runtime.sendMessage({ action: "log", value: "no data from oauth" });
          await browser.storage.local.set({ oauthInProgress: false });
        }
      }
    } catch (error) {
      await browser.storage.local.set({ oauthInProgress: false });
      browser.runtime.sendMessage({
        action: "log",
        value: `Sign-in error: ${(error as Error).message}`
      });
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (session) {
    return (
      <div className="stats-container">
        <Bar data={chartData} options={{ scales: { x: { ticks: { display: false } } } }} />
      </div>
    );
  }

  return (
    <div className="signin-container">
      <button type="button" className="sign-in-btn" onClick={handleSignIn}>
        <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
          <path fillRule="evenodd"
            d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
            clipRule="evenodd" />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
};

export default Popup;
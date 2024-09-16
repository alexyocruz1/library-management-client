// pages/_app.tsx
import 'fomantic-ui-css/semantic.min.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const { t } = useTranslation('common');

  useEffect(() => {
    toast.dismiss();

    const loadDependencies = async () => {
      if (typeof window !== 'undefined') {
        const jQuery = await import('jquery');
        window.jQuery = window.$ = jQuery.default;
        await import('fomantic-ui-css/semantic.min.js');
      }
    };
    loadDependencies();

    // Clear cache when app is opened
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHE');
    }
  }, []);

  return (
    <>
      <Head>
        <title>{t('appTitle')}</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#317EFB" />
        <meta name="description" content="This is a PWA version of my app" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default appWithTranslation(MyApp);
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

declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const { t } = useTranslation('common');

  useEffect(() => {
    const loadDependencies = async () => {
      if (typeof window !== 'undefined') {
        // Load jQuery and make it globally available
        const jQuery = await import('jquery');
        window.jQuery = window.$ = jQuery.default;
        // Then load Fomantic UI
        await import('fomantic-ui-css/semantic.min.js');
      }
    };
    loadDependencies();
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
      <ToastContainer />
    </>
  );
}

export default appWithTranslation(MyApp);
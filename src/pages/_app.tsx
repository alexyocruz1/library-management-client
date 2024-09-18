// pages/_app.tsx
import 'fomantic-ui-css/semantic.min.css';
import '../styles/globals.css';
import '../styles/fonts.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../styles/GlobalStyle';
import { theme } from '../styles/theme';

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

    // Clear all existing toasts when the app mounts
    toast.dismiss();
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{t('appTitle')}</title>
        <meta name="description" content={t('appDescription')} />
        <meta name="keywords" content={t('appKeywords')} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content={theme.colors.primary} />
      </Head>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
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
        limit={3}
      />
    </>
  );
}

export default appWithTranslation(MyApp);
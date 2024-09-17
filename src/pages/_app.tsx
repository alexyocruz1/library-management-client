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
import { createGlobalStyle } from 'styled-components';
import { tokens } from '../styles/tokens';
import { colors } from '../styles/colors';

const GlobalStyle = createGlobalStyle`
  html {
    font-size: 16px;
  }

  body {
    font-family: 'KidsFont', sans-serif !important;
    font-size: ${tokens.fontSize.base};
    background-image: url('/images/kids-background.jpg');
    background-size: cover;
    background-attachment: fixed;
    background-position: center;
    min-height: 100vh;
  }

  button, input, textarea, select, .ui.pagination.menu, .ui.pagination.menu .item {
    font-family: 'KidsFont', sans-serif !important;
    font-size: ${tokens.fontSize.base};
  }
`;

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
      <GlobalStyle />
      <Head>
        <title>{t('appTitle')}</title>
        <link rel="icon" href="/icons/bookshelf.ico" />
        <link rel="apple-touch-icon" href="/icons/book-bubbles-16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#317EFB" />
        <meta name="description" content="This is a PWA version of my app" />
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
        limit={3}
      />
    </>
  );
}

export default appWithTranslation(MyApp);
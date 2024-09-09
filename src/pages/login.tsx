import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/users/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success(t('loginSuccess'));
        // Store the token in localStorage or a secure cookie
        localStorage.setItem('token', response.data.token);
        // Redirect to home page or dashboard
        setTimeout(() => router.push('/'), 3000);
      } else {
        const errorMessage = response.data.message || t('loginError');
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || t('loginError');
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Head>
        <title>{t('login')}</title>
      </Head>
      <Navbar isLoggedIn={false} />
      <div className="ui container" style={{ marginTop: '20px' }}>
        <h1>{t('login')}</h1>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>{t('password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <div className="ui error message">
              <p>{error}</p>
            </div>
          )}
          <button className="ui primary button" type="submit">
            {t('login')}
          </button>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  };
};

export default LoginPage;

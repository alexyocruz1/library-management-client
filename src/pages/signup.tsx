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

const SignUpPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsMismatch'));
      toast.error(t('passwordsMismatch'));
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/users/signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success(t('signupSuccess'));
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const errorMessage = response.data.message || t('signupError');
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || t('signupError');
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Head>
        <title>{t('signUp')}</title>
      </Head>
      <Navbar isLoggedIn={false} />
      <div className="ui container" style={{ marginTop: '20px' }}>
        <h1>{t('signUp')}</h1>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('username')}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="field">
            <label>{t('confirmPassword')}</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {t('signUp')}
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

export default SignUpPage;

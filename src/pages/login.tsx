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
import Link from 'next/link';
import { Form, Button, Message, Segment, Grid, Header } from 'semantic-ui-react';

const LoginPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error(t('fillAllRequiredFields'));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/users/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success(t('loginSuccess'));
        localStorage.setItem('token', response.data.token);
        setTimeout(() => router.push('/'), 3000);
      } else {
        toast.error(response.data.message || t('loginError'));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const isFieldEmpty = (field: keyof typeof formData) => {
    return submitted && !formData[field];
  };

  return (
    <>
      <Head>
        <title>{t('login')}</title>
      </Head>
      <Navbar isLoggedIn={false} />
      <Grid textAlign='center' style={{ height: '80vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' color='teal' textAlign='center'>
            {t('login')}
          </Header>
          <Form size='large' onSubmit={handleSubmit} loading={loading}>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                placeholder={t('email')}
                name='email'
                value={formData.email}
                onChange={handleChange}
                error={isFieldEmpty('email')}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder={t('password')}
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                error={isFieldEmpty('password')}
              />
              <Button color='teal' fluid size='large' type='submit'>
                {t('login')}
              </Button>
            </Segment>
          </Form>
          <Message>
            {t('newToUs')} <Link href="/signup">{t('signUp')}</Link>
          </Message>
        </Grid.Column>
      </Grid>
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

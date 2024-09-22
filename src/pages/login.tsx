import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { Form, Button, Message, Segment, Grid, Header, Icon } from 'semantic-ui-react';
import styled from 'styled-components';
import { colors } from '../styles/colors';

const PlayfulContainer = styled.div`
  background-color: ${colors.background}F0;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin-top: 2em;
`;

const PlayfulHeader = styled(Header)`
  font-family: 'KidsFont', sans-serif !important;
  color: ${colors.primary} !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const PlayfulButton = styled(Button)`
  background-color: ${colors.secondary} !important;
  color: white !important;
  border-radius: 20px !important;
  font-family: 'KidsFont', sans-serif !important;
`;

const PlayfulSegment = styled(Segment)`
  border-radius: 15px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
`;

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
          <PlayfulContainer>
            <PlayfulHeader as='h2' textAlign='center'>
              <Icon name="user circle" style={{ color: colors.primary }} />
              {t('login')}
            </PlayfulHeader>
            <Form size='large' onSubmit={handleSubmit} loading={loading}>
              <PlayfulSegment stacked>
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
                <PlayfulButton fluid size='large' type='submit'>
                  {t('login')}
                </PlayfulButton>
              </PlayfulSegment>
            </Form>
            <Message>
              {t('newToUs')} <Link href="/signup">{t('signUp')}</Link>
            </Message>
          </PlayfulContainer>
        </Grid.Column>
      </Grid>
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

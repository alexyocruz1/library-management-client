// pages/admin/borrow-return.tsx
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

const BorrowReturnPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [action, setAction] = useState<'borrow' | 'return'>('borrow');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    lastName: '',
    grade: '',
    observations: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <div className="ui container" style={{ margin: '2rem auto', padding: '2rem', maxWidth: '800px' }}>
        <h2>{t('borrowReturn')}</h2>
        <div className="ui two buttons">
          <button className={`ui button ${action === 'borrow' ? 'active' : ''}`} onClick={() => setAction('borrow')}>
            {t('borrow')}
          </button>
          <button className={`ui button ${action === 'return' ? 'active' : ''}`} onClick={() => setAction('return')}>
            {t('return')}
          </button>
        </div>
        <h3>{action === 'borrow' ? t('borrowBook') : t('returnBook')}</h3>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('date')}</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>{t('name')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>{t('lastName')}</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>{t('grade')}</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>{t('observations')}</label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button className="ui button" type="submit">
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'])),
    },
  };
};

export default BorrowReturnPage;
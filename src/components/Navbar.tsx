// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/router';
import styles from '../styles/components/Navbar.module.css'; // Import the CSS module
import { Dropdown } from 'semantic-ui-react'; // Import Fomantic UI Dropdown
import { useTranslation } from 'next-i18next';

const Navbar: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn = false }) => {
  const { t } = useTranslation('common');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Always call the hook, but handle the case where it's not yet client-side
  const isMobileOrTablet = useMediaQuery({ query: '(max-width: 768px)' });

  // Only use the result of the hook if it's client-side
  const showMobileMenu = isClient && isMobileOrTablet;

  const changeLanguage = (e: React.SyntheticEvent<HTMLElement>, { value }: any) => {
    const locale = value;
    router.push(router.pathname, router.asPath, { locale });
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className={`ui mini menu ${styles.navbar}`}>
      <Link href="/" passHref>
        <span className={`active item ${styles.navItem} ${styles.activeItem}`}>{t('homeNavbar')}</span>
      </Link>
      <div className={`right menu ${styles.navMenu}`}>
        <Dropdown
          item
          text={t('languageNavbar')}
          className={`ui dropdown item ${styles.navItem}`}
          onChange={changeLanguage}
          options={[
            { key: 'en', value: 'en', text: 'English' },
            { key: 'es', value: 'es', text: 'Español' },
          ]}
          value={router.locale}
        />
        {showMobileMenu ? (
          <Dropdown item text="Menu" className={`ui dropdown item ${styles.navItem}`}>
            <Dropdown.Menu className={styles.dropdownMenu}>
              {isLoggedIn && (
                <>
                  <Link href="/admin/create" passHref>
                    <Dropdown.Item className={styles.navItem}>{t('createBookNavbar')}</Dropdown.Item>
                  </Link>
                  <Link href="/admin/borrow-return" passHref>
                    <Dropdown.Item className={styles.navItem}>{t('borrowBookNavbar')}</Dropdown.Item>
                  </Link>
                </>
              )}
              {isLoggedIn ? (
                <Dropdown.Item className={styles.navItem}>
                  <div className="ui primary button">{t('logoutNavbar')}</div>
                </Dropdown.Item>
              ) : (
                <>
                  <div className={`item ${styles.navItem}`}>
                    <div className="ui primary button" onClick={handleSignUp}>{t('signupNavbar')}</div>
                  </div>
                  <div className={`item ${styles.navItem}`}>
                    <div className="ui secondary button" onClick={handleLogin}>{t('loginNavbar')}</div>
                  </div>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <>
            {isLoggedIn && (
              <>
                <Link href="/admin/create" passHref>
                  <span className={`item ${styles.navItem}`}>{t('createBookNavbar')}</span>
                </Link>
                <Link href="/admin/borrow-return" passHref>
                  <span className={`item ${styles.navItem}`}>{t('borrowBookNavbar')}</span>
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <div className={`item ${styles.navItem}`}>
                <div className="ui primary button">{t('logoutNavbar')}</div>
              </div>
            ) : (
              <>
                <div className={`item ${styles.navItem}`}>
                  <div className="ui primary button" onClick={handleSignUp}>{t('signupNavbar')}</div>
                </div>
                <div className={`item ${styles.navItem}`}>
                  <div className="ui secondary button" onClick={handleLogin}>{t('loginNavbar')}</div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
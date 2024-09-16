// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/router';
import { Dropdown, Menu } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';

const navbarStyle = {
  display: 'flex',
  alignItems: 'center',
  height: '50px',
  backgroundColor: '#f0f4f8', // Soft blue-gray background
};

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  color: '#4a5568',
  transition: 'background-color 0.3s ease',
};

const navItemHoverStyle = {
  ...navItemStyle,
  backgroundColor: '#e2e8f0',
};

const activeItemStyle = {
  ...navItemStyle,
  backgroundColor: '#e2e8f0',
};

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.dismiss(); // Clear any pending toasts
    router.push('/login');
  };

  return (
    <Menu secondary style={navbarStyle}>
      <Menu.Item as={Link} href="/" style={navItemStyle}>
        <Icon name="book" /> {t('homeNavbar')}
      </Menu.Item>

      <Menu.Menu position="right">
        <Dropdown
          item
          icon="world"
          text={t('languageNavbar')}
          style={navItemStyle}
          onChange={changeLanguage}
          options={[
            { key: 'en', value: 'en', text: 'English', flag: 'us' },
            { key: 'es', value: 'es', text: 'Español', flag: 'es' },
          ]}
          value={router.locale}
        />

        {showMobileMenu ? (
          <Dropdown item icon="bars" style={navItemStyle}>
            <Dropdown.Menu>
              {isLoggedIn && (
                <>
                  <Dropdown.Item as={Link} href="/admin/create">
                    <Icon name="plus" /> {t('createBookNavbar')}
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} href="/admin/borrow-return">
                    <Icon name="exchange" /> {t('borrowBookNavbar')}
                  </Dropdown.Item>
                </>
              )}
              {isLoggedIn ? (
                <Dropdown.Item onClick={handleLogout}>
                  <Icon name="sign out" /> {t('logoutNavbar')}
                </Dropdown.Item>
              ) : (
                <>
                  <Dropdown.Item onClick={handleSignUp}>
                    <Icon name="user plus" /> {t('signupNavbar')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogin}>
                    <Icon name="sign in" /> {t('loginNavbar')}
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <>
            {isLoggedIn && (
              <>
                <Menu.Item as={Link} href="/admin/create" style={navItemStyle}>
                  <Icon name="plus" /> {t('createBookNavbar')}
                </Menu.Item>
                <Menu.Item as={Link} href="/admin/borrow-return" style={navItemStyle}>
                  <Icon name="exchange" /> {t('borrowBookNavbar')}
                </Menu.Item>
              </>
            )}
            {isLoggedIn ? (
              <Menu.Item style={navItemStyle} onClick={handleLogout}>
                <Icon name="sign out" /> {t('logoutNavbar')}
              </Menu.Item>
            ) : (
              <>
                <Menu.Item style={navItemStyle} onClick={handleSignUp}>
                  <Icon name="user plus" /> {t('signupNavbar')}
                </Menu.Item>
                <Menu.Item style={navItemStyle} onClick={handleLogin}>
                  <Icon name="sign in" /> {t('loginNavbar')}
                </Menu.Item>
              </>
            )}
          </>
        )}
      </Menu.Menu>
    </Menu>
  );
};

export default Navbar;
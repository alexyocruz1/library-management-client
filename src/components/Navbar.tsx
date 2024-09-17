import styled, { createGlobalStyle } from 'styled-components';
import { colors } from '../styles/colors';
import { tokens } from '../styles/tokens';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/router';
import { Dropdown, Menu, Icon } from 'semantic-ui-react';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';

// Add this global style
const GlobalStyle = createGlobalStyle`
  body, button, input, textarea, select {
    font-family: 'KidsFont', sans-serif !important;
  }
`;

const NavbarContainer = styled(Menu)`
  &.ui.secondary.menu {
    font-family: 'KidsFont', sans-serif !important;
    background-color: ${colors.background};
    border-bottom: 2px solid ${colors.primary};
    margin-bottom: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0.5em 1em;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1000;
  }
`;

const NavItem = styled(Menu.Item)`
  &.item {
    font-family: 'KidsFont', sans-serif !important;
    font-size: ${tokens.fontSize.md} !important;
    color: ${colors.text} !important;
    transition: all 0.3s ease;
    margin: 0 0.5em;
    border-radius: 15px;
    padding: 0.5em 1em !important;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    &:hover {
      background-color: ${colors.accent} !important;
      transform: scale(1.05);
      color: ${colors.primary} !important;
    }

    &.active {
      background-color: ${colors.secondary} !important;
      color: white !important;
    }

    .icon {
      margin-right: 0.5em !important;
    }
  }
`;

const StyledDropdown = styled(Dropdown)`
  &.ui.dropdown {
    font-family: 'KidsFont', sans-serif !important;
    font-size: ${tokens.fontSize.md} !important;
    height: 100%;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;

    &:hover {
      background-color: ${colors.accent} !important;
      color: ${colors.primary} !important;
    }

    .menu {
      border-radius: 15px;
      overflow: hidden;

      .item {
        font-family: 'KidsFont', sans-serif !important;
        transition: all 0.3s ease;

        &:hover {
          background-color: ${colors.accent} !important;
          color: ${colors.primary} !important;
        }
      }
    }
  }
`;

const RightMenu = styled(Menu.Menu)`
  display: flex;
  align-items: center;
  height: 100%;
`;

const AdminNavItem = styled(NavItem)`
  margin: 0 1em !important; // Increase spacing between admin buttons
`;

const Navbar: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn = false }) => {
  const { t } = useTranslation('common');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isMobileOrTablet = useMediaQuery({ query: '(max-width: 768px)' });
  const showMobileMenu = isClient && isMobileOrTablet;

  const changeLanguage = (e: React.SyntheticEvent<HTMLElement>, { value }: any) => {
    const locale = value;
    router.push(router.pathname, router.asPath, { locale });
  };

  const handleSignUp = () => router.push('/signup');
  const handleLogin = () => router.push('/login');
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.dismiss();
    router.push('/login');
  };

  return (
    <>
      <GlobalStyle />
      <NavbarContainer secondary>
        <NavItem as={Link} href="/" active={router.pathname === '/'}>
          <Icon name="book" /> {t('homeNavbar')}
        </NavItem>

        <RightMenu position="right">
          <StyledDropdown
            item
            icon="world"
            text={t('languageNavbar')}
            onChange={changeLanguage}
            options={[
              { key: 'en', value: 'en', text: 'English', flag: 'us' },
              { key: 'es', value: 'es', text: 'Español', flag: 'es' },
            ]}
            value={router.locale}
          />

          {showMobileMenu ? (
            <StyledDropdown item icon="bars">
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
            </StyledDropdown>
          ) : (
            <>
              {isLoggedIn && (
                <>
                  <AdminNavItem as={Link} href="/admin/create" active={router.pathname === '/admin/create'}>
                    <Icon name="plus" /> {t('createBookNavbar')}
                  </AdminNavItem>
                  <AdminNavItem as={Link} href="/admin/borrow-return" active={router.pathname === '/admin/borrow-return'}>
                    <Icon name="exchange" /> {t('borrowBookNavbar')}
                  </AdminNavItem>
                </>
              )}
              {isLoggedIn ? (
                <NavItem onClick={handleLogout}>
                  <Icon name="sign out" /> {t('logoutNavbar')}
                </NavItem>
              ) : (
                <>
                  <NavItem onClick={handleSignUp}>
                    <Icon name="user plus" /> {t('signupNavbar')}
                  </NavItem>
                  <NavItem onClick={handleLogin}>
                    <Icon name="sign in" /> {t('loginNavbar')}
                  </NavItem>
                </>
              )}
            </>
          )}
        </RightMenu>
      </NavbarContainer>
    </>
  );
};

export default Navbar;
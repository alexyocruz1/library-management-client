// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';
import styles from '../styles/components/Navbar.module.css'; // Import the CSS module
import { Dropdown } from 'semantic-ui-react'; // Import Fomantic UI Dropdown

const Navbar: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn = true }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Always call the hook, but handle the case where it's not yet client-side
  const isMobileOrTablet = useMediaQuery({ query: '(max-width: 768px)' });

  // Only use the result of the hook if it's client-side
  const showMobileMenu = isClient && isMobileOrTablet;

  return (
    <div className={`ui mini menu ${styles.navbar}`}>
      <Link href="/" passHref>
        <span className={`active item ${styles.navItem} ${styles.activeItem}`}>Home</span>
      </Link>
      <div className={`right menu ${styles.navMenu}`}>
        {showMobileMenu ? (
          <Dropdown item text="Menu" className={`ui dropdown item ${styles.navItem}`}>
            <Dropdown.Menu className={styles.dropdownMenu}>
              {isLoggedIn && (
                <>
                  <Link href="/admin/create" passHref>
                    <Dropdown.Item className={styles.navItem}>Create Book</Dropdown.Item>
                  </Link>
                  <Link href="/admin/borrow-return" passHref>
                    <Dropdown.Item className={styles.navItem}>Borrow Book</Dropdown.Item>
                  </Link>
                </>
              )}
              {isLoggedIn ? (
                <Dropdown.Item className={styles.navItem}>
                  <div className="ui primary button">Logout</div>
                </Dropdown.Item>
              ) : (
                <Dropdown.Item className={styles.navItem}>
                  <div className="ui primary button">Sign Up</div>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <>
            {isLoggedIn && (
              <>
                <Link href="/admin/create" passHref>
                  <span className={`item ${styles.navItem}`}>Create Book</span>
                </Link>
                <Link href="/admin/borrow-return" passHref>
                  <span className={`item ${styles.navItem}`}>Borrow Book</span>
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <div className={`item ${styles.navItem}`}>
                <div className="ui primary button">Logout</div>
              </div>
            ) : (
              <div className={`item ${styles.navItem}`}>
                <div className="ui primary button">Sign Up</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
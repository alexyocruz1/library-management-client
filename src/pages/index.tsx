// pages/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Image from 'next/image';

interface Book {
  _id: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  status: string;
  imageUrl?: string;
}

const BookImage: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={200}
      height={300}
      onError={() => setImgSrc('/placeholder.png')}
    />
  );
};

const IndexPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchBooks();
    checkAuthStatus();
  }, [currentPage, searchTerm]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, {
        params: { page: currentPage, search: searchTerm },
      });
      setBooks(response.data.books);

      const booksPerPage = 10;
      const totalBooks = response.data.totalBooks || 0;
      setTotalPages(Math.ceil(totalBooks / booksPerPage) || 1);
    } catch (error) {
      setError(t('errorFetchingBooks'));
      setBooks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="ui container" style={{ marginTop: '20px' }}>
        <div className="ui fluid category search">
          <div className="ui icon input" style={{ width: '100%' }}>
            <input
              className="prompt"
              type="text"
              placeholder={t('searchBooks')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search icon"></i>
          </div>
        </div>
        <div className="ui grid" style={{ marginTop: '20px' }}>
          {loading ? (
            <div className="ui active centered inline loader"></div>
          ) : error ? (
            <div className="ui negative message">{error}</div>
          ) : books.length > 0 ? (
            books.map((book) => (
              <div className="four wide column" key={book._id}>
                <div className="ui card">
                  <div className="image">
                    <BookImage src={book.imageUrl || '/placeholder.png'} alt={book.title} />
                  </div>
                  <div className="content">
                    <div className="header">{book.title}</div>
                    <div className="meta">
                      <span>{book.author}</span>
                    </div>
                    <div className="description">
                      <p>{book.editorial} - {t('edition')} {book.edition}</p>
                    </div>
                  </div>
                  <div className="extra content">
                    <span className={`ui ${book.status === 'available' ? 'green' : 'red'} label`}>
                      {(t(book.status)).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ui message">{t('nothingOnShelves')}</div>
          )}
        </div>
        <div className="ui pagination menu" style={{ marginTop: '3rem' }}>
          {[...Array(totalPages)].map((_, index) => (
            <a
              className={`item ${index + 1 === currentPage ? 'active' : ''}`}
              key={index}
              onClick={() => setCurrentPage(index + 1)}
            >
              {t('page')} {index + 1}
            </a>
          ))}
        </div>
      </div>
    </div>
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

export default IndexPage;
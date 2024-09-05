// pages/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Book {
  _id: string;
  title: string;
  image?: string;
}

const IndexPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchTerm]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, {
        params: { page: currentPage, search: searchTerm },
      });

      console.log('response: ', response);
      setBooks(response.data.books);

      // Calculate total pages based on the total number of books and books per page
      const booksPerPage = 10;
      const totalBooks = response.data.totalBooks || 0;
      setTotalPages(Math.ceil(totalBooks / booksPerPage) || 1);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      setTotalPages(1);
    }
  };

  return (
    <div>
      <Navbar isLoggedIn={false} />
      <div className="ui container" style={{ marginTop: '20px' }}>
        <div className="ui fluid category search">
          <div className="ui icon input">
            <input
              className="prompt"
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search icon"></i>
          </div>
        </div>
        <div className="ui grid" style={{ marginTop: '20px' }}>
          {books.length > 0 ? (
            books.map((book) => (
              <div className="four wide column" key={book._id}>
                <div className="ui card">
                  <div className="image">
                    <img src={book.image || '/placeholder.png'} alt={book.title} />
                  </div>
                  <div className="content">
                    <div className="header">{book.title}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ui message" style={{ textAlign: 'center', margin: '2rem auto 0rem' }}>
              <div className="header">Oops, nothing on our shelves at the moment</div>
            </div>
          )}
        </div>
        <div className="ui pagination menu" style={{ marginTop: '3rem' }}>
          {[...Array(totalPages)].map((_, index) => (
            <a
              className={`item ${index + 1 === currentPage ? 'active' : ''}`}
              key={index}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
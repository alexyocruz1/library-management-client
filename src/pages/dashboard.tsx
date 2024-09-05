// pages/dashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const DashboardPage: React.FC = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchItems();
  }, [currentPage, searchTerm]);

  const fetchItems = async () => {
    const response = await axios.get(`/api/items`, {
      params: { page: currentPage, search: searchTerm },
    });
    setItems(response.data.items);
    setTotalPages(response.data.totalPages);
  };

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <div className="ui container">
        <div className="ui fluid category search">
          <div className="ui icon input">
            <input
              className="prompt"
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search icon"></i>
          </div>
        </div>
        <div className="ui grid">
          {items.map((item) => (
            <div className="four wide column" key={item._id}>
              <div className="ui card">
                <div className="image">
                  <img src={item.image || '/placeholder.png'} alt={item.title} />
                </div>
                <div className="content">
                  <div className="header">{item.title}</div>
                  <div className="meta">{item.type}</div>
                  <div className="description">{item.description}</div>
                </div>
                <div className="extra content">
                  <button className="ui button">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="ui pagination menu">
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

export default DashboardPage;
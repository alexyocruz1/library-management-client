// pages/admin/borrow-return.tsx
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';

const BorrowReturnPage: React.FC = () => {
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
      <div className="ui container">
        <h2>{action === 'borrow' ? 'Borrow a Book' : 'Return a Book'}</h2>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Grade</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Observations</label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button className="ui button" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default BorrowReturnPage;
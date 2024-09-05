// pages/admin/create.tsx
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';

const CreatePage: React.FC = () => {
  const [type, setType] = useState<'book' | 'equipment'>('book');
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    author: '',
    editorial: '',
    edition: '',
    category: '',
    coverType: '',
    location: '',
    cost: '',
    dateAcquired: new Date().toISOString().split('T')[0],
    description: '',
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
        <h2>Create {type === 'book' ? 'Book' : 'Equipment'}</h2>
        <form className="ui form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </div>
          {type === 'book' && (
            <>
              <div className="field">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Editorial</label>
                <input
                  type="text"
                  name="editorial"
                  value={formData.editorial}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Edition</label>
                <input
                  type="text"
                  name="edition"
                  value={formData.edition}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Cover Type</label>
                <input
                  type="text"
                  name="coverType"
                  value={formData.coverType}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Location</label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="field">
                <label>Cost</label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Date Acquired</label>
                <input
                  type="date"
                  name="dateAcquired"
                  value={formData.dateAcquired}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          {type === 'equipment' && (
            <div className="field">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          )}
          <button className="ui button" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
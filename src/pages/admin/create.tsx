// pages/admin/create.tsx
import React, { useState, CSSProperties } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { Dropdown, DropdownProps, Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { Icon } from 'semantic-ui-react';

interface Book {
  _id: string;
  code: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  category: string;
  coverType: string;
  location: string;
  cost: string;
  dateAcquired: string;
  description: string;
  imageUrl?: string;
  copies?: number;
  condition: 'new' | 'used';
  copiesCount?: number;
}

interface FormData {
  [key: string]: string | number | undefined;
  code: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  category: string;
  coverType: string;
  location: string;
  cost: string;
  dateAcquired: string;
  description: string;
  imageUrl: string;
  copies?: number;
  condition: 'new' | 'used';
}

const CreatePage: React.FC = () => {
  const { t } = useTranslation('common');
  const [type, setType] = useState<'book' | 'equipment'>('book');
  const [formData, setFormData] = useState<FormData>({
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
    imageUrl: '',
    condition: 'new',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const requiredFields = ['title', 'author', 'editorial', 'edition', 'category', 'coverType', 'location', 'cost', 'dateAcquired'];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      toast.error(t('fillAllRequiredFields'));
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, formData);
      if (response.status === 201) {
        toast.success(t('bookCreatedSuccess'));
        // Reset form
        setFormData({
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
          imageUrl: '',
          condition: 'new',
        });
        setSearchTerm('');
        setSearchResults([]);
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error(t('bookCreationError'));
    }
  };

  const handleSearch = async () => {
    console.log('Searching for:', searchTerm);
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/search?q=${encodeURIComponent(searchTerm)}`;
      console.log('Search URL:', url);
      const response = await axios.get(url);
      console.log('Search response:', response.data);
      setSearchResults(response.data.books);
    } catch (error) {
      console.error('Error searching books:', error);
      toast.error(t('errorSearchingBooks'));
    }
  };

  const handleBookSelect = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const book = searchResults.find(book => book._id === data.value);
    if (book) {
      setSelectedBook(book);
      setFormData({
        ...book,
        code: `${book.code}-copy`,
        dateAcquired: new Date().toISOString().split('T')[0],
        imageUrl: book.imageUrl || '',
        copies: book.copies || 0,
      });
    }
  };

  const handleCopyBook = async () => {
    if (!selectedBook) {
      toast.error(t('noBookSelected'));
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/${selectedBook._id}/copy`, formData);
      if (response.status === 201) {
        toast.success(t('bookCopiedSuccess'));
        // Update the copies count in the UI
        setSelectedBook({
          ...selectedBook,
          copies: response.data.copiesCount
        } as Book);
        // Optionally, you can update the search results as well
        setSearchResults(prevResults =>
          prevResults.map(book =>
            book._id === selectedBook._id ? { ...book, copiesCount: response.data.copiesCount } : book
          )
        );
      }
    } catch (error) {
      console.error('Error copying book:', error);
      toast.error(t('bookCopyError'));
    }
  };

  const isFieldEmpty = (field: string) => submitted && !formData[field];

  const errorStyle: CSSProperties = {
    borderColor: '#e0b4b4',
    backgroundColor: '#fff6f6',
  };

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <div className="ui container" style={{ margin: '2rem auto', padding: '2rem', maxWidth: '800px' }}>
        <h2>{t('createBook')}</h2>
        
        <div className="ui fluid action input" style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder={t('searchExistingBooks')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="ui icon button" onClick={handleSearch}>
            <Icon name="search" />
          </button>
        </div>

        {searchResults.length > 0 && (
          <Dropdown
            placeholder={t('selectBookToCopy')}
            fluid
            search
            selection
            options={searchResults.map(book => ({
              key: book._id,
              text: book.title,
              value: book._id,
            }))}
            onChange={handleBookSelect}
            style={{ marginBottom: '1rem' }}
          />
        )}

        {selectedBook && (
          <div style={{ marginBottom: '2rem'}}>
            <Button primary onClick={handleCopyBook}>
              {t('copySelectedBook')}
            </Button>
            <p>{t('copiesCount', { count: selectedBook.copiesCount })}</p>
          </div>
        )}

        <form className="ui form" onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          {type === 'book' && (
            <>
              <div className="field">
                <label>{t('title')}</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t('enterTitle')}
                  style={isFieldEmpty('title') ? errorStyle : {}}
                />
              </div>
              <div className="field">
                <label>{t('author')}</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder={t('enterAuthor')}
                  style={isFieldEmpty('author') ? errorStyle : {}}
                />
              </div>
              <div className="field">
                <label>{t('editorial')}</label>
                <input
                  type="text"
                  name="editorial"
                  value={formData.editorial}
                  onChange={handleChange}
                  placeholder={t('enterEditorial')}
                  style={isFieldEmpty('editorial') ? errorStyle : {}}
                />
              </div>

              <div className="three fields">
                <div className="field">
                  <label>{t('edition')}</label>
                  <input
                    type="text"
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                    placeholder={t('enterEdition')}
                    style={isFieldEmpty('edition') ? errorStyle : {}}
                  />
                </div>
                <div className="field">
                  <label>{t('category')}</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder={t('enterCategory')}
                    style={isFieldEmpty('category') ? errorStyle : {}}
                  />
                </div>
                <div className="field">
                  <label>{t('coverType')}</label>
                  <input
                    type="text"
                    name="coverType"
                    value={formData.coverType}
                    onChange={handleChange}
                    placeholder={t('enterCoverType')}
                    style={isFieldEmpty('coverType') ? errorStyle : {}}
                  />
                </div>
              </div>

              <div className="field">
                <label>{t('condition')}</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  style={isFieldEmpty('condition') ? errorStyle : {}}
                >
                  <option value="good">{t('good')}</option>
                  <option value="regular">{t('regular')}</option>
                  <option value="bad">{t('bad')}</option>
                </select>
              </div>

              <div className="field">
                <label>{t('location')}</label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t('enterLocation')}
                  style={isFieldEmpty('location') ? errorStyle : {}}
                ></textarea>
              </div>

              <div className="two fields">
                <div className="field">
                  <label>{t('cost')}</label>
                  <input
                    type="text"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder={t('enterCost')}
                    style={isFieldEmpty('cost') ? errorStyle : {}}
                  />
                </div>
                <div className="field">
                  <label>{t('dateAcquired')}</label>
                  <input
                    type="date"
                    name="dateAcquired"
                    value={formData.dateAcquired}
                    onChange={handleChange}
                    style={isFieldEmpty('dateAcquired') ? errorStyle : {}}
                  />
                </div>
              </div>

              <div className="field">
                <label>{t('imageUrl')}</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder={t('optionalImageUrl')}
                />
              </div>
            </>
          )}
          {type === 'equipment' && (
            <div className="field">
              <label>{t('description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          )}
          <button className="ui button" type="submit" style={{ marginTop: '1rem' }}>
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

export default CreatePage;
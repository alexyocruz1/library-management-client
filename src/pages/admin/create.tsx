// pages/admin/create.tsx
import React, { useState, CSSProperties, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { Dropdown, DropdownProps, Button, Segment, Header, Icon } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import Image from 'next/image';

interface Book {
  _id: string;
  code: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  categories: string[];
  coverType: string;
  location: string;
  cost: string;
  dateAcquired: string;
  description: string;
  imageUrl?: string;
  copies?: number;
  condition: 'good' | 'regular' | 'bad';
  copiesCount?: number;
}

interface FormData {
  [key: string]: string | number | string[] | undefined;
  invoiceCode: string;
  code: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  categories: string[];
  coverType: string;
  location: string;
  cost: string;
  dateAcquired: string;
  description: string;
  imageUrl: string;
  copies?: number;
  condition: 'good' | 'regular' | 'bad';
}

// Dynamically import CreatableSelect with ssr option set to false
const CreatableSelect = dynamic(
  () => import('react-select/creatable').then((mod) => mod.default),
  { ssr: false }
);

const CreatePage: React.FC = () => {
  const { t } = useTranslation('common');
  const [type, setType] = useState<'book' | 'equipment'>('book');
  const [formData, setFormData] = useState<FormData>({
    invoiceCode: '',
    code: '',
    title: '',
    author: '',
    editorial: '',
    edition: '',
    categories: [],
    coverType: '',
    location: '',
    cost: '',
    dateAcquired: new Date().toISOString().split('T')[0],
    description: '',
    imageUrl: '',
    condition: 'good',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isValidImageUrl, setIsValidImageUrl] = useState<boolean | null>(null);

  const selectId = 'category-select';

  useEffect(() => {
    fetchCategories();
    setIsMounted(true);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (selectedOptions: any) => {
    setSelectedCategories(selectedOptions.map((option: any) => option.value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    if (url === '') {
      setIsValidImageUrl(null);
      setPreviewImage(null);
    } else if (isValidUrl(url)) {
      setIsValidImageUrl(true);
      setPreviewImage(url);
    } else {
      setIsValidImageUrl(false);
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const requiredFields = ['invoiceCode', 'title', 'author', 'editorial', 'edition', 'categories', 'coverType', 'location', 'cost', 'dateAcquired'];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      toast.error(t('fillAllRequiredFields'));
      return;
    }

    try {
      const bookData = {
        ...formData,
        categories: selectedCategories,
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, bookData);
      if (response.status === 201) {
        toast.success(t('bookCreatedSuccess'));
        // Reset form
        setFormData({
          invoiceCode: '',
          code: '',
          title: '',
          author: '',
          editorial: '',
          edition: '',
          categories: [],
          coverType: '',
          location: '',
          cost: '',
          dateAcquired: new Date().toISOString().split('T')[0],
          description: '',
          imageUrl: '',
          condition: 'good',
        });
        setSearchTerm('');
        setSearchResults([]);
        setSubmitted(false);
        setSelectedCategories([]);
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
        ...formData,
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
        
        <Segment>
          <Header as='h3'>
            <Icon name='search' />
            <Header.Content>{t('searchExistingBooks')}</Header.Content>
          </Header>
          <div className="ui fluid action input" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder={t('searchExistingBooks')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button icon='search' onClick={handleSearch} />
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
            <div style={{ marginTop: '1rem' }}>
              <Button primary onClick={handleCopyBook}>
                {t('copySelectedBook')}
              </Button>
              <span style={{ marginLeft: '1rem' }}>
                {t('copiesCount', { count: selectedBook.copiesCount })}
              </span>
            </div>
          )}
        </Segment>

        <Segment>
          <Header as='h3'>
            <Icon name='book' />
            <Header.Content>{t('createNewBook')}</Header.Content>
          </Header>
          <form className="ui form" onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <div className="field">
              <label>{t('invoiceCode')}</label>
              <input
                type="text"
                name="invoiceCode"
                value={formData.invoiceCode}
                onChange={handleChange}
                placeholder={t('enterInvoiceCode')}
                style={isFieldEmpty('invoiceCode') ? errorStyle : {}}
              />
            </div>
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
                </div>

                <div className="field">
                  <label>{t('categories')}</label>
                  {isMounted && (
                    <CreatableSelect
                      instanceId={selectId}
                      isMulti
                      options={categories.map(cat => ({ value: cat, label: cat }))}
                      onChange={handleCategoryChange}
                      value={selectedCategories.map(cat => ({ value: cat, label: cat }))}
                      placeholder={t('selectOrTypeCategories')}
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                    />
                  )}
                </div>

                <div className="field">
                  <label>{t('location')}</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={t('enterLocation')}
                    style={isFieldEmpty('location') ? errorStyle : {}}
                  />
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
                    onChange={handleImageUrlChange}
                    placeholder={t('optionalImageUrl')}
                  />
                  {isValidImageUrl === false && (
                    <div style={{ color: 'red', marginTop: '5px' }}>
                      {t('invalidImageUrl')}
                    </div>
                  )}
                  {previewImage && (
                    <div style={{ marginTop: '10px' }}>
                      <Image src={previewImage} alt="Preview" width={200} height={200} objectFit="contain" />
                    </div>
                  )}
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
        </Segment>
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
// pages/admin/create.tsx
import React, { useState, CSSProperties, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Navbar from '../../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { Dropdown, DropdownProps, Button, Segment, Header, Icon, Grid, Form, InputOnChangeData, TextAreaProps, Confirm } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styled from 'styled-components';
import { colors } from '../../styles/colors';
import { tokens } from '../../styles/tokens';
import { jwtDecode } from 'jwt-decode'; // Change to named import
import { Book } from '../../types/book';

interface FormData {
  invoiceCode: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  categories: string[];
  coverType: string;
  imageUrl: string;
  status: string;
  condition: string;
  location: string;
  company: string | null;
  code: string;
  cost: string;
  dateAcquired: string;
  observations: string;
  description: string;
  copies?: number;
}

const CreatableSelect = dynamic(
  () => import('react-select/creatable').then((mod) => mod.default),
  { ssr: false }
);

const PlayfulContainer = styled.div`
  background-color: ${colors.background}F0;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin-top: 2em;
`;

const PlayfulHeader = styled.h2`
  font-family: 'KidsFont', sans-serif !important;
  color: ${colors.primary} !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const PlayfulSegment = styled(Segment)`
  border-radius: 15px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
`;

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
    coverType: 'soft',
    imageUrl: '',
    status: 'available',
    condition: 'good',
    location: '',
    company: null,
    cost: '',
    dateAcquired: new Date().toISOString().split('T')[0],
    observations: '',
    description: '',
    copies: 1, // Add this line
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
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isEditableField, setIsEditableField] = useState<{[key: string]: boolean}>({});
  const [costInput, setCostInput] = useState('');
  const [company, setCompany] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [dropdownKey, setDropdownKey] = useState(0);

  const selectId = 'category-select';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token) as { company: string };
      setUserCompany(decodedToken.company);
      setFormData(prevData => ({
        ...prevData,
        company: decodedToken.company,
      }));
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []); // Empty dependency array ensures this runs only once after mount

  useEffect(() => {
    if (isMounted) {
      fetchCategories();
    }
  }, [isMounted]);

  useEffect(() => {
    if (userCompany) {
      setFormData(prevData => ({
        ...prevData,
        company: userCompany,
      }));
    }
  }, [userCompany]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (selectedOptions: any) => {
    const newCategories = selectedOptions.map((option: any) => option.value);
    setSelectedCategories(newCategories);
    
    // Check for new categories and add them to the categories state
    newCategories.forEach((category: string) => {
      if (!categories.includes(category)) {
        setCategories(prevCategories => [...prevCategories, category]);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | DropdownProps) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCostInput(value);
      setFormData(prev => ({ ...prev, cost: value }));
    }
  };

  const handleCostBlur = () => {
    if (costInput) {
      const formattedValue = parseFloat(costInput).toFixed(2);
      setCostInput(formattedValue);
      setFormData(prev => ({ ...prev, cost: formattedValue }));
    }
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

  const convertFormDataToBook = (formData: FormData): Omit<Book, '_id' | 'copies' | 'copiesCount'> => {
    return {
      ...formData,
      cost: parseFloat(formData.cost) || 0,
      company: formData.company || userCompany || '',
      categories: selectedCategories,
      // Add any other necessary conversions here
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const requiredFields: (keyof FormData)[] = [
      'invoiceCode', 'title', 'author', 'editorial', 'edition', 
      'categories', 'coverType', 'location', 'cost', 'dateAcquired', 'company'
    ];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      toast(t('fillAllRequiredFields'), { type: 'error' });
      return;
    }

    try {
      const bookData = convertFormDataToBook({
        ...formData,
        company: userCompany || '',
      });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, bookData);
      if (response.status === 201) {
        toast(t('bookCreatedSuccess'), { type: 'success' });
        setFormData({
          invoiceCode: '',
          code: '',
          title: '',
          author: '',
          editorial: '',
          edition: '',
          categories: [],
          coverType: 'soft',
          imageUrl: '',
          status: 'available',
          condition: 'good',
          location: '',
          cost: '',
          dateAcquired: new Date().toISOString().split('T')[0],
          description: '',
          company: userCompany || '', // Ensure company is always a string
          observations: '',
          copies: 1,
        });
        setSearchTerm('');
        setSearchResults([]);
        setSubmitted(false);
        setSelectedCategories([]);
        setCostInput('');
      }
    } catch (error: unknown) {
      console.error('Error creating book:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Error response:', axiosError.response.data);
        }
      }
      toast(t('bookCreationError'), { type: 'error' });
    }
  };

  const handleSearch = async () => {
    setIsSearchMode(true);
    try {
      if (!userCompany) {
        toast(t('companyNotFound'), { type: 'error' });
        return;
      }
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/search?q=${encodeURIComponent(searchTerm)}&company=${encodeURIComponent(userCompany)}`;
      const response = await axios.get(url);
      setSearchResults(response.data.books);
    } catch (error) {
      toast(t('errorSearchingBooks'), { type: 'error' });
    }
  };

  const renderSearchResults = () => {
    return searchResults.map((book) => ({
      key: book._id,
      text: (
        <div>
          <strong>{book.title}</strong>
          <br />
          {t('author')}: {book.author}
          <br />
          {t('edition')}: {book.edition} | {t('editorial')}: {book.editorial}
          <br />
          {t('copies')}: {book.copiesCount || 1}
        </div>
      ),
      value: book._id,
    }));
  };

  const handleBookSelect = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const book = searchResults.find(book => book._id === data.value);
    if (book) {
      setSelectedBook(book);
      
      const dateAcquired = book.dateAcquired ? new Date(book.dateAcquired).toISOString().split('T')[0] : '';
      const formattedCost = typeof book.cost === 'number' ? book.cost.toFixed(2) : '';

      setFormData({
        ...book,
        code: `${book.code}-copy`,
        dateAcquired: dateAcquired,
        imageUrl: book.imageUrl || '',
        cost: formattedCost,
        invoiceCode: book.invoiceCode || '',
        copies: 1,
      });
      setSelectedCategories(book.categories || []);
      setIsSearchMode(true);
      setIsEditableField({
        invoiceCode: true,
        coverType: true,
        location: true,
        cost: true,
        dateAcquired: true,
        condition: true,
        categories: true,
        imageUrl: true,
        title: false,
        author: false,
        editorial: false,
        edition: false,
      });
      setCostInput(formattedCost);
    }
  };

  const handleCopyBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook) {
      toast.error(t('noBookSelected'));
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/${selectedBook._id}/copy`, {
        invoiceCode: formData.invoiceCode,
        location: formData.location,
        cost: formData.cost,
        dateAcquired: formData.dateAcquired,
        observations: formData.description,
        condition: formData.condition,
        company: userCompany,
      });

      if (response.status === 201) {
        toast.success(t('bookCopiedSuccess'));
        
        // Update the copiesCount in the UI
        const updatedBook = { ...selectedBook, copiesCount: response.data.copiesCount };
        setSelectedBook(updatedBook);

        // Update the search results to reflect the new copy
        updateSearchResults(updatedBook);

        toast.info(t('currentCopies', { count: response.data.copiesCount }), { autoClose: 3000 });

        // Force re-render of dropdown
        setDropdownKey(prevKey => prevKey + 1);
      }
    } catch (error) {
      console.error('Error copying book:', error);
      toast.error(t('bookCopyError'));
    }
  };

  const updateSearchResults = (newBook: Book) => {
    setSearchResults(prevResults => {
      const index = prevResults.findIndex(book => book._id === newBook._id);
      if (index !== -1) {
        const updatedResults = [...prevResults];
        updatedResults[index] = { ...updatedResults[index], copiesCount: newBook.copiesCount };
        return updatedResults;
      }
      return prevResults;
    });
    // Force re-render of dropdown
    setDropdownKey(prevKey => prevKey + 1);
  };

  const toggleMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setFormData({
        invoiceCode: '',
        code: '',
        title: '',
        author: '',
        editorial: '',
        edition: '',
        categories: [],
        coverType: 'soft',
        location: '',
        cost: '',
        dateAcquired: new Date().toISOString().split('T')[0],
        description: '',
        imageUrl: '',
        condition: 'good',
        status: 'available',
        company: '',
        observations: '',
        copies: 1, // Add this line
      });
      setSelectedCategories([]);
      setSelectedBook(null);
      setCostInput('');
    } else {
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const isFieldEmpty = (field: keyof FormData) => {
    return submitted && !formData[field];
  };

  const errorStyle: CSSProperties = {
    borderColor: '#e0b4b4',
    backgroundColor: '#fff6f6',
  };

  const renderCopyForm = () => {
    if (!selectedBook) return null;

    return (
      <form className="ui form" onSubmit={handleCopyBook} style={{ marginTop: '2rem' }}>
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
        <div className="field">
          <label>{t('coverType')}</label>
          <select
            name="coverType"
            value={formData.coverType}
            onChange={handleChange}
            required
          >
            <option value="">{t('selectCoverType')}</option>
            <option value="hard">{t('hardCover')}</option>
            <option value="soft">{t('softCover')}</option>
          </select>
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
        <div className="field">
          <label>{t('cost')}</label>
          <input
            type="text"
            name="cost"
            value={costInput}
            onChange={handleCostChange}
            onBlur={handleCostBlur}
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
        <div className="field">
          <label>{t('condition')}</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as 'good' | 'regular' | 'bad' })}
            style={isFieldEmpty('condition') ? errorStyle : {}}
          >
            <option value="good">{t('good')}</option>
            <option value="regular">{t('regular')}</option>
            <option value="bad">{t('bad')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('categories')}</label>
          {isMounted ? (
            <CreatableSelect
              isMulti
              options={categories.map(cat => ({ value: cat, label: cat }))}
              onChange={handleCategoryChange}
              value={selectedCategories.map(cat => ({ value: cat, label: cat }))}
              placeholder={t('selectOrTypeCategories')}
            />
          ) : (
            <div>Loading categories...</div>
          )}
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
        <Button className="ui primary button" type="submit" style={{ marginTop: '1rem' }}>
          {t('copySelectedBook')}
        </Button>
      </form>
    );
  };

  const handleResetForm = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmReset = () => {
    setFormData({
      invoiceCode: '',
      code: '',
      title: '',
      author: '',
      editorial: '',
      edition: '',
      categories: [],
      coverType: 'soft',
      location: '',
      cost: '',
      dateAcquired: new Date().toISOString().split('T')[0],
      description: '',
      imageUrl: '',
      condition: 'good',
      status: 'available',
      company: '',
      observations: '',
      copies: 1, // Add this line
    });
    setSelectedCategories([]);
    setCostInput('');
    setSelectedBook(null);
    setIsSearchMode(false);
    setIsResetConfirmOpen(false);
    toast.success(t('formResetSuccess'));
  };

  const buttonStyle = {
    backgroundColor: colors.secondary,
    color: 'white',
    borderRadius: '20px',
    fontFamily: "'KidsFont', sans-serif",
    transition: 'all 0.3s ease',
    marginTop: '1rem',
    marginBottom: '1rem',
  };
  
  return (
    <div>
      <Navbar isLoggedIn={true} />
      <PlayfulContainer>
        <PlayfulHeader>{t('createBook')}</PlayfulHeader>
        
        <PlayfulSegment>
          <Header as='h3'>
            <Icon name={isSearchMode ? 'search' : 'book'} />
            <Header.Content>
              {isSearchMode ? t('searchExistingBooks') : t('createNewBook')}
            </Header.Content>
          </Header>
          
          <Button onClick={toggleMode} style={{ marginBottom: '1rem' }}>
            {isSearchMode ? t('createNewBook') : t('searchExistingBooks')}
          </Button>

          {isSearchMode ? (
            <>
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
                  placeholder={t('searchBooks')}
                  fluid
                  search
                  selection
                  options={renderSearchResults()}
                  onChange={handleBookSelect}
                  value={selectedBook?._id || ''}
                  key={`${searchResults.length}-${dropdownKey}`}
                />
              )}

              {renderCopyForm()}
            </>
          ) : (
            <Form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
              <Form.Input
                label={t('invoiceCode')}
                name="invoiceCode"
                value={formData.invoiceCode}
                onChange={handleChange}
                placeholder={t('enterInvoiceCode')}
                error={isFieldEmpty('invoiceCode')}
              />
              {type === 'book' && (
                <>
                  <Form.Input
                    label={t('title')}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t('enterTitle')}
                    error={isFieldEmpty('title')}
                    disabled={isSearchMode}
                  />
                  <Form.Input
                    label={t('author')}
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder={t('enterAuthor')}
                    error={isFieldEmpty('author')}
                    disabled={isSearchMode}
                  />
                  <Form.Input
                    label={t('editorial')}
                    name="editorial"
                    value={formData.editorial}
                    onChange={handleChange}
                    placeholder={t('enterEditorial')}
                    error={isFieldEmpty('editorial')}
                    disabled={isSearchMode}
                  />

                  <Form.Group widths='equal'>
                    <Form.Input
                      label={t('edition')}
                      name="edition"
                      value={formData.edition}
                      onChange={handleChange}
                      placeholder={t('enterEdition')}
                      error={isFieldEmpty('edition')}
                      disabled={isSearchMode}
                    />
                    <Form.Select
                      fluid
                      label={t('coverType')}
                      name="coverType"
                      options={[
                        { key: 'hard', text: t('hardCover'), value: 'hard' },
                        { key: 'soft', text: t('softCover'), value: 'soft' },
                      ]}
                      placeholder={t('selectCoverType')}
                      value={formData.coverType}
                      onChange={handleChange}
                      error={isFieldEmpty('coverType')}
                    />
                    <Form.Select
                      fluid
                      label={t('condition')}
                      name="condition"
                      options={[
                        { key: 'new', text: t('new'), value: 'new' },
                        { key: 'good', text: t('good'), value: 'good' },
                        { key: 'regular', text: t('regular'), value: 'regular' },
                        { key: 'bad', text: t('bad'), value: 'bad' },
                      ]}
                      placeholder={t('selectCondition')}
                      value={formData.condition}
                      onChange={handleChange}
                      error={isFieldEmpty('condition')}
                    />
                  </Form.Group>

                  <Form.Field>
                    <label>{t('categories')}</label>
                    {isMounted ? (
                      <CreatableSelect
                        isMulti
                        options={categories.map(cat => ({ value: cat, label: cat }))}
                        onChange={handleCategoryChange}
                        value={selectedCategories.map(cat => ({ value: cat, label: cat }))}
                        placeholder={t('selectOrTypeCategories')}
                      />
                    ) : (
                      <div>Loading categories...</div>
                    )}
                  </Form.Field>

                  <Form.Group widths='equal'>
                    <Form.Input
                      fluid
                      label={t('location')}
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder={t('enterLocation')}
                      error={isFieldEmpty('location')}
                    />
                    <Form.Input
                      fluid
                      label={t('cost')}
                      name="cost"
                      value={costInput}
                      onChange={handleCostChange}
                      onBlur={handleCostBlur}
                      placeholder={t('enterCost')}
                      error={isFieldEmpty('cost')}
                    />
                  </Form.Group>

                  <Form.Input
                    label={t('dateAcquired')}
                    type="date"
                    name="dateAcquired"
                    value={formData.dateAcquired}
                    onChange={handleChange}
                    error={isFieldEmpty('dateAcquired')}
                  />

                  <Form.Input
                    label={t('imageUrl')}
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder={t('optionalImageUrl')}
                    error={isValidImageUrl === false}
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
                </>
              )}
              {type === 'equipment' && (
                <Form.TextArea
                  label={t('description')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              )}
              <Form.Input
                fluid
                label={t('company')}
                name="company"
                value={formData.company}
                disabled
              />
              <Button primary type="submit" style={{ marginTop: '1rem' }} disabled={isSearchMode}>
                {t('submit')}
              </Button>
            </Form>
          )}
        </PlayfulSegment>
      </PlayfulContainer>
      <Button 
        onClick={handleResetForm} 
        icon 
        labelPosition='left'
        style={buttonStyle}
        className="reset-button"
      >
        <Icon name='undo' />
        {t('resetForm')}
      </Button>

      <Confirm
        open={isResetConfirmOpen}
        content={t('resetFormConfirmation')}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={confirmReset}
        cancelButton={t('cancel')}
        confirmButton={t('confirm')}
      />
      <style jsx global>{`
        .reset-button:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
        }
        .reset-button:active {
          transform: scale(0.95) !important;
        }
      `}</style>
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
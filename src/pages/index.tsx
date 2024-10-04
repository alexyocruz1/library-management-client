// pages/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { Container, Grid, Card, Input, Pagination, Loader, Message, Label, Dropdown, Segment, Header, Icon, DropdownProps, PaginationProps, Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookDetailsModal from '../components/BookDetailsModal';
import styled from 'styled-components';
import { colors } from '../styles/colors';
import { jwtDecode } from 'jwt-decode'; // Change to named import
import { useRouter } from 'next/router';
import { Book } from '../types/book';

const BookImage: React.FC<{ src: string | null; alt: string }> = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(src);

  if (!imgSrc) {
    return (
      <div style={{
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        color: '#888',
      }}>
        <Icon name="book" size="huge" />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative', overflow: 'hidden' }}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setImgSrc(null)}
      />
    </div>
  );
};

const BOOKS_PER_PAGE = 12;

// Styled components for a more playful look
const PlayfulContainer = styled(Container)`
  background-color: ${colors.background}F0; // F0 adds 94% opacity
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin-top: 2em;
`;

const PlayfulHeader = styled(Header)`
  font-family: 'KidsFont', sans-serif !important;
  color: ${colors.primary} !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const PlayfulCard = styled(Card)`
  border-radius: 15px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  transition: transform 0.3s ease-in-out !important;
  background-color: white !important;

  &:hover {
    transform: scale(1.05);
  }
`;

const PlayfulButton = styled(Button)`
  background-color: ${colors.secondary} !important;
  color: white !important;
  border-radius: 20px !important;
  font-family: 'KidsFont', sans-serif !important;
`;

const StyledPagination = styled(Pagination)`
  &.ui.pagination.menu {
    font-family: 'KidsFont', sans-serif !important;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    .item {
      font-family: 'KidsFont', sans-serif !important;
      color: ${props => props.theme.colors.text};
      background-color: ${props => props.theme.colors.background};
      border-radius: 50%;
      margin: 0 2px;
      
      &:hover {
        background-color: ${props => props.theme.colors.accent};
      }
      
      &.active {
        background-color: ${props => props.theme.colors.primary};
        color: white;
      }
    }
  }
`;

const IndexPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token) as { company: string };
      setUserCompany(decodedToken.company);
      setSelectedCompany(decodedToken.company);
    }
    fetchBooks();
    checkAuthStatus();
    fetchCategories();
    fetchCompanies();
  }, [currentPage, searchTerm, selectedCategories, selectedCompany]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/categories`);
      setCategories(response.data.categories);
      setAvailableCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/companies`);
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, {
        params: { 
          page: currentPage, 
          search: searchTerm, 
          categories: selectedCategories.join(','),
          company: selectedCompany === 'all' ? undefined : selectedCompany
        },
      });
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError(t('errorFetchingBooks'));
      toast.error(t('errorFetchingBooks'));
      setBooks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const newCategory = data.value as string;
    if (newCategory && !selectedCategories.includes(newCategory)) {
      setSelectedCategories([...selectedCategories, newCategory]);
      setCurrentPage(1);
    }
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    setAvailableCategories([...availableCategories, category].sort());
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
    setCurrentPage(data.activePage as number);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div style={{ marginTop: '2em', display: 'flex', justifyContent: 'center' }}>
        <StyledPagination
          activePage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          firstItem={{
            content: <Icon name='angle double left' />,
            icon: true
          }}
          lastItem={{
            content: <Icon name='angle double right' />,
            icon: true
          }}
          prevItem={{
            content: <Icon name='angle left' />,
            icon: true
          }}
          nextItem={{
            content: <Icon name='angle right' />,
            icon: true
          }}
          ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
        />
      </div>
    );
  };

  const handleBookClick = async (book: Book) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/${book._id}`);
      setSelectedBook(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error(t('errorFetchingBookDetails'));
    }
  };

  const handleCompanyChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    setSelectedCompany(data.value as string);
    setCurrentPage(1);
  };

  const companyOptions = [
    { key: 'all', text: t('allBooks'), value: 'all' },
    ...companies.map(company => ({ key: company, text: company, value: company }))
  ];

  const handleBookUpdate = (updatedBook: Book | null) => {
    if (updatedBook === null) {
      // Book was deleted, remove it from the list
      setBooks(prevBooks => prevBooks.filter(book => book._id !== selectedBook?._id));
      setSelectedBook(null);
    } else {
      // Book was updated, update it in the list
      setBooks(prevBooks => prevBooks.map(book => 
        book._id === updatedBook._id ? updatedBook : book
      ));
      setSelectedBook(updatedBook);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '2em' }}>
      <Navbar isLoggedIn={isLoggedIn} />
      <PlayfulContainer style={{ marginTop: '2em' }}>
        <PlayfulHeader as="h1" textAlign="center">
          <Icon name="book" style={{ color: colors.primary }} />
          <Header.Content>{t('appTitle')}</Header.Content>
        </PlayfulHeader>
        <Segment raised style={{ backgroundColor: 'white', borderColor: colors.primary, borderRadius: '15px' }}>
          <Grid stackable>
            <Grid.Row>
              <Grid.Column width={6}>
                <Input
                  fluid
                  icon="search"
                  iconPosition="left"
                  placeholder={t('searchBooks')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ borderColor: colors.primary, borderRadius: '20px' }}
                />
              </Grid.Column>
              <Grid.Column width={5}>
                <Dropdown
                  fluid
                  selection
                  search
                  placeholder={t('filterByCategory')}
                  options={categories.filter(cat => !selectedCategories.includes(cat)).map(cat => ({ key: cat, text: cat, value: cat }))}
                  onChange={handleCategoryChange}
                  value=""
                  style={{ borderColor: colors.primary, borderRadius: '20px' }}
                />
              </Grid.Column>
              <Grid.Column width={5}>
                <Dropdown
                  fluid
                  selection
                  search
                  placeholder={t('selectCompany')}
                  options={companyOptions}
                  onChange={handleCompanyChange}
                  value={selectedCompany}
                  style={{ borderColor: colors.primary, borderRadius: '20px' }}
                  disabled={isLoggedIn}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          {selectedCategories.length > 0 && (
            <Segment basic style={{ marginTop: '1em', padding: 0 }}>
              <Label.Group size="small" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {selectedCategories.map(category => (
                  <Label key={category} color="pink" style={{ borderRadius: '15px' }}>
                    {category}
                    <Icon name="delete" onClick={() => removeCategory(category)} />
                  </Label>
                ))}
              </Label.Group>
              {selectedCategories.length > 3 && (
                <PlayfulButton size="tiny" onClick={() => setSelectedCategories([])}>
                  {t('clearAll')}
                </PlayfulButton>
              )}
            </Segment>
          )}
        </Segment>

        {loading ? (
          <Loader active inline="centered" />
        ) : error ? (
          <Message negative>{error}</Message>
        ) : books.length > 0 ? (
          <Grid stackable columns={3}>
            {books.map((book) => (
              <Grid.Column key={book._id}>
                <PlayfulCard fluid onClick={() => handleBookClick(book)}>
                  <BookImage src={book.imageUrl || null} alt={book.title} />
                  <Card.Content>
                    <Card.Header style={{ color: colors.primary, fontFamily: 'KidsFont, sans-serif' }}>
                      {book.title}
                    </Card.Header>
                    <Card.Meta style={{ color: colors.lightText }}>{book.author}</Card.Meta>
                    <Card.Description style={{ color: colors.text }}>
                      <p><strong style={{ color: colors.secondary }}>{t('editorial')}:</strong> {book.editorial}</p>
                      <p><strong style={{ color: colors.secondary }}>{t('edition')}:</strong> {book.edition}</p>
                      <p><strong style={{ color: colors.secondary }}>{t('location')}:</strong> {book.location}</p>
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Label.Group>
                      {book.categories.map((category, index) => (
                        <Label key={index} color="pink" style={{ borderRadius: '15px', backgroundColor: colors.accent, color: colors.text }}>{category}</Label>
                      ))}
                    </Label.Group>
                  </Card.Content>
                  <Card.Content extra>
                    <Icon name='copy' style={{ color: colors.primary }} />
                    {t('copiesCount', { count: book.copiesCount })}
                  </Card.Content>
                  <Card.Content extra>
                    <Label color={book.status === 'available' ? 'green' : 'red'} style={{ borderRadius: '15px' }}>
                      {t(book.status)}
                    </Label>
                    <Label color={book.condition === 'new' ? 'blue' : 'grey'} style={{ borderRadius: '15px' }}>
                      {t(book.condition)}
                    </Label>
                  </Card.Content>
                  <Card.Content extra>
                    <Icon name='building' style={{ color: colors.primary }} />
                    {book.company}
                  </Card.Content>
                </PlayfulCard>
              </Grid.Column>
            ))}
          </Grid>
        ) : (
          <Message info>{t('nothingOnShelves')}</Message>
        )}

        {renderPagination()}
      </PlayfulContainer>
      <BookDetailsModal
        book={selectedBook}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookUpdate={handleBookUpdate}
      />
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
// pages/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { Container, Grid, Card, Input, Pagination, Loader, Message, Label, Dropdown, Segment, Header, Icon, DropdownProps, PaginationProps } from 'semantic-ui-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Book {
  _id: string;
  invoiceCode: string;
  code: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  categories: string[];
  coverType: 'hard' | 'soft';
  location: string;
  cost: number;
  dateAcquired: string;
  status: string;
  observations: string;
  imageUrl: string;
  copiesCount: number;
  condition: 'good' | 'regular' | 'bad' | 'new';
  groupId: string;
}

const BookImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={200}
      height={300}
      objectFit="cover"
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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchBooks();
    checkAuthStatus();
    fetchCategories();
  }, [currentPage, searchTerm, categoryFilter]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, {
        params: { page: currentPage, search: searchTerm, category: categoryFilter },
      });
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages || 1);
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
    setCategoryFilter(data.value as string | null);
    setCurrentPage(1);
  };

  const handlePageChange = (e: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
    setCurrentPage(data.activePage as number);
  };

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} />
      <Container style={{ marginTop: '2em' }}>
        <Header as="h1" textAlign="center">
          <Icon name="book" />
          <Header.Content>{t('appTitle')}</Header.Content>
        </Header>
        <Segment raised>
          <Grid stackable>
            <Grid.Row>
              <Grid.Column width={10}>
                <Input
                  fluid
                  icon="search"
                  placeholder={t('searchBooks')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Grid.Column>
              <Grid.Column width={6}>
                <Dropdown
                  fluid
                  selection
                  clearable
                  placeholder={t('filterByCategory')}
                  options={categories.map(cat => ({ key: cat, text: cat, value: cat }))}
                  onChange={handleCategoryChange}
                  value={categoryFilter || undefined}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        {loading ? (
          <Loader active inline="centered" />
        ) : error ? (
          <Message negative>{error}</Message>
        ) : books.length > 0 ? (
          <Grid stackable columns={4}>
            {books.map((book) => (
              <Grid.Column key={book._id}>
                <Card fluid>
                  <BookImage src={book.imageUrl || '/placeholder.png'} alt={book.title} />
                  <Card.Content>
                    <Card.Header>{book.title}</Card.Header>
                    <Card.Meta>{book.author}</Card.Meta>
                    <Card.Description>
                      <p><strong>{t('editorial')}:</strong> {book.editorial}</p>
                      <p><strong>{t('edition')}:</strong> {book.edition}</p>
                      <p><strong>{t('location')}:</strong> {book.location}</p>
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Label.Group>
                      {book.categories.map((category, index) => (
                        <Label key={index} basic>{category}</Label>
                      ))}
                    </Label.Group>
                  </Card.Content>
                  <Card.Content extra>
                    <Icon name='copy' />
                    {t('copiesCount', { count: book.copiesCount })}
                  </Card.Content>
                  <Card.Content extra>
                    <Label color={book.status === 'available' ? 'green' : 'red'}>
                      {t(book.status)}
                    </Label>
                    <Label color={book.condition === 'new' ? 'blue' : 'grey'}>
                      {t(book.condition)}
                    </Label>
                  </Card.Content>
                </Card>
              </Grid.Column>
            ))}
          </Grid>
        ) : (
          <Message info>{t('nothingOnShelves')}</Message>
        )}

        {totalPages > 1 && (
          <div style={{ textAlign: 'center', marginTop: '2em' }}>
            <Pagination
              activePage={currentPage}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              ellipsisItem={{ content: <Icon name="ellipsis horizontal" />, icon: true }}
              firstItem={{ content: <Icon name="angle double left" />, icon: true }}
              lastItem={{ content: <Icon name="angle double right" />, icon: true }}
              prevItem={{ content: <Icon name="angle left" />, icon: true }}
              nextItem={{ content: <Icon name="angle right" />, icon: true }}
            />
          </div>
        )}
      </Container>
      <ToastContainer />
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
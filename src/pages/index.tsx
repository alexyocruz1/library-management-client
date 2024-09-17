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

  useEffect(() => {
    fetchBooks();
    checkAuthStatus();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategories]);

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

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books`, {
        params: { 
          page: currentPage, 
          search: searchTerm, 
          categories: selectedCategories.join(',')
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

  const handlePageChange = (e: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
    setCurrentPage(data.activePage as number);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const showEllipsis = totalPages > 7;
    const pageRange = 2;

    let startPage = Math.max(1, currentPage - pageRange);
    let endPage = Math.min(totalPages, currentPage + pageRange);

    if (startPage > 1) {
      startPage += 1;
    }
    if (endPage < totalPages) {
      endPage -= 1;
    }

    return (
      <div style={{ marginTop: '2em', display: 'flex', justifyContent: 'center' }}>
        <Pagination
          activePage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          firstItem={showEllipsis ? { content: '«', icon: true } : null}
          lastItem={showEllipsis ? { content: '»', icon: true } : null}
          prevItem={{ content: '', icon: true }}
          nextItem={{ content: '›', icon: true }}
          ellipsisItem={showEllipsis ? { content: '...', icon: true } : null}
          boundaryRange={1}
          siblingRange={1}
        />
      </div>
    );
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
                  search
                  placeholder={t('filterByCategory')}
                  options={categories.filter(cat => !selectedCategories.includes(cat)).map(cat => ({ key: cat, text: cat, value: cat }))}
                  onChange={handleCategoryChange}
                  value=""
                  style={{ marginBottom: '1em' }}
                />
                <div>
                  {selectedCategories.map(category => (
                    <Label key={category} color="blue" style={{ margin: '0.2em' }}>
                      {category}
                      <Icon name="delete" onClick={() => removeCategory(category)} />
                    </Label>
                  ))}
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        {loading ? (
          <Loader active inline="centered" />
        ) : error ? (
          <Message negative>{error}</Message>
        ) : books.length > 0 ? (
          <Grid stackable columns={3}>
            {books.map((book) => (
              <Grid.Column key={book._id}>
                <Card fluid style={{ height: '100%' }}>
                  <BookImage src={book.imageUrl || null} alt={book.title} />
                  <Card.Content>
                    <Card.Header style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {book.title}
                    </Card.Header>
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

        {renderPagination()}
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
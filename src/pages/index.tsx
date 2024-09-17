// pages/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { Container, Grid, Card, Input, Pagination, Loader, Message, Label, Dropdown, Segment, Header, Icon, DropdownProps, PaginationProps, Button } from 'semantic-ui-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookDetailsModal from '../components/BookDetailsModal';

// Update the BookCopy interface
export interface BookCopy {
  _id: string;
  invoiceCode: string;
  code: string;
  location: string;
  cost: number;
  dateAcquired: string;
  status: string;
  condition: string;
  observations: string;
}

// Update the Book interface
export interface Book {
  _id: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  categories: string[];
  coverType: string;
  imageUrl: string;
  copies: BookCopy[];
  copiesCount: number;
  status: string;
  condition: string;
  location: string; // Add this line
  // Add any other properties that are in your original Book interface
}

type ModalBook = Book;

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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          {selectedCategories.length > 0 && (
            <Segment basic style={{ marginTop: '1em', padding: 0 }}>
              <Label.Group size="small" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {selectedCategories.map(category => (
                  <Label key={category} color="blue">
                    {category}
                    <Icon name="delete" onClick={() => removeCategory(category)} />
                  </Label>
                ))}
              </Label.Group>
              {selectedCategories.length > 3 && (
                <Button size="tiny" basic onClick={() => setSelectedCategories([])}>
                  {t('clearAll')}
                </Button>
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
                <Card fluid style={{ height: '100%' }} onClick={() => handleBookClick(book)}>
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
      <BookDetailsModal
        book={selectedBook}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
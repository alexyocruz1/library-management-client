// pages/admin/borrow-return.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Form,
  Button,
  Message,
  Tab,
  Input,
  Icon,
  Table,
  Modal,
  Header,
  Segment,
  Container,
  Dropdown,
  DropdownProps,
  Label
} from 'semantic-ui-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styled from 'styled-components';
import { colors } from '../../styles/colors';
import { Book } from '../../types/book';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import CreatableSelect from 'react-select/creatable';
import { debounce } from 'lodash';

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
  border: 2px solid ${colors.primary} !important;
`;

const PlayfulMessageHeader = styled(Message.Header)`
  font-family: 'KidsFont', sans-serif !important;
  color: ${colors.primary} !important;
  margin-bottom: 0.5rem !important;
`;

interface BorrowForm {
  borrowerName: string;
  expectedReturnDate: string;
  comments: string;
}

interface BorrowRecord {
  _id: string;
  book: {
    title: string;
    author: string;
  };
  bookCopy: string;
  borrowerName: string;
  borrowDate: string;
  expectedReturnDate: string;
  status: 'borrowed' | 'returned' | 'overdue';
  comments: string;
}

interface BorrowHistoryRecord extends BorrowRecord {
  returnDate?: string;
  returnedBy?: {
    username: string;
  };
  borrowedBy: {
    username: string;
  };
}

const getDefaultReturnDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

const ResponsiveTable = styled(Table)`
  /* Desktop styles (default) */
  &.ui.table {
    td {
      vertical-align: middle;
    }
  }

  /* Mobile and Tablet styles */
  @media (max-width: 768px) {
    &.ui.table {
      border: none;
      
      thead {
        display: none;
      }

      tr {
        display: block;
        border: 1px solid ${colors.primary};
        border-radius: 8px;
        margin-bottom: 1em;
        padding: 0.5em;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      td {
        display: block;
        border: none;
        padding: 0.5em 0;
        text-align: left;

        &:before {
          content: attr(data-label);
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }

        &:last-child {
          text-align: right;
          padding-top: 1em;
          border-top: 1px solid rgba(0,0,0,0.1);
        }
      }
    }
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 600px;
  
  .ui.input {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100%;
  }
`;

const StatusBadge = styled(Label)`
  margin-left: 0.5rem !important;
  vertical-align: middle !important;
`;

const TableContainer = styled.div`
  position: relative;
  margin-top: 1rem;
`;

const TableLoader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const BorrowReturnPage = () => {
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownKey, setDropdownKey] = useState(0);
  const [userCompany, setUserCompany] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [borrowForm, setBorrowForm] = useState<BorrowForm>({
    borrowerName: '',
    expectedReturnDate: getDefaultReturnDate(),
    comments: ''
  });
  const router = useRouter();
  const [borrowerNames, setBorrowerNames] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeBorrows, setActiveBorrows] = useState<any[]>([]);
  const [borrowSearch, setBorrowSearch] = useState('');
  const [selectedBorrow, setSelectedBorrow] = useState<any>(null);
  const [returnComments, setReturnComments] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<BorrowHistoryRecord[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'returned', 'borrowed', 'overdue'
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token) as { company: string };
          if (decodedToken.company) {
            setUserCompany(decodedToken.company);
          } else {
            toast.error(t('companyNotFound'));
            router.push('/login');
          }
        } else {
          toast.error(t('noTokenFound'));
          router.push('/login');
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        toast.error(t('errorDecodingToken'));
        router.push('/login');
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializePage();
  }, [router, t]);

  const handleSearch = async () => {
    if (!isInitialized) return;
    
    try {
      if (!userCompany) {
        toast.error(t('companyNotFound'));
        return;
      }
      setLoading(true);
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/search?q=${encodeURIComponent(searchTerm)}&company=${encodeURIComponent(userCompany)}`;
      const response = await axios.get(url);
      setSearchResults(response.data.books);
    } catch (error) {
      toast.error(t('errorSearchingBooks'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    const delayDebounceFn = setTimeout(() => {
      if (searchTerm && userCompany) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, userCompany, isInitialized]);

  const renderSearchResults = () => {
    return searchResults.map((book) => {
      const availableCopies = book.copies.filter(copy => copy.status === 'available');
      return {
        key: book._id,
        text: (
          <div>
            <strong>{book.title}</strong>
            <br />
            {t('author')}: {book.author}
            <br />
            {t('edition')}: {book.edition} | {t('editorial')}: {book.editorial}
            <br />
            {t('availableCopies')}: {availableCopies.length}
          </div>
        ),
        value: book._id,
        disabled: !availableCopies.length,
      };
    });
  };

  const handleBookSelect = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    console.log('Book selection data:', data.value);
    const book = searchResults.find(book => book._id === data.value);
    console.log('Found book:', book);
    
    if (book) {
      const availableCopies = book.copies.filter(copy => copy.status === 'available');
      if (availableCopies.length > 0) {
        const bookWithCopy = {
          ...book,
          selectedCopy: availableCopies[0]
        };
        console.log('Setting selected book with copy:', bookWithCopy);
        setSelectedBook(bookWithCopy);
      } else {
        console.log('No available copies found');
        setSelectedBook(null);
      }
    }
  };

  useEffect(() => {
    if (selectedBook) {
      console.log('Selected book updated:', selectedBook);
      console.log('Has selectedCopy:', !!selectedBook.selectedCopy);
    }
  }, [selectedBook]);

  const handleBorrow = async () => {
    if (!selectedBook || !selectedBook.selectedCopy) return;
    
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/borrow/borrow`, {
        bookId: selectedBook._id,
        copyId: selectedBook.selectedCopy._id,
        borrowerName: borrowForm.borrowerName,
        expectedReturnDate: borrowForm.expectedReturnDate,
        comments: borrowForm.comments,
        company: userCompany
      });

      if (response.data.success) {
        toast.success(t('borrowSuccess'));
        setBorrowForm({
          borrowerName: '',
          expectedReturnDate: getDefaultReturnDate(),
          comments: ''
        });
        setSelectedBook(null);
        setSearchResults([]);
        setSearchTerm('');
        setDropdownKey(prev => prev + 1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('borrowError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowerNames = async () => {
    try {
      console.log('Fetching borrower names...');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/borrow/borrower-names`);
      console.log('Borrower names response:', response.data);
      
      if (response.data.success) {
        setBorrowerNames(response.data.borrowerNames);
      }
    } catch (error: any) {
      console.error('Error fetching borrower names:', error.response || error);
      if (error.response?.status !== 404) {
        toast.error(t('errorFetchingBorrowerNames'));
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && userCompany) {
      fetchBorrowerNames();
    }
  }, [isMounted, userCompany]);

  const handleBorrowerNameChange = (newValue: any) => {
    setBorrowForm(prev => ({
      ...prev,
      borrowerName: newValue?.value || ''
    }));
  };

  const renderBorrowForm = () => {
    return (
      <div style={{ marginTop: '2rem' }}>
        {selectedBook && (
          <Message 
            info
            style={{ marginBottom: '1rem' }}
          >
            <PlayfulMessageHeader>
              {t('selectedBookInfo')}
            </PlayfulMessageHeader>
            <p>{t('selectedBookMessage', {
              title: selectedBook.title,
              author: selectedBook.author
            })}</p>
            
            {selectedBook.selectedCopy && (
              <>
                <PlayfulMessageHeader style={{ marginTop: '1rem' }}>
                  {t('availableCopyInfo')}
                </PlayfulMessageHeader>
                <p>{t('availableCopyMessage', {
                  code: selectedBook.selectedCopy.code,
                  location: selectedBook.location
                })}</p>
              </>
            )}
          </Message>
        )}

        <Form>
          <Form.Field>
            <label>{t('borrowerName')}</label>
            <CreatableSelect
              isClearable
              options={borrowerNames.map(name => ({ value: name, label: name }))}
              onChange={handleBorrowerNameChange}
              placeholder={t('enterOrSelectBorrower')}
              value={borrowForm.borrowerName ? { value: borrowForm.borrowerName, label: borrowForm.borrowerName } : null}
            />
          </Form.Field>
          <Form.Input
            type="date"
            label={t('expectedReturnDate')}
            required
            value={borrowForm.expectedReturnDate}
            onChange={(e) => setBorrowForm({...borrowForm, expectedReturnDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
          />
          <Form.TextArea
            label={t('comments')}
            value={borrowForm.comments}
            onChange={(e) => setBorrowForm({...borrowForm, comments: e.target.value})}
          />
          <Button primary onClick={handleBorrow} loading={loading}>
            {t('borrowBook')}
          </Button>
        </Form>
      </div>
    );
  };

  const fetchActiveBorrows = async () => {
    try {
      console.log('🔍 Starting fetchActiveBorrows...');
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/borrow/active`;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (borrowSearch) {
        params.append('search', borrowSearch);
      }
      
      // Add query parameters to URL if they exist
      const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
      console.log('📡 Fetching from URL:', finalUrl);
      
      const response = await axios.get(finalUrl);
      console.log('📦 Raw response:', response);
      
      if (response.data.success) {
        if (Array.isArray(response.data.records)) {
          console.log('✅ Setting active borrows:', response.data.records.length, 'records');
          setActiveBorrows(response.data.records);
        } else {
          console.error('❌ Invalid records format:', response.data.records);
          toast.error(t('errorInvalidData'));
        }
      } else {
        console.warn('⚠️ Failed to fetch active borrows:', response.data.message);
        toast.error(response.data.message || t('errorFetchingBorrows'));
      }
    } catch (error: any) {
      console.error('❌ Error in fetchActiveBorrows:', error);
      console.error('❌ Response:', error.response?.data);
      toast.error(error.response?.data?.message || t('errorFetchingBorrows'));
    }
  };

  const handleReturn = async () => {
    if (!selectedBorrow) return;

    try {
      setReturnLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/borrow/return/${selectedBorrow._id}`,
        { comments: returnComments }
      );

      if (response.data.success) {
        toast.success(t('returnSuccess'));
        setReturnComments('');
        setSelectedBorrow(null);
        setReturnModalOpen(false);
        fetchActiveBorrows();
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(t('returnError'));
    } finally {
      setReturnLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Tab changed to:', activeTab);
    if (activeTab === 1) {
      console.log('📚 Return tab selected, fetching active borrows...');
      fetchActiveBorrows();
    }
  }, [activeTab]);

  const fetchBorrowHistory = async () => {
    try {
      setHistoryLoading(true);
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/borrow/history`;
      
      const params = new URLSearchParams();
      
      if (historySearch.trim()) {
        params.append('search', historySearch.trim());
      }
      if (historyFilter !== 'all') {
        params.append('status', historyFilter);
      }
      if (dateRange.start && dateRange.end) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }

      const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
      
      const response = await axios.get(finalUrl);
      if (response.data.success) {
        setHistoryRecords(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error(t('errorFetchingHistory'));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 2) { // History tab index
      fetchBorrowHistory();
    }
  }, [activeTab, historyFilter, dateRange.start, dateRange.end, historySearch]);

  const handleTabChange = (e: any, { activeIndex }: any) => {
    console.log('Tab changing to:', activeIndex);
    setActiveTab(activeIndex);
  };

  const handleBorrowSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search value:', value);
    setBorrowSearch(value);
    // Optionally refresh the list when searching
    fetchActiveBorrows();
  };

  const panes = [
    {
      menuItem: { key: 'borrow', icon: 'book', content: t('borrowBook') },
      render: () => (
        <Tab.Pane>
          <Input
            fluid
            icon='search'
            placeholder={t('searchBooks')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <Dropdown
              placeholder={t('selectBook')}
              fluid
              search
              selection
              options={renderSearchResults()}
              onChange={handleBookSelect}
              value={selectedBook?._id || ''}
              key={`${searchResults.length}-${dropdownKey}`}
            />
          )}
          {renderBorrowForm()}
        </Tab.Pane>
      )
    },
    {
      menuItem: { key: 'return', icon: 'reply', content: t('returnBook') },
      render: () => (
        <Tab.Pane>
          <SearchContainer>
            <Input
              fluid
              icon='search'
              iconPosition='left'
              placeholder={t('searchByBorrowerOrBook')}
              value={borrowSearch}
              onChange={handleBorrowSearch}
              loading={searchLoading}
              size='large'
            />
          </SearchContainer>

          {activeBorrows && activeBorrows.length > 0 ? (
            <ResponsiveTable celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('borrowerName')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('bookInfo')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('borrowDate')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('expectedReturnDate')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('actions')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {activeBorrows
                  .filter(borrow => 
                    borrow.borrowerName.toLowerCase().includes(borrowSearch.toLowerCase()) ||
                    (borrow.book?.title || '').toLowerCase().includes(borrowSearch.toLowerCase()) ||
                    borrow.bookCopy.toLowerCase().includes(borrowSearch.toLowerCase())
                  )
                  .map(borrow => (
                    <Table.Row 
                      key={borrow._id}
                      warning={borrow.status === 'overdue'}
                    >
                      <Table.Cell data-label={t('borrowerName')}>
                        {borrow.borrowerName}
                        <StatusBadge 
                          size='tiny'
                          color={borrow.status === 'overdue' ? 'red' : 'yellow'}
                        >
                          {t(borrow.status)}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell data-label={t('bookInfo')}>
                        <div>
                          <strong>{borrow.book?.title || 'N/A'}</strong>
                          <br />
                          <small>{t('code')}: {borrow.bookCopy}</small>
                        </div>
                      </Table.Cell>
                      <Table.Cell data-label={t('borrowDate')}>
                        {new Date(borrow.borrowDate).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell data-label={t('expectedReturnDate')}>
                        {new Date(borrow.expectedReturnDate).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell data-label={t('actions')} textAlign="center">
                        <Button
                          primary
                          size='small'
                          icon
                          labelPosition='left'
                          onClick={() => {
                            setSelectedBorrow(borrow);
                            setReturnModalOpen(true);
                          }}
                        >
                          <Icon name='reply' />
                          {t('return')}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </ResponsiveTable>
          ) : (
            <Message info>
              <PlayfulMessageHeader>
                {t('noActiveBorrows')}
              </PlayfulMessageHeader>
            </Message>
          )}

          <Modal
            open={returnModalOpen}
            onClose={() => setReturnModalOpen(false)}
            size="tiny"
          >
            <Modal.Header>{t('returnBook')}</Modal.Header>
            <Modal.Content>
              {selectedBorrow && (
                <div style={{ fontSize: '1.1em' }}>
                  <p>
                    <strong>{t('borrower')}:</strong> {selectedBorrow.borrowerName}
                    <StatusBadge 
                      size='tiny'
                      color={selectedBorrow.status === 'overdue' ? 'red' : 'yellow'}
                    >
                      {t(selectedBorrow.status)}
                    </StatusBadge>
                  </p>
                  <p><strong>{t('book')}:</strong> {selectedBorrow.book?.title}</p>
                  <p><strong>{t('code')}:</strong> {selectedBorrow.bookCopy}</p>
                  <p>
                    <strong>{t('borrowDate')}:</strong> {new Date(selectedBorrow.borrowDate).toLocaleDateString()}
                    <br />
                    <strong>{t('dueDate')}:</strong> {new Date(selectedBorrow.expectedReturnDate).toLocaleDateString()}
                  </p>
                  <Form>
                    <Form.TextArea
                      label={t('returnComments')}
                      value={returnComments}
                      onChange={(e) => setReturnComments(e.target.value)}
                      placeholder={t('returnCommentsPlaceholder')}
                    />
                  </Form>
                </div>
              )}
            </Modal.Content>
            <Modal.Actions>
              <Button.Group fluid>
                <Button negative onClick={() => setReturnModalOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button.Or />
                <Button 
                  positive 
                  loading={returnLoading}
                  onClick={handleReturn}
                >
                  {t('confirmReturn')}
                </Button>
              </Button.Group>
            </Modal.Actions>
          </Modal>
        </Tab.Pane>
      )
    },
    {
      menuItem: { key: 'history', icon: 'history', content: t('borrowHistory') },
      render: () => (
        <Tab.Pane>
          <Form>
            <Form.Group widths='equal'>
              <Form.Input
                icon={searchLoading ? 'spinner' : 'search'}
                loading={searchLoading}
                placeholder={t('searchHistoryPlaceholder')}
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                }}
              />
              <Form.Select
                options={[
                  { key: 'all', text: t('allStatus'), value: 'all' },
                  { key: 'borrowed', text: t('borrowed'), value: 'borrowed' },
                  { key: 'returned', text: t('returned'), value: 'returned' },
                  { key: 'overdue', text: t('overdue'), value: 'overdue' }
                ]}
                value={historyFilter}
                onChange={(_, { value }) => setHistoryFilter(value as string)}
              />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Input
                type='date'
                label={t('startDate')}
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <Form.Input
                type='date'
                label={t('endDate')}
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Form.Group>
          </Form>

          <Button 
            basic 
            onClick={() => {
              setHistorySearch('');
              setHistoryFilter('all');
              setDateRange({ start: '', end: '' });
              fetchBorrowHistory();
            }}
          >
            {t('clearFilters')}
          </Button>

          <TableContainer>
            {historyLoading && (
              <TableLoader>
                <Icon name='spinner' loading size='large' />
              </TableLoader>
            )}
            
            {historyRecords.length > 0 ? (
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>{t('borrowerName')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('title')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('code')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('borrowDate')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('expectedReturnDate')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('actualReturnDate')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('status')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('comments')}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {historyRecords.map(record => (
                    <Table.Row 
                      key={record._id}
                      positive={record.status === 'returned'}
                      negative={record.status === 'overdue'}
                      warning={record.status === 'borrowed'}
                    >
                      <Table.Cell>{record.borrowerName}</Table.Cell>
                      <Table.Cell>{record.book.title}</Table.Cell>
                      <Table.Cell>{record.bookCopy}</Table.Cell>
                      <Table.Cell>
                        {new Date(record.borrowDate).toLocaleDateString()}
                        {/*<br />
                        <small>
                          {t('by')} {record.borrowedBy?.username || t('unknown')}
                        </small>*/}
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(record.expectedReturnDate).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        {record.returnDate ? (
                          <>
                            {new Date(record.returnDate).toLocaleDateString()}
                            {/*<br />
                            <small>
                              {t('by')} {record.returnedBy?.username || t('unknown')}
                            </small>*/}
                          </>
                        ) : '-'}
                      </Table.Cell>
                      <Table.Cell>
                        <Label 
                          color={
                            record.status === 'returned' ? 'green' : 
                            record.status === 'overdue' ? 'red' : 'yellow'
                          }
                        >
                          {t(record.status)}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>{record.comments || '-'}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <Message info>
                <PlayfulMessageHeader>
                  {t('noBorrowHistory')}
                </PlayfulMessageHeader>
              </Message>
            )}
          </TableContainer>
        </Tab.Pane>
      )
    }
  ];

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <PlayfulContainer>
        <PlayfulHeader>{t('borrowReturn')}</PlayfulHeader>
        <PlayfulSegment>
          <Tab 
            panes={panes} 
            onTabChange={handleTabChange}
            activeIndex={activeTab}
          />
        </PlayfulSegment>
      </PlayfulContainer>
    </div>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default BorrowReturnPage;
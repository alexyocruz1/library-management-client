import React, { useState } from 'react';
import { Modal, Button, List, Grid, Icon, Label, Segment, Tab, Pagination, Header, Confirm, TabProps } from 'semantic-ui-react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import styled from 'styled-components';
import { colors } from '../styles/colors';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Book, BookCopy } from '../types/book';  // Adjust the path if necessary

const BookImage: React.FC<{ src: string | null; alt: string }> = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = React.useState<string | null>(src);

  if (!imgSrc) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        style={{ objectFit: 'contain' }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setImgSrc(null)}
      />
    </div>
  );
};

interface BookDetailsModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onBookUpdate: (updatedBook: Book | null) => void;
}

const PlayfulModal = styled(Modal)`
  &.ui.modal {
    display: flex !important;
    flex-direction: column;
    height: 60vh !important;
    max-height: 60vh !important;
    margin: 20vh auto !important; // Centers the modal vertically
    border-radius: 15px !important;
    
    @media (max-width: 767px) {
      height: 90vh !important; // Reduced from 100vh
      max-height: 90vh !important; // Reduced from 100vh
      margin: 5vh auto !important; // Added some margin on mobile
      border-radius: 15px !important;
    }
  }
`;

const PlayfulHeader = styled(Modal.Header)`
  background-color: ${colors.primary} !important;
  color: white !important;
  font-family: 'KidsFont', sans-serif !important;
`;

const PlayfulContent = styled(Modal.Content)`
  flex: 1;
  overflow-y: auto !important;
  padding: 0.6rem !important; // Reduced padding
  
  @media (max-width: 767px) {
    padding: 0.4rem !important;
  }
`;

const PlayfulSegment = styled(Segment)`
  border-radius: 15px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  padding: 0.6rem !important; // Reduced padding
`;

const PlayfulButton = styled(Button)`
  background-color: ${colors.secondary} !important;
  color: white !important;
  border-radius: 20px !important;
  font-family: 'KidsFont', sans-serif !important;
  
  &.mini {
    padding: 0.4em !important;
    font-size: 0.78571429rem !important;
  }
`;

const CopySegment = styled(PlayfulSegment)`
  padding: 0.8rem !important;
  margin-bottom: 0.8rem !important;
  
  &:last-child {
    margin-bottom: 0 !important;
  }
`;

const ResponsiveTab = styled(Tab)`
  height: 100%;
  display: flex;
  flex-direction: column;

  .ui.tabular.menu {
    flex-shrink: 0;
    overflow-x: auto;
    margin-bottom: 0 !important;
    border-bottom: 1px solid rgba(34, 36, 38, 0.15) !important;
    min-height: 42px !important; // Add fixed height
    height: 42px !important; // Add fixed height
    
    .item {
      height: 100% !important;
      border-bottom: none !important;
      &.active {
        border-bottom: none !important;
      }
    }
  }

  .ui.tab.segment {
    flex: 1;
    margin: 0;
    border: none;
    padding: 0.8rem 0;
    overflow: hidden !important;
  }

  @media (max-width: 767px) {
    .ui.tabular.menu {
      flex-wrap: nowrap;
      .item {
        flex: 1;
        min-width: max-content;
        padding: 0.5em !important;
      }
    }
  }
`;

const ModalActions = styled(Modal.Actions)`
  @media (max-width: 767px) {
    display: flex;
    flex-direction: column-reverse;
    .button {
      margin: 0.5rem 0 !important;
    }
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${colors.danger || '#db2828'} !important;
  color: white !important;
  border-radius: 50% !important;
  padding: 0 !important;
  width: 2em !important;
  height: 2em !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  &:hover {
    background-color: ${colors.dangerHover || '#c82121'} !important;
  }

  i.icon {
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 100% !important;
  }
`;

const InfoItem = styled(List.Item)`
  padding: 1rem 0;
  border-bottom: 1px solid rgba(34, 36, 38, 0.1);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ScrollableTabContent = styled.div`
  padding: 0;
  overflow: hidden; // Change to hidden
  height: auto; // Add this
  
  @media (max-width: 767px) {
    padding: 0;
  }
`;

const ModalGrid = styled(Grid)`
  height: 100%;
  margin: 0 !important;
  
  @media (max-width: 767px) {
    .column {
      padding: 0.4rem !important;
    }
  }
`;

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, open, onClose, onBookUpdate }) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(0);
  const [currentCopyPage, setCurrentCopyPage] = useState(1);
  const copiesPerPage = 10;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCopyConfirmOpen, setDeleteCopyConfirmOpen] = useState(false);
  const [copyToDelete, setCopyToDelete] = useState<BookCopy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteBook = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/${book?._id}`);
      toast.success(t('bookDeletedSuccess'));
      onClose();
      onBookUpdate(null); // This is now type-safe
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error(t('bookDeleteError'));
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleDeleteCopy = async () => {
    if (!book || !copyToDelete) return;

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/${book._id}/decrease-copy`, {
        copyId: copyToDelete._id
      });

      if (response.data.copiesCount === 0) {
        // All copies were deleted
        onClose();
        onBookUpdate(null);
        toast.success(t('lastCopyDeletedSuccess'));
      } else {
        try {
          // Fetch updated book data using groupId
          const updatedBookResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/group/${book.groupId}`
          );
          onBookUpdate(updatedBookResponse.data);
          toast.success(t('copyDeletedSuccess'));
        } catch (error) {
          console.error('Error fetching updated book:', error);
          toast.error(t('errorFetchingBooks'));
          onClose();
        }
      }
    } catch (error) {
      console.error('Error deleting copy:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error(t('copyNotFound'));
        onClose();
      } else {
        toast.error(t('copyDeleteError'));
      }
    } finally {
      setDeleteCopyConfirmOpen(false);
      setCopyToDelete(null);
    }
  };

  if (!book) return null;

  const CopyGrid = styled(Grid)`
    margin: 0 !important;
    
    @media (max-width: 767px) {
      .column {
        padding: 0.5rem !important;
      }
    }
  `;

  const renderCopyDetails = (copy: BookCopy) => (
    <CopySegment key={copy._id}>
      <CopyGrid>
        <Grid.Row verticalAlign="middle">
          <Grid.Column mobile={14} tablet={15} computer={15}>
            <List>
              <List.Item>
                <List.Icon name="barcode" />
                <List.Content>
                  <List.Header>{t('invoiceCode')}</List.Header>
                  <List.Description>{copy.invoiceCode}</List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name="qrcode" />
                <List.Content>
                  <List.Header>{t('code')}</List.Header>
                  <List.Description>{copy.code}</List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name="map marker alternate" />
                <List.Content>
                  <List.Header>{t('location')}</List.Header>
                  <List.Description>{copy.location}</List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name="dollar" />
                <List.Content>
                  <List.Header>{t('cost')}</List.Header>
                  <List.Description>
                    L. {typeof copy.cost === 'number' ? copy.cost.toFixed(2) : copy.cost}
                  </List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name="calendar alternate" />
                <List.Content>
                  <List.Header>{t('dateAcquired')}</List.Header>
                  <List.Description>{new Date(copy.dateAcquired).toLocaleDateString()}</List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name="info circle" />
                <List.Content>
                  <List.Header>{t('status')}</List.Header>
                  <List.Description>
                    <Label color={copy.status === 'available' ? 'green' : 'red'}>
                      {t(copy.status)}
                    </Label>
                  </List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name="star" />
                <List.Content>
                  <List.Header>{t('condition')}</List.Header>
                  <List.Description>
                    <Label color={copy.condition === 'new' ? 'blue' : 'grey'}>
                      {t(copy.condition)}
                    </Label>
                  </List.Description>
                </List.Content>
              </List.Item>
              {copy.observations && (
                <List.Item>
                  <List.Icon name="comment" />
                  <List.Content>
                    <List.Header>{t('observations')}</List.Header>
                    <List.Description>{copy.observations}</List.Description>
                  </List.Content>
                </List.Item>
              )}
            </List>
          </Grid.Column>
          <Grid.Column mobile={2} tablet={1} computer={1} textAlign="right">
            <DeleteButton
              icon="trash"
              onClick={() => {
                setCopyToDelete(copy);
                setDeleteCopyConfirmOpen(true);
              }}
              aria-label={t('deleteCopy')}
            />
          </Grid.Column>
        </Grid.Row>
      </CopyGrid>
    </CopySegment>
  );

  const panes = [
    {
      menuItem: t('generalInfo'),
      render: () => (
        <Tab.Pane>
          <ScrollableTabContent>
            <List relaxed="very" size="large">
              <InfoItem>
                <List.Icon name="user" />
                <List.Content>
                  <List.Header>{t('author')}</List.Header>
                  <List.Description>{book.author}</List.Description>
                </List.Content>
              </InfoItem>
              <InfoItem>
                <List.Icon name="building" />
                <List.Content>
                  <List.Header>{t('editorial')}</List.Header>
                  <List.Description>{book.editorial}</List.Description>
                </List.Content>
              </InfoItem>
              <InfoItem>
                <List.Icon name="info circle" />
                <List.Content>
                  <List.Header>{t('edition')}</List.Header>
                  <List.Description>{book.edition}</List.Description>
                </List.Content>
              </InfoItem>
              <InfoItem>
                <List.Icon name="tags" />
                <List.Content>
                  <List.Header>{t('categories')}</List.Header>
                  <List.Description>
                    <Label.Group>
                      {book.categories.map((category, index) => (
                        <Label key={index} basic>{category}</Label>
                      ))}
                    </Label.Group>
                  </List.Description>
                </List.Content>
              </InfoItem>
              <InfoItem>
                <List.Icon name="book" />
                <List.Content>
                  <List.Header>{t('coverType')}</List.Header>
                  <List.Description>{t(book.coverType)}</List.Description>
                </List.Content>
              </InfoItem>
            </List>
          </ScrollableTabContent>
        </Tab.Pane>
      ),
    },
    {
      menuItem: t('copies'),
      render: () => (
        <Tab.Pane>
          <ScrollableTabContent>
            {book.copies.slice((currentCopyPage - 1) * copiesPerPage, currentCopyPage * copiesPerPage).map((copy) => (
              renderCopyDetails(copy)
            ))}
            <Pagination
              activePage={currentCopyPage}
              totalPages={Math.ceil(book.copies.length / copiesPerPage)}
              onPageChange={(_, { activePage }) => setCurrentCopyPage(activePage as number)}
            />
          </ScrollableTabContent>
        </Tab.Pane>
      ),
    },
  ];

  return (
    <PlayfulModal open={open} onClose={onClose} size="large">
      <PlayfulHeader>
        <Icon name="book" /> {book.title}
      </PlayfulHeader>
      <PlayfulContent>
        <ModalGrid stackable>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={6} computer={5}>
              <PlayfulSegment>
                <div style={{ 
                  position: 'relative', 
                  width: '100%',
                  height: '300px', // Fixed height instead of padding-bottom
                  marginBottom: '1rem'
                }}>
                  <BookImage src={book.imageUrl || null} alt={book.title} />
                </div>
                <Label.Group size="large">
                  <Label basic>
                    <Icon name="copy" />
                    {t('copiesCount', { count: Array.isArray(book.copies) ? book.copies.length : 0 })}
                  </Label>
                </Label.Group>
              </PlayfulSegment>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={10} computer={11}>
              <ResponsiveTab 
                panes={panes} 
                activeIndex={activeTab}
                onTabChange={(_: React.SyntheticEvent, data: TabProps) => setActiveTab(data.activeIndex as number)}
              />
            </Grid.Column>
          </Grid.Row>
        </ModalGrid>
      </PlayfulContent>
      <ModalActions>
        <PlayfulButton onClick={onClose}>
          <Icon name='close' /> {t('close')}
        </PlayfulButton>
        <Button onClick={() => setDeleteConfirmOpen(true)} basic color="red" floated="right">
          <Icon name="trash" />
          {t('deleteBook')}
        </Button>
        <Confirm
          open={deleteConfirmOpen}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteBook}
          content={t('confirmDeleteBook')}
        />
        <Confirm
          open={deleteCopyConfirmOpen}
          onCancel={() => setDeleteCopyConfirmOpen(false)}
          onConfirm={handleDeleteCopy}
          content={t('confirmDeleteCopy')}
        />
      </ModalActions>
    </PlayfulModal>
  );
};

export default BookDetailsModal;

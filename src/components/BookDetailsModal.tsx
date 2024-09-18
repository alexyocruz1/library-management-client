import React, { useState } from 'react';
import { Modal, Button, List, Grid, Icon, Label, Segment, Tab, Pagination, Header } from 'semantic-ui-react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import styled from 'styled-components';
import { colors } from '../styles/colors';
import { tokens } from '../styles/tokens';

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

interface BookCopy {
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

interface Book {
  _id: string;
  title: string;
  author: string;
  editorial: string;
  edition: string;
  categories: string[];
  coverType: string;
  imageUrl: string;
  copies: BookCopy[];
}

interface BookDetailsModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
}

const PlayfulModal = styled(Modal)`
  &.ui.modal {
    border-radius: 20px;
    overflow: hidden;
  }
`;

const PlayfulHeader = styled(Modal.Header)`
  background-color: ${colors.primary} !important;
  color: white !important;
  font-family: 'KidsFont', sans-serif !important;
`;

const PlayfulContent = styled(Modal.Content)`
  background-color: ${colors.background}F0 !important;
`;

const PlayfulSegment = styled(Segment)`
  border-radius: 15px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
`;

const PlayfulButton = styled(Button)`
  background-color: ${colors.secondary} !important;
  color: white !important;
  border-radius: 20px !important;
  font-family: 'KidsFont', sans-serif !important;
`;

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, open, onClose }) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(0);
  const [currentCopyPage, setCurrentCopyPage] = useState(1);
  const copiesPerPage = 10;

  if (!book) return null;

  const renderCopyDetails = (copy: BookCopy) => (
    <List relaxed="very" divided size="large">
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
    </List>
  );

  const panes = [
    {
      menuItem: t('generalInfo'),
      render: () => (
        <Tab.Pane>
          <List relaxed="very" divided size="large">
            <List.Item>
              <List.Icon name="user" />
              <List.Content>
                <List.Header>{t('author')}</List.Header>
                <List.Description>{book.author}</List.Description>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="building" />
              <List.Content>
                <List.Header>{t('editorial')}</List.Header>
                <List.Description>{book.editorial}</List.Description>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="info circle" />
              <List.Content>
                <List.Header>{t('edition')}</List.Header>
                <List.Description>{book.edition}</List.Description>
              </List.Content>
            </List.Item>
            <List.Item>
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
            </List.Item>
            <List.Item>
              <List.Icon name="book" />
              <List.Content>
                <List.Header>{t('coverType')}</List.Header>
                <List.Description>{t(book.coverType)}</List.Description>
              </List.Content>
            </List.Item>
          </List>
        </Tab.Pane>
      ),
    },
    {
      menuItem: t('copies'),
      render: () => (
        <Tab.Pane>
          {book.copies.slice((currentCopyPage - 1) * copiesPerPage, currentCopyPage * copiesPerPage).map((copy, index) => (
            <PlayfulSegment key={copy._id}>
              <Header as="h4">{t('copy')} {(currentCopyPage - 1) * copiesPerPage + index + 1}</Header>
              {renderCopyDetails(copy)}
            </PlayfulSegment>
          ))}
          <Pagination
            activePage={currentCopyPage}
            totalPages={Math.ceil(book.copies.length / copiesPerPage)}
            onPageChange={(_, { activePage }) => setCurrentCopyPage(activePage as number)}
          />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <PlayfulModal open={open} onClose={onClose} size="fullscreen">
      <PlayfulHeader>
        <Icon name="book" /> {book.title}
      </PlayfulHeader>
      <PlayfulContent scrolling style={{ height: 'calc(100vh - 120px)', padding: '2rem' }}>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column width={6}>
              <PlayfulSegment>
                <div style={{ height: '50vh', position: 'relative' }}>
                  <BookImage src={book.imageUrl || null} alt={book.title} />
                </div>
              </PlayfulSegment>
              <PlayfulSegment>
                <Label.Group size="large">
                  <Label basic>
                    <Icon name="copy" />
                    {t('copiesCount', { count: Array.isArray(book.copies) ? book.copies.length : 0 })}
                  </Label>
                </Label.Group>
              </PlayfulSegment>
            </Grid.Column>
            <Grid.Column width={10}>
              <Tab 
                panes={panes} 
                activeIndex={activeTab}
                onTabChange={(_, data) => setActiveTab(data.activeIndex as number)}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </PlayfulContent>
      <Modal.Actions>
        <PlayfulButton onClick={onClose}>
          <Icon name='close' /> {t('close')}
        </PlayfulButton>
      </Modal.Actions>
    </PlayfulModal>
  );
};

export default BookDetailsModal;

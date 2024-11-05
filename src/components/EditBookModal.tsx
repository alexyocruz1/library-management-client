import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Tab, Icon, Message, DropdownProps, ModalContent, TabProps } from 'semantic-ui-react';
import { Book, BookCopy } from '../types/book';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import axios from 'axios';
import NextImage from 'next/image';

const StyledTab = styled(Tab.Pane)`
  border: none !important;
  box-shadow: none !important;
  margin-top: 1em !important;
  height: 100%;
  overflow: hidden;
`;

const CopyButton = styled(Button)`
  text-align: left !important;
  margin: 0.5em 0 !important;
  width: 100% !important;
  white-space: normal !important;
  
  .content {
    display: flex;
    flex-direction: column;
    gap: 0.2em;
    width: 100%;
  }
  
  .details {
    font-size: 0.9em;
    color: rgba(0, 0, 0, 0.6);
    word-break: break-word;
    overflow-wrap: break-word;
  }
`;

const TabContainer = styled(Tab)`
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .ui.tab {
    height: 100%;
    flex: 1;
  }
`;

const StyledModalContent = styled(Modal.Content)<{ disableScroll?: boolean }>`
  max-height: 70vh !important;
  overflow-y: ${props => props.disableScroll ? 'hidden' : 'auto'} !important;
  padding: ${props => props.disableScroll ? '0' : '1rem'} !important;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 767px) {
    overflow-y: auto !important;
    max-height: 80vh !important;
  }
`;

const CopySection = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  height: 100%;
  padding: 1rem;
  overflow: hidden;
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
    padding-bottom: 60px;
  }
`;

const CopyList = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(70vh - 200px);
  padding-right: 1rem;
  padding-left: 0.5rem;
  padding-bottom: 1rem;
  border-right: 1px solid rgba(34, 36, 38, 0.15);
  width: 100%;
  
  @media (max-width: 767px) {
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid rgba(34, 36, 38, 0.15);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    padding-right: 0.5rem;
  }
`;

const EditForm = styled(Form)`
  position: sticky;
  top: 0;
`;

const ModalActions = styled(Modal.Actions)`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem !important;
`;

interface EditBookModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onBookUpdate: (updatedBook: Book) => void;
}

// Add interfaces for form handling
interface GeneralInfoForm {
  title?: string;
  author?: string;
  editorial?: string;
  edition?: string;
  coverType?: string;
  categories?: string[];
  imageUrl?: string;
}

interface CopyInfoForm {
  invoiceCode?: string;
  location?: string;
  cost?: string | number;
  dateAcquired?: string;
  condition?: string;
  observations?: string;
  status?: string;
}

// Add BookImage component at the top of the file
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
      <NextImage
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

const EditBookModal: React.FC<EditBookModalProps> = ({ book, open, onClose, onBookUpdate }) => {
  const { t } = useTranslation('common');
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoForm>({});
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [copyInfo, setCopyInfo] = useState<CopyInfoForm>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isValidImageUrl, setIsValidImageUrl] = useState<boolean | null>(null);
  const [costInput, setCostInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (book) {
      setGeneralInfo({
        title: book.title,
        author: book.author,
        editorial: book.editorial,
        edition: book.edition,
        coverType: book.coverType,
        categories: book.categories,
        imageUrl: book.imageUrl
      });
      setSelectedCategories(book.categories);
      setPreviewImage(book.imageUrl || null);
    }
  }, [book]);

  // Fix type errors in event handlers
  const handleGeneralInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGeneralInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (
    e: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ) => {
    if (typeof data.name === 'string' && data.value !== undefined) {
      setGeneralInfo(prev => ({ ...prev, [data.name]: data.value }));
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setGeneralInfo(prev => ({ ...prev, imageUrl: value }));
    
    // Create image element for validation
    const img = document.createElement('img');
    img.onload = () => {
      setIsValidImageUrl(true);
      setPreviewImage(value);
    };
    img.onerror = () => {
      setIsValidImageUrl(false);
      setPreviewImage(null);
    };
    img.src = value;
  };

  const handleCopyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCopyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCostInput(value);
    setCopyInfo(prev => ({ ...prev, cost: value }));
  };

  const handleCostBlur = () => {
    const formattedValue = parseFloat(costInput).toFixed(2);
    if (!isNaN(parseFloat(formattedValue))) {
      setCostInput(formattedValue);
      setCopyInfo(prev => ({ ...prev, cost: formattedValue }));
    }
  };

  const handleCopySelect = (copy: BookCopy) => {
    setSelectedCopy(copy);
    const formattedDate = new Date(copy.dateAcquired).toISOString().split('T')[0];
    
    setCopyInfo({
      invoiceCode: copy.invoiceCode,
      location: copy.location,
      cost: copy.cost,
      dateAcquired: formattedDate,
      condition: copy.condition,
      observations: copy.observations,
      status: copy.status
    });
    setCostInput(copy.cost.toFixed(2));
  };

  const handleCategoryChange = (newValue: any) => {
    const newCategories = newValue ? newValue.map((option: { value: string }) => option.value) : [];
    setSelectedCategories(newCategories);
    setGeneralInfo(prev => ({ ...prev, categories: newCategories }));
  };

  // General update affects all books with same groupId
  const handleGeneralUpdate = async () => {
    if (!book) return;
    setLoading(true);
    try {
      const response = await axios.put<Book>(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/${book.groupId}/general`,
        generalInfo
      );
      onBookUpdate(response.data);
      toast.success(t('bookUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error(t('bookUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  // Copy update affects only one specific copy
  const handleCopyUpdate = async () => {
    if (!book || !selectedCopy) return;
    setLoading(true);
    try {
      const response = await axios.put<Book>(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/books/${selectedCopy._id}/copy`,
        copyInfo
      );
      onBookUpdate(response.data);
      toast.success(t('copyUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating copy:', error);
      toast.error(t('copyUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const panes = [
    {
      menuItem: { key: 'general', icon: 'book', content: t('generalInfo') },
      render: () => (
        <StyledTab>
          <Form>
            <Form.Input
              fluid
              label={t('title')}
              name="title"
              value={generalInfo.title || ''}
              onChange={handleGeneralInfoChange}
              placeholder={t('enterTitle')}
            />
            <Form.Input
              fluid
              label={t('author')}
              name="author"
              value={generalInfo.author || ''}
              onChange={handleGeneralInfoChange}
              placeholder={t('enterAuthor')}
            />
            <Form.Input
              fluid
              label={t('editorial')}
              name="editorial"
              value={generalInfo.editorial || ''}
              onChange={handleGeneralInfoChange}
              placeholder={t('enterEditorial')}
            />
            <Form.Input
              fluid
              label={t('edition')}
              name="edition"
              value={generalInfo.edition || ''}
              onChange={handleGeneralInfoChange}
              placeholder={t('enterEdition')}
            />
            <Form.Select
              fluid
              label={t('coverType')}
              name="coverType"
              options={[
                { key: 'hard', text: t('hardCover'), value: 'hard' },
                { key: 'soft', text: t('softCover'), value: 'soft' },
              ]}
              value={generalInfo.coverType}
              onChange={handleDropdownChange}
              placeholder={t('selectCoverType')}
            />
            <Form.Field>
              <label>{t('categories')}</label>
              <CreatableSelect
                isMulti
                value={selectedCategories.map(cat => ({ value: cat, label: cat }))}
                onChange={handleCategoryChange}
                options={categories.map(cat => ({ value: cat, label: cat }))}
                placeholder={t('selectOrTypeCategories')}
              />
            </Form.Field>
            <Form.Input
              label={t('imageUrl')}
              name="imageUrl"
              value={generalInfo.imageUrl || ''}
              onChange={handleImageUrlChange}
              placeholder={t('optionalImageUrl')}
              error={isValidImageUrl === false}
            />
            {isValidImageUrl === false && (
              <Message negative>
                {t('invalidImageUrl')}
              </Message>
            )}
            {previewImage && (
              <div style={{ 
                position: 'relative', 
                width: '100%',
                height: '300px',
                marginTop: '10px',
                marginBottom: '1rem'
              }}>
                <BookImage 
                  src={previewImage} 
                  alt={generalInfo.title || t('bookPreview')} 
                />
              </div>
            )}
            <Button primary onClick={handleGeneralUpdate} loading={loading}>
              {t('updateGeneral')}
            </Button>
          </Form>
        </StyledTab>
      )
    },
    {
      menuItem: { key: 'copies', icon: 'copy', content: t('copies') },
      render: () => (
        <StyledTab>
          <CopySection>
            <div>
              <h4>{t('selectCopy')}</h4>
              <CopyList>
                {book?.copies.map((copy) => (
                  <CopyButton
                    key={copy._id}
                    fluid
                    basic={selectedCopy?._id !== copy._id}
                    primary={selectedCopy?._id === copy._id}
                    onClick={() => handleCopySelect(copy)}
                  >
                    <div className="content">
                      <div>
                        <Icon name="barcode" /> {copy.code}
                      </div>
                      <div className="details">
                        <Icon name="map marker alternate" /> {copy.location}
                        {' • '}
                        <Icon name="dollar" /> {copy.cost.toFixed(2)}
                        {' • '}
                        <Icon name="calendar alternate" /> {new Date(copy.dateAcquired).toLocaleDateString()}
                      </div>
                      <div className="details">
                        <Icon name="info circle" /> {t(copy.condition)}
                        {copy.observations && ` • ${copy.observations.substring(0, 50)}${copy.observations.length > 50 ? '...' : ''}`}
                      </div>
                    </div>
                  </CopyButton>
                ))}
              </CopyList>
            </div>

            <div>
              {selectedCopy ? (
                <EditForm>
                  <Form.Input
                    fluid
                    label={t('invoiceCode')}
                    name="invoiceCode"
                    value={copyInfo.invoiceCode || ''}
                    onChange={handleCopyChange}
                    placeholder={t('enterInvoiceCode')}
                  />
                  <Form.Input
                    fluid
                    label={t('location')}
                    name="location"
                    value={copyInfo.location || ''}
                    onChange={handleCopyChange}
                    placeholder={t('enterLocation')}
                  />
                  <Form.Input
                    fluid
                    label={t('cost')}
                    name="cost"
                    value={costInput}
                    onChange={handleCostChange}
                    onBlur={handleCostBlur}
                    placeholder={t('enterCost')}
                  />
                  <Form.Input
                    label={t('dateAcquired')}
                    type="date"
                    name="dateAcquired"
                    value={copyInfo.dateAcquired || ''}
                    onChange={handleCopyChange}
                    max={new Date().toISOString().split('T')[0]}
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
                    value={copyInfo.condition}
                    onChange={handleDropdownChange}
                    placeholder={t('selectCondition')}
                  />
                  <Button primary onClick={handleCopyUpdate} loading={loading}>
                    {t('updateCopy')}
                  </Button>
                </EditForm>
              ) : (
                <Message info>
                  <Message.Header>{t('noCopySelected')}</Message.Header>
                  <p>{t('selectCopyToEdit')}</p>
                </Message>
              )}
            </div>
          </CopySection>
        </StyledTab>
      )
    }
  ];

  return (
    <Modal open={open} onClose={onClose} size="small">
      <Modal.Header>
        <Icon name="edit" /> {t('editBook')}
      </Modal.Header>
      <StyledModalContent disableScroll={activeTab === 1}>
        <TabContainer 
          panes={panes} 
          activeIndex={activeTab}
          onTabChange={(_: React.SyntheticEvent, data: TabProps) => 
            setActiveTab(data.activeIndex as number)}
        />
      </StyledModalContent>
      <ModalActions>
        <Button onClick={onClose}>
          <Icon name="close" /> {t('close')}
        </Button>
      </ModalActions>
    </Modal>
  );
};

export default EditBookModal;

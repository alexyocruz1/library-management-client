export interface BookCopy {
  _id: string;
  code: string;
  condition: string;
  status: string;
  location: string;
  cost: number;
  dateAcquired: string;
  observations: string;
  invoiceCode: string;
}

export interface Book {
  _id: string;
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
  company: string;
  code: string;
  cost: number;
  dateAcquired: string;
  observations: string;
  description?: string;
  invoiceCode: string;
  groupId: string;
  copies: BookCopy[];
  copiesCount?: number;
  selectedCopy?: BookCopy;
}
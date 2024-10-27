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
    groupId: string;
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
    copies: BookCopy[];
    copiesCount: number;
    status: string;
    condition: string;
    location: string;
    company: string | null; // Change this line
    code: string;
    cost: number;
    dateAcquired: string;
    observations: string;
    description: string; // Add this line
    invoiceCode: string;
    groupId: string;
  }
export interface Article {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  category: string;
}

export interface ArticleDTO {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  category: string;
}
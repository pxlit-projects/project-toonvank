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

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'editor' | 'chief_editor';
}
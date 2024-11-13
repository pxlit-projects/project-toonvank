export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
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
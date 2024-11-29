export interface Comment {
  id: number;
  postId: string;
  content: string;
  createdAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
}
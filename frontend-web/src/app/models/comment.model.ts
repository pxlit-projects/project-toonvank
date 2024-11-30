export interface Comment {
  postId: number;
  content: string;
  createdAt: Date;
  editedAt?: Date;
  postedBy: string;
}
export interface CommentDTO {
  id: number;
  postId: string;
  content: string;
  createdAt: Date;
  editedAt?: Date;
  postedBy: string;
}
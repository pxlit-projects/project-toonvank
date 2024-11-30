import { inject, Injectable } from '@angular/core';
import { Observable, map, catchError, throwError} from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {CommentDTO,Comment} from "../models/comment.model";

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private endpoint: string = 'http://localhost:8086/comment/api/comments';
  http: HttpClient = inject(HttpClient);

  public createComment(comment: Comment): Observable<boolean> {
    const newComment: Comment = {
      postId: comment.postId!,
      content: comment.content!,
      createdAt: new Date(),
      editedAt: new Date(),
      postedBy: localStorage.getItem("userName")!,
    };

    return this.http.post<Comment>(this.endpoint, newComment).pipe(
        map(() => true),
        catchError(this.handleError<boolean>('createArticle'))
    );
  }

  public getCommentById(id: number): Observable<CommentDTO> {
    return this.http.get<CommentDTO>(`${this.endpoint}/${id}`).pipe(
        map(data => {
          if (!data) {
            throw new Error(`No comment found with id ${id}`);
          }
          return data;
        }),
        catchError(this.handleError<CommentDTO>('getCommentById'))
    );
  }

  public getCommentByPostId(id: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.endpoint}/post/${id}`).pipe(
        map(data => {
            if (!data || data.length === 0) {
                throw new Error(`No comments found for post with id ${id}`);
            }
            return data;
        }),
        catchError(this.handleError<Comment[]>('getCommentByPostId', []))
    );
  }


    private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}

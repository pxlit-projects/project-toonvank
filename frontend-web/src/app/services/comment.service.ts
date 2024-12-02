import { inject, Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommentDTO, Comment } from '../models/comment.model';

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
            postedBy: localStorage.getItem('userName')!,
        };

        return this.http.post<Comment>(this.endpoint, newComment).pipe(
            map(() => true),
            catchError(this.handleError<boolean>('createArticle'))
        );
    }

    public getCommentByPostId(id: number): Observable<CommentDTO[]> {
        return this.http.get<CommentDTO[]>(`${this.endpoint}/post/${id}`).pipe(
            map(data => {
                if (!data || data.length === 0) {
                    throw new Error(`No comments found for comment with id ${id}`);
                }
                return data;
            }),
            catchError(this.handleError<CommentDTO[]>('getCommentByPostId', []))
        );
    }

    public updateComment(id: number, newContent:string): Observable<CommentDTO[]> {
        return this.http.put<CommentDTO[]>(`${this.endpoint}/${id}`,newContent).pipe(
            map(data => {
                if (!data || data.length === 0) {
                    throw new Error(`Cannot update comment with id ${id}`);
                }
                return data;
            }),
            catchError(this.handleError<CommentDTO[]>('getCommentByPostId', []))
        );
    }

    public deleteComment(id: number): Observable<CommentDTO[]> {
        return this.http.delete<CommentDTO[]>(`${this.endpoint}/${id}`).pipe(
            map(data => {
                if (!data || data.length === 0) {
                    throw new Error(`Cannot delete comment with id ${id}`);
                }
                return data;
            }),
            catchError(this.handleError<CommentDTO[]>('getCommentByPostId', []))
        );
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed:`, error);
            return throwError(() => new Error('An error occurred. Please try again later.'));
        };
    }
}
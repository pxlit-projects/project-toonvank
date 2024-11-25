import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, throwError, tap } from 'rxjs';
import { Article, ArticleDTO, Comment } from '../models/article.model';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private endpoint: string = 'http://localhost:8086/post/api/posts';
  http: HttpClient = inject(HttpClient);

  private articles = new BehaviorSubject<ArticleDTO[]>([]);

  constructor() {
    this.loadArticles();
  }

  private loadArticles(): void {
    this.http.get<ArticleDTO[]>(this.endpoint).pipe(
        tap(data => this.articles.next(data)),
        catchError(this.handleError<ArticleDTO[]>('loadArticles', []))
    ).subscribe();
  }

  getArticles(): Observable<ArticleDTO[]> {
    return this.articles.asObservable();
  }

  getPendingArticles(): Observable<ArticleDTO[]> {
    return this.articles.pipe(
        map(articles => articles.filter(article => article.status === 'PENDING'))
    );
  }

  getPublishedArticles(): Observable<ArticleDTO[]> {
    return this.articles.pipe(
        map(articles => articles.filter(article => article.status === 'PUBLISHED'))
    );
  }

  getDraftArticles(): Observable<ArticleDTO[]> {
    return this.articles.pipe(
        map(articles => articles.filter(article => article.status === 'DRAFT' || article.status === 'REJECTED'))
    );
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    const newArticle: Article = {
      title: article.title || '',
      content: article.content || '',
      author: article.author || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: article.status || 'DRAFT',
      category: article.category || '',
    };

    return this.http.post<Article>(this.endpoint, newArticle).pipe(
        tap(savedArticle => this.loadArticles()),
        catchError(this.handleError<Article>('createArticle'))
    );
  }

  updateArticle(id: number, updatedArticle: Partial<ArticleDTO>): void {
    this.http.put<Article>(`${this.endpoint}/${id}`, updatedArticle).pipe(
        tap(() => this.loadArticles()),
        catchError(this.handleError<Article>('updateArticle'))
    ).subscribe();
  }

  deleteArticle(id: number): void {
    this.http.delete<Article>(`${this.endpoint}/${id}`).pipe(
        tap(() => this.loadArticles()),
        catchError(this.handleError<Article>('deleteArticle'))
    ).subscribe();
  }

  submitForReview(id: number): void {
    this.updateArticleStatus(id, 'PENDING');
  }

  approveArticle(id: number): void {
    this.updateArticleStatus(id, 'PUBLISHED');
  }

  rejectArticle(id: number): void {
    this.updateArticleStatus(id, 'REJECTED');
  }

  private updateArticleStatus(id: number, status: string): void {
    this.http.put<Article>(`${this.endpoint}/${id}/updateStatus`, status).pipe(
        tap(() => this.loadArticles()),
        catchError(this.handleError<Article>('updateArticleStatus'))
    ).subscribe();
  }

  addComment(articleId: number, commentData: { content: string; authorId: string }): void {
    // Implement this logic server-side if necessary
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}

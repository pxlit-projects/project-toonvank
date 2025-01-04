import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, map, catchError, throwError, tap } from 'rxjs';
import { Article, ArticleDTO } from '../models/article.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private endpoint: string = 'http://localhost:8086/post/api/posts';
  http: HttpClient = inject(HttpClient);

  private articles = signal<ArticleDTO[]>([]);

  constructor() {
    this.loadArticles();
  }

  public loadArticles(): void {
    this.http.get<ArticleDTO[]>(this.endpoint).pipe(
        tap(data => this.articles.set(data)),
        catchError(this.handleError<ArticleDTO[]>('loadArticles', []))
    ).subscribe();
  }

  public getArticleById(id: number): Observable<ArticleDTO> {
    return this.http.get<ArticleDTO>(`${this.endpoint}/${id}`).pipe(
        map(data => {
          if (!data) {
            throw new Error(`No article found with id ${id}`);
          }
          return data;
        }),
        catchError(this.handleError<ArticleDTO>('getArticleById'))
    );
  }

  getArticles(): ArticleDTO[] {
    return this.articles();
  }

  getPendingArticles(): ArticleDTO[] {
    return computed(() => this.articles().filter(article => article.status === 'PENDING'))();
  }

  getDraftArticles(): ArticleDTO[] {
    return this.articles().filter(article => article.status === 'DRAFT');
  }

  getRejectedArticles(): ArticleDTO[] {
    return computed(() => this.articles().filter(article => article.status === 'REJECTED'))();
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
        tap(() => this.loadArticles()),
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}
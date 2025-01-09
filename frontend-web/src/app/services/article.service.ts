import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, map, catchError, throwError, tap, switchMap } from 'rxjs';
import { Article, ArticleDTO } from '../models/article.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private endpoint: string = 'http://localhost:8086/post/api/posts';
  http: HttpClient = inject(HttpClient);

  private isInitialized = false;

  private articles = signal<ArticleDTO[]>([]);

  constructor() {
    this.loadArticles().subscribe(() => {
      this.isInitialized = true;
    });
  }


  loadArticles(): Observable<ArticleDTO[]> {
    return this.http.get<ArticleDTO[]>(this.endpoint).pipe(
        tap(articles => {
          this.articles.set(articles);
        }),
        catchError(this.handleError<ArticleDTO[]>('loadArticles', []))
    );
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
    if (!this.isInitialized) {
      this.loadArticles().subscribe();
    }
    return this.articles();
  }

  getPendingArticles(): ArticleDTO[] {
    if (!this.isInitialized) {
      this.loadArticles().subscribe();
    }
    return this.articles().filter(article => article.status === 'PENDING');
  }

  getDraftArticles(): ArticleDTO[] {
    // Trigger refresh when getting drafts
    this.loadArticles().subscribe();
    return this.articles().filter(article => article.status === 'DRAFT');
  }

  getRejectedArticles(): ArticleDTO[] {
    // Trigger refresh when getting rejected articles
    this.loadArticles().subscribe();
    return this.articles().filter(article => article.status === 'REJECTED');
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
        switchMap(createdArticle =>
            this.loadArticles().pipe(
                map(() => createdArticle)
            )
        ),
        catchError(this.handleError<Article>('createArticle'))
    );
  }

  updateArticle(id: number, article: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${this.endpoint}/${id}`, article).pipe(
        // Wait for update to complete, then load fresh data
        switchMap(updatedArticle =>
            this.loadArticles().pipe(
                // Return the updated article
                map(() => updatedArticle)
            )
        ),
        catchError(this.handleError<Article>('updateArticle'))
    );
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
        switchMap(() => this.loadArticles()),
        tap(() => {
          // Update the signal directly after successful deletion
          const currentArticles = this.articles();
          this.articles.set(currentArticles.filter(article => article.id !== id));
        }),
        map(() => undefined),
        catchError(this.handleError<void>('deleteArticle'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}
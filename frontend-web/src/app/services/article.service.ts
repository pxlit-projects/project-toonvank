import { inject, Injectable } from '@angular/core';
import {BehaviorSubject, Observable, map, catchError, throwError, tap, of} from 'rxjs';
import { Article, ArticleDTO } from '../models/article.model';
import { HttpClient } from "@angular/common/http";
import {data} from "autoprefixer";

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

  public loadArticles(): void {
    this.http.get<ArticleDTO[]>(this.endpoint).pipe(
        tap(data => this.articles.next(data)),
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

  getArticles(): Observable<ArticleDTO[]> {
    return this.articles.asObservable();
  }

  getPendingArticles(): Observable<ArticleDTO[]> {
    return this.articles.pipe(
        map(articles => articles.filter(article => article.status === 'PENDING'))
    );
  }

  getDraftArticles(): Observable<ArticleDTO[]> {
    return this.articles.pipe(
        map(articles => articles.filter(article => article.status === 'DRAFT'))
    );
  }

  getRejectedArticles(): Observable<ArticleDTO[]> {
    return this.articles.pipe(
        map(articles => articles.filter(article => article.status === 'REJECTED'!))
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}

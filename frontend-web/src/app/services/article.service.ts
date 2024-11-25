import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, map, catchError, throwError, tap} from 'rxjs';
import {Article, ArticleDTO, Comment} from '../models/article.model';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly STORAGE_KEY = 'articles';
  private endpoint: string = 'http://localhost:8086/post/api/posts';
  private postEndpoint: string = 'http://localhost:8086/post/api/posts';
  http: HttpClient = inject(HttpClient);

  private articles = new BehaviorSubject<ArticleDTO[]>(this.loadArticles());

  private loadArticles(): ArticleDTO[] {
    this.http.get<Object[]>(this.endpoint).subscribe(data => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    });

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const articles = JSON.parse(stored);
      return articles.map((article: any) => ({
        ...article,
        id: String(article.id),
        createdAt: article.createdAt ? new Date(article.createdAt) : null,
        updatedAt: article.updatedAt ? new Date(article.updatedAt) : null,
        status: article.status,
        comments: Array.isArray(article.comments) ? article.comments : []
      }));
    }
    return [];
  }

  private saveArticles(articles: Article[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
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
    console.log(this.articles)
    return this.articles.pipe(
      map(articles => articles.filter(article => article.status === 'DRAFT'))
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

    console.log('New article:', newArticle); // Log the new article for debugging

    return this.http.post<Article>(this.postEndpoint, newArticle).pipe(
        tap(savedArticle => {
          console.log('Saved article:', savedArticle);
        }),
        catchError(error => {
          console.error('Error creating article:', error);
          throw error;
        })
    );
  }

  updateArticle(id: number, updatedArticle: Partial<ArticleDTO>): void {
    this.http.put<Article>(`${this.postEndpoint}/${updatedArticle.id}`, updatedArticle).pipe(
        tap(savedArticle => {
          console.log('Saved article:', savedArticle);
        }),
        catchError(error => {
          console.error('Error creating article:', error);
          throw error;
        })
    ).subscribe();
  }

  deleteArticle(id: number): void {
    this.http.delete<Article>(`${this.postEndpoint}/${id}`).pipe(
        tap(savedArticle => {
          console.log('Deleted article:');
        }),
        catchError(error => {
          console.error('Error deleting article:', error);
          throw error;
        })
    ).subscribe();
  }

  submitForReview(id: number): void {
    this.http.put<Article>(`${this.postEndpoint}/${id}/updateStatus`,"PENDING").pipe(
        tap(savedArticle => {
          console.log('Updated status:',savedArticle.status);
        }),
        catchError(error => {
          console.error('Error updating status:', error);
          throw error;
        })
    ).subscribe();
  }

  approveArticle(id: number): void {
    this.http.put<Article>(`${this.postEndpoint}/${id}/updateStatus`,"PUBLISHED").pipe(
        tap(savedArticle => {
          console.log('Deleted article:');
        }),
        catchError(error => {
          console.error('Error deleting article:', error);
          throw error;
        })
    ).subscribe();
  }

  rejectArticle(id: number): void {
    this.http.put<Article>(`${this.postEndpoint}/${id}/updateStatus`,"REJECTED").pipe(
        tap(savedArticle => {
          console.log('Deleted article:');
        }),
        catchError(error => {
          console.error('Error deleting article:', error);
          throw error;
        })
    ).subscribe();
  }

  addComment(articleId: number, commentData: { content: string; authorId: string }): void {
    const article = this.articles.value.find(a => a.id === articleId);
    if (article) {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentData.content,
        authorId: commentData.authorId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error('Error in', operation, ':', error);


      // Handle specific errors if needed (e.g., authentication, validation)

      // Return a user-friendly error message or a default value
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}
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
        status: article.status.toLowerCase(),
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
      map(articles => articles.filter(article => article.status === 'pending'))
    );
  }

  getPublishedArticles(): Observable<ArticleDTO[]> {
    return this.articles.pipe(
      map(articles => articles.filter(article => article.status === 'published'))
    );
  }

  getDraftArticles(): Observable<ArticleDTO[]> {
    console.log(this.articles)
    return this.articles.pipe(
      map(articles => articles.filter(article => article.status === 'draft'))
    );
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    const newArticle: Article = {
      title: article.title || '',
      content: article.content || '',
      author: article.author || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: article.status || 'draft',
      category: article.category || '',
    };

    console.log('New article:', newArticle); // Log the new article for debugging

    return this.http.post<Article>(this.postEndpoint, newArticle).pipe(
        tap(savedArticle => {
          console.log('Saved article:', savedArticle); // Log the saved article for debugging
          // Optional: Update local state here if needed
        }),
        catchError(error => {
          console.error('Error creating article:', error);
          throw error; // Re-throw the error for handling in the component
        })
    );
  }


  updateArticle(id: number, updates: Partial<ArticleDTO>): void {
    const currentArticles = this.articles.value;
    const updatedArticles = currentArticles.map(article =>
      article.id === id ? { ...article, ...updates, updatedAt: new Date() } : article
    );
    this.articles.next(updatedArticles);
    /*this.saveArticles(updatedArticles);*/
  }

  deleteArticle(id: number): void {
    const currentArticles = this.articles.value;
    const updatedArticles = currentArticles.filter(article => article.id !== id);
    this.articles.next(updatedArticles);
    /*this.saveArticles(updatedArticles);*/
  }

  submitForReview(id: number): void {
    this.updateArticle(id, { status: 'pending' });
  }

  approveArticle(id: number): void {
    this.updateArticle(id, { status: 'published' });
  }

  rejectArticle(id: number): void {
    this.updateArticle(id, { status: 'rejected' });
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
      /*this.updateArticle(articleId, {
        comments: [...article.comments, newComment]
      });*/
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
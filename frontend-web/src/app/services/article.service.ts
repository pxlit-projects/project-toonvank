import {inject, Injectable} from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Article, Comment } from '../models/article.model';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly STORAGE_KEY = 'articles';
  private endpoint: string = 'http://localhost:8084/api/posts/published';
  http: HttpClient = inject(HttpClient);

  private articles = new BehaviorSubject<Article[]>(this.loadArticles());

  private loadArticles(): Article[] {
    const test = this.http.get<Object[]>(this.endpoint).subscribe(data =>{
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    })
    const stored = localStorage.getItem(this.STORAGE_KEY);
    console.log(stored)
    if (stored) {
      const articles = JSON.parse(stored);
      return articles.map((article: any) => ({
        ...article,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt),
        comments: article.comments.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt)
        }))
      }));
    }
    return [];
  }

  private saveArticles(articles: Article[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
  }

  getArticles(): Observable<Article[]> {
    return this.articles.asObservable();
  }

  getPendingArticles(): Observable<Article[]> {
    return this.articles.pipe(
      map(articles => articles.filter(article => article.status === 'pending'))
    );
  }

  getPublishedArticles(): Observable<Article[]> {
    return this.articles.pipe(
      map(articles => articles.filter(article => article.status === 'published'))
    );
  }

  getDraftArticles(): Observable<Article[]> {
    return this.articles.pipe(
      map(articles => articles.filter(article => article.status === 'draft'))
    );
  }

  createArticle(article: Partial<Article>): void {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: article.title || '',
      content: article.content || '',
      authorId: article.authorId || '',
      category: article.category || '',
      status: article.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: []
    };
    
    const currentArticles = this.articles.value;
    const updatedArticles = [...currentArticles, newArticle];
    this.articles.next(updatedArticles);
    this.saveArticles(updatedArticles);
  }

  updateArticle(id: string, updates: Partial<Article>): void {
    const currentArticles = this.articles.value;
    const updatedArticles = currentArticles.map(article => 
      article.id === id ? { ...article, ...updates, updatedAt: new Date() } : article
    );
    this.articles.next(updatedArticles);
    this.saveArticles(updatedArticles);
  }

  deleteArticle(id: string): void {
    const currentArticles = this.articles.value;
    const updatedArticles = currentArticles.filter(article => article.id !== id);
    this.articles.next(updatedArticles);
    this.saveArticles(updatedArticles);
  }

  submitForReview(id: string): void {
    this.updateArticle(id, { status: 'pending' });
  }

  approveArticle(id: string): void {
    this.updateArticle(id, { status: 'published' });
  }

  rejectArticle(id: string): void {
    this.updateArticle(id, { status: 'rejected' });
  }

  addComment(articleId: string, commentData: { content: string; authorId: string }): void {
    const article = this.articles.value.find(a => a.id === articleId);
    if (article) {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentData.content,
        authorId: commentData.authorId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.updateArticle(articleId, {
        comments: [...article.comments, newComment]
      });
    }
  }
}
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, map, catchError, throwError, tap } from 'rxjs';
import { Review, ReviewDTO, ReviewStatus } from '../models/review.model';
import { HttpClient } from '@angular/common/http';
import { ArticleService } from './article.service';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private endpoint: string = 'http://localhost:8086/review/api/reviews';
  http: HttpClient = inject(HttpClient);
  private articleService: ArticleService = inject(ArticleService);

  private reviews = signal<ReviewDTO[]>([]);

  constructor() {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.http.get<ReviewDTO[]>(this.endpoint).pipe(
        tap((data) => this.reviews.set(data)),
        catchError(this.handleError<ReviewDTO[]>('loadReviews', []))
    ).subscribe();
  }

  public getReviewById(id: number): Observable<ReviewDTO> {
    return this.http.get<ReviewDTO>(`${this.endpoint}/${id}`).pipe(
        map((data) => {
          if (!data) {
            throw new Error(`No review found with id ${id}`);
          }
          return data;
        }),
        catchError(this.handleError<ReviewDTO>('getReviewById'))
    );
  }

  getReviews(): ReviewDTO[] {
    return this.reviews();
  }

  getPendingReviews(): ReviewDTO[] {
    return computed(() => this.reviews().filter((review) => review.status === ReviewStatus.PENDING))();
  }

  getApprovedReviews(): ReviewDTO[] {
    return computed(() => this.reviews().filter((review) => review.status === ReviewStatus.APPROVED))();
  }

  getRejectedReviews(): ReviewDTO[] {
    return computed(() => this.reviews().filter((review) => review.status === ReviewStatus.REJECTED))();
  }

  createReview(review: Partial<Review>): Observable<Review> {
    const newReview: Review = {
      postId: review.postId || 0,
      status: review.status || ReviewStatus.PENDING,
      comment: review.comment || '',
      reviewedAt: new Date().toISOString(),
    };

    return this.http.post<Review>(this.endpoint, newReview).pipe(
        tap(() => this.loadReviews()),
        catchError(this.handleError<Review>('createReview'))
    );
  }

  updateReview(id: number, updatedReview: Partial<ReviewDTO>): void {
    this.http.put<Review>(`${this.endpoint}/${id}`, updatedReview).pipe(
        tap(() => this.loadReviews()),
        catchError(this.handleError<Review>('updateReview'))
    ).subscribe();
  }

  deleteReview(id: number): void {
    this.http.delete<Review>(`${this.endpoint}/${id}`).pipe(
        tap(() => this.loadReviews()),
        catchError(this.handleError<Review>('deleteReview'))
    ).subscribe();
  }

  private updateReviewStatus(id: number, status: ReviewStatus): void {
    this.http.put<Review>(`${this.endpoint}/${id}/updateStatus`, { status }).pipe(
        tap(() => this.loadReviews()),
        catchError(this.handleError<Review>('updateReviewStatus'))
    ).subscribe();
  }

  private updateArticleStatus(id: number, status: string): void {
    this.http.put<Article>(`${this.endpoint}/${id}/updateStatus`, status).pipe(
        tap(() => {
          this.articleService.loadArticles();
          // TODO UPDATE ARTICLE STATUS FROM INSIDE THE MICROSERVICE
        }),
        catchError(this.handleError<Article>('updateArticleStatus'))
    ).subscribe();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}
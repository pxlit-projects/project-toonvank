import { inject, Injectable, signal, computed } from '@angular/core';
import {Observable, map, catchError, throwError, tap, switchMap} from 'rxjs';
import { Review, ReviewDTO, ReviewStatus } from '../models/review.model';
import { HttpClient } from '@angular/common/http';
import { ArticleService } from './article.service';
import { Article } from '../models/article.model';
import {toObservable} from "@angular/core/rxjs-interop";
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private endpoint: string = 'http://localhost:8086/review/api/reviews';
  http: HttpClient = inject(HttpClient);
  private articleService: ArticleService = inject(ArticleService);

  private reviews = signal<ReviewDTO[]>([]);

  constructor() {
    this.loadReviews().subscribe();
  }

  public loadReviews(): Observable<ReviewDTO[]> {
    return this.http.get<ReviewDTO[]>(this.endpoint).pipe(
        tap((data) => {
          this.reviews.set(data);
        }),
        catchError(this.handleError<ReviewDTO[]>('loadReviews', []))
    );
  }

  getReviews(): ReviewDTO[] {
    this.loadReviews().subscribe();
    return this.reviews();
  }

  getPendingReviews(): ReviewDTO[] {
    this.loadReviews().subscribe();
    return this.reviews().filter((review) => review.status === ReviewStatus.PENDING);
  }

  getApprovedReviews(): ReviewDTO[] {
    this.loadReviews().subscribe();
    return this.reviews().filter((review) => review.status === ReviewStatus.PUBLISHED);
  }

  getRejectedReviews(): ReviewDTO[] {
    this.loadReviews().subscribe();
    return this.reviews().filter((review) => review.status === ReviewStatus.REJECTED);
  }

  createReview(review: Partial<Review>): Observable<Review> {
    const newReview: Review = {
      postId: review.postId || 0,
      status: review.status || ReviewStatus.PENDING,
      comment: review.comment || '',
      reviewedAt: new Date().toISOString(),
    };

    return this.http.post<Review>(this.endpoint, newReview).pipe(

        switchMap(createdReview =>

            this.loadReviews().pipe(
                switchMap(() => this.articleService.loadArticles()),
                map(() => createdReview)
            )
        ),
        catchError(this.handleError<Review>('createReview'))
    );
  }

  updateReview(id: number, updatedReview: Partial<ReviewDTO>): Observable<Review> {
    return this.http.put<Review>(`${this.endpoint}/${id}`, updatedReview).pipe(
        switchMap(review =>
            this.loadReviews().pipe(
                switchMap(() => this.articleService.loadArticles()),
                map(() => review)
            )
        ),
        catchError(this.handleError<Review>('updateReview'))
    );
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
        switchMap(() => this.loadReviews()),
        map(() => undefined),  // explicitly return undefined
        catchError(this.handleError<void>('deleteReview'))
    );
  }

  updateReviewStatus(id: number, status: ReviewStatus): Observable<Review> {
    return this.http.put<Review>(`${this.endpoint}/${id}/updateStatus`, { status }).pipe(
        switchMap(review =>
            this.loadReviews().pipe(
                switchMap(() => this.articleService.loadArticles()),
                map(() => review)
            )
        ),
        catchError(this.handleError<Review>('updateReviewStatus'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error('An error occurred. Please try again later.'));
    };
  }
}
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { ReviewService } from '../../services/review.service';
import { NotificationService } from '../../services/notification.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ArticleDTO } from '../../models/article.model';
import { ReviewDTO } from '../../models/review.model';
import { ReviewStatus } from '../../models/review.model';

@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      @if (drafts().length === 0) {
        <p class="text-gray-600">No drafts found.</p>
      }

      @for (draft of drafts(); track draft.id) {
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>{{ draft.title }}</mat-card-title>
            <mat-card-subtitle>Category: {{ draft.category }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="mt-2" [innerHTML]="draft.content"></p>
            <p class="text-sm text-gray-500 mt-2">
              Last updated: {{ draft.updatedAt | date: 'medium' }}
            </p>
          </mat-card-content>
          <mat-card-actions class="mt-4 flex gap-2">
            <a mat-raised-button
               color="primary"
               [routerLink]="['/editor']"
               [queryParams]="{ id: draft.id }">
              <mat-icon>edit</mat-icon> Edit Draft
            </a>
            <button mat-raised-button
                    color="accent"
                    (click)="submitForReview(draft)">
              <mat-icon>send</mat-icon> Submit for Review
            </button>
            <button mat-raised-button
                    color="warn"
                    (click)="deleteDraft(draft.id)">
              <mat-icon>delete</mat-icon> Delete
            </button>
          </mat-card-actions>
        </mat-card>
      }

      @if (rejected().length > 0) {
        <h2 class="text-2xl font-bold mb-4">Rejected Posts</h2>
        @for (draft of rejected(); track draft.id) {
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>{{ draft.title }}</mat-card-title>
              <mat-card-subtitle>Category: {{ draft.category }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="mt-2" [innerHTML]="draft.content"></p>
              <p class="text-sm text-gray-500 mt-2">
                Last updated: {{ draft.updatedAt | date: 'medium' }}
              </p>
              @for (review of reviews(); track review.id) {
                @if (review.postId === draft.id && review.status === 'REJECTED') {
                  <p class="text-sm text-red-500 mt-2">
                    Reason for rejection: {{ review.comment || 'No reason provided' }}
                    (reviewed at {{ review.reviewedAt | date: 'medium' }})
                  </p>
                }
              }
            </mat-card-content>
            <mat-card-actions class="mt-4 flex gap-2">
              <a mat-raised-button
                 color="primary"
                 [routerLink]="['/editor']"
                 [queryParams]="{ id: draft.id }">
                <mat-icon>edit</mat-icon> Edit Post
              </a>
              <button mat-raised-button
                      color="accent"
                      (click)="submitForReview(draft)">
                <mat-icon>refresh</mat-icon> Resubmit for Review
              </button>
              <button mat-raised-button
                      color="warn"
                      (click)="deleteDraft(draft.id)">
                <mat-icon>delete</mat-icon> Delete Post
              </button>
            </mat-card-actions>
          </mat-card>
        }
      }

      @if (pending().length > 0) {
        <h2 class="text-2xl font-bold mb-4">Pending Posts</h2>
        @for (draft of pending(); track draft.id) {
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>{{ draft.title }}</mat-card-title>
              <mat-card-subtitle>Category: {{ draft.category }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="mt-2" [innerHTML]="draft.content"></p>
              <p class="text-sm text-gray-500 mt-2">
                Last updated: {{ draft.updatedAt | date: 'medium' }}
              </p>
            </mat-card-content>
            <mat-card-actions class="mt-4 flex gap-2">
              <a mat-raised-button
                 color="primary"
                 [routerLink]="['/editor']"
                 [queryParams]="{ id: draft.id }">
                <mat-icon>edit</mat-icon> Edit Draft
              </a>
              <button mat-raised-button
                      color="warn"
                      (click)="deleteDraft(draft.id)">
                <mat-icon>delete</mat-icon> Delete
              </button>
            </mat-card-actions>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    mat-card {
      margin-bottom: 16px;
    }
    mat-card-content {
      padding: 16px;
    }
    mat-card-actions {
      padding: 16px;
      margin: 0;
    }
  `]
})
export class DraftsComponent implements OnInit {
  // Use signals for reactive state management
  private draftsSignal = signal<ArticleDTO[]>([]);
  private rejectedSignal = signal<ArticleDTO[]>([]);
  private pendingSignal = signal<ArticleDTO[]>([]);
  private reviewsSignal = signal<ReviewDTO[]>([]);

  // Expose signals as getters
  drafts = this.draftsSignal.asReadonly();
  rejected = this.rejectedSignal.asReadonly();
  pending = this.pendingSignal.asReadonly();
  reviews = this.reviewsSignal.asReadonly();

  constructor(
      private articleService: ArticleService,
      private reviewService: ReviewService,
      private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDrafts();
    this.loadRejectedArticles();
    this.loadPendingArticles();
    this.loadReviews();
  }

  loadDrafts() {
    const articles = this.articleService.getDraftArticles();
    this.draftsSignal.set(articles);
  }

  loadRejectedArticles() {
    const articles = this.articleService.getRejectedArticles();
    this.rejectedSignal.set(articles);
  }

  loadPendingArticles() {
    const articles = this.articleService.getPendingArticles();
    this.pendingSignal.set(articles);
  }

  loadReviews() {
    const reviews = this.reviewService.getReviews();
    this.reviewsSignal.set(reviews);
  }

  submitForReview(article: ArticleDTO) {
    this.createReviewForArticle(article, ReviewStatus.PENDING).subscribe({
      next: () => {
        this.notificationService.showNotification('Success', 'Review created successfully for approval', 'success');
        this.loadDrafts();
      },
      error: (error) => {
        this.notificationService.showNotification('Error creating review for approval:', error, 'error');
      }
    });
  }

  createReviewForArticle(article: ArticleDTO, status: ReviewStatus) {
    const newReview = {
      postId: article.id,
      reviewerId: 1,
      status: status,
      comment: '',
    };

    return this.reviewService.createReview(newReview);
  }

  deleteDraft(id: number) {
    if (confirm('Are you sure you want to delete this draft?')) {
      this.articleService.deleteArticle(id);
      this.loadDrafts();
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { ReviewService } from '../../services/review.service';
import { ArticleDTO } from '../../models/article.model';
import { ReviewDTO } from '../../models/review.model';
import { ReviewStatus } from "../../models/review.model";
import { NotificationService } from "../../services/notification.service";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-drafts',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">My Drafts</h2>

      <p *ngIf="drafts.length === 0" class="text-gray-600">
        No drafts found.
      </p>
      <mat-card *ngFor="let draft of drafts; trackBy: trackByArticleId" class="mb-4">
        <mat-card-header>
          <mat-card-title>{{ draft.title }}</mat-card-title>
          <mat-card-subtitle>Category: {{ draft.category }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="mt-2" [innerHTML]="draft.content"></p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ draft.updatedAt | date: 'medium' }}</p>
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

      <h2 *ngIf="rejected.length > 0" class="text-2xl font-bold mb-4">Rejected Posts</h2>
      <mat-card *ngFor="let draft of rejected; trackBy: trackByArticleId" class="mb-4">
        <mat-card-header>
          <mat-card-title>{{ draft.title }}</mat-card-title>
          <mat-card-subtitle>Category: {{ draft.category }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="mt-2" [innerHTML]="draft.content"></p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ draft.updatedAt | date: 'medium' }}</p>
          <div *ngFor="let review of reviews; trackBy: trackByReviewId">
            <div *ngIf="review.postId == draft.id && review.status === 'REJECTED'">
              <p class="text-sm text-red-500 mt-2">
                Reason for rejection: {{ review.comment || 'No reason provided' }}
                (reviewed at {{ review.reviewedAt | date: 'medium' }})
              </p>
            </div>
          </div>
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

      <h2 *ngIf="pending.length > 0" class="text-2xl font-bold mb-4">Pending Posts</h2>
      <mat-card *ngFor="let draft of pending; trackBy: trackByArticleId" class="mb-4">
        <mat-card-header>
          <mat-card-title>{{ draft.title }}</mat-card-title>
          <mat-card-subtitle>Category: {{ draft.category }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="mt-2" [innerHTML]="draft.content"></p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ draft.updatedAt | date: 'medium' }}</p>
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
  drafts: ArticleDTO[] = [];
  rejected: ArticleDTO[] = [];
  pending: ArticleDTO[] = [];
  reviews :ReviewDTO[] = [];

  constructor(private articleService: ArticleService, private reviewService: ReviewService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadDrafts();
    this.loadRejectedArticles();
    this.loadPendingArticles();
    this.loadReviews();
  }

  loadDrafts() {
    this.articleService.getDraftArticles().subscribe(articles => {
      this.drafts = articles;
    });
  }

  loadRejectedArticles() {
    this.articleService.getRejectedArticles().subscribe(articles => {
      this.rejected = articles;
    });
  }

  loadPendingArticles() {
    this.articleService.getPendingArticles().subscribe(articles => {
      this.pending = articles;
    });
  }

  loadReviews() {
      this.reviewService.getReviews().subscribe(reviews => {
        this.reviews = reviews;
      });
  }

  submitForReview(article: ArticleDTO) {
    this.createReviewForArticle(article, ReviewStatus.PENDING).subscribe({
      next: (review) => {
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

  trackByArticleId(index: number, article: ArticleDTO): number {
    return article.id;
  }

  trackByReviewId(index: number, review: ReviewDTO): number {
      return review.id;
  }
}

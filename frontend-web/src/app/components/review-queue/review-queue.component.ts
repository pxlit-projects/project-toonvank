import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { ReviewService } from '../../services/review.service';
import { ArticleDTO } from '../../models/article.model';
import { ReviewStatus } from '../../models/review.model';
import { ArticleCardComponent } from "../article-list/article-card.component";
import { CommentSectionComponent } from "../article-list/comment-section.component";
import {NotificationService} from "../../services/notification.service";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-review-queue',
  imports: [
    CommonModule,
    ArticleCardComponent,
    CommentSectionComponent,
    MatButtonModule,
    MatIconModule
  ],
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Review Queue</h2>

      <p *ngIf="pendingArticles.length === 0" class="text-gray-600">
        No articles pending review.
      </p>

      <div *ngFor="let article of pendingArticles; trackBy: trackByArticleId" class="mb-4">
        <app-article-card [article]="article">
          <div>
            <app-comment-section [articleId]="article.id" [isAllowedToPost]="false" (commentAdded)="onCommentAdded($event)"></app-comment-section>
          </div>
        </app-article-card>
        <div class="mt-4 flex gap-2 justify-end">
          <button
              mat-raised-button
              color="primary"
              (click)="approveArticle(article)"
          >
            <mat-icon>check</mat-icon>
            Approve
          </button>
          <button
              mat-raised-button
              color="warn"
              (click)="rejectArticle(article.id)"
          >
            <mat-icon>close</mat-icon>
            Reject
          </button>
        </div>
      </div>
    </div>
  `
})
export class ReviewQueueComponent implements OnInit {
  pendingArticles: ArticleDTO[] = [];
  currentComment: string = '';

  constructor(private articleService: ArticleService, private reviewService: ReviewService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.articleService.getPendingArticles().subscribe(articles => {
      this.pendingArticles = articles;
      console.log('Pending articles:', articles);
    });
  }

  onCommentAdded(comment: string) {
    this.currentComment = comment;
  }

  approveArticle(article: ArticleDTO) {
    this.createReviewForArticle(article, ReviewStatus.APPROVED).subscribe({
      next: (review) => {
        this.notificationService.showNotification('Success', 'Review created successfully for approval', 'success');
      },
      error: (error) => {
        this.notificationService.showNotification('Error creating review for approval:', error, 'error');
      }
    });
  }

  rejectArticle(id: number) {
    const article = this.pendingArticles.find(a => a.id === id);
    if (article) {
      this.createReviewForArticle(article, ReviewStatus.REJECTED).subscribe({
        next: (review) => {
            this.notificationService.showNotification('Success', 'Review created successfully for rejection', 'success');
        },
        error: (error) => {
            this.notificationService.showNotification('Error creating review for rejection:', error, 'error');
        }
      });
    }
  }

  createReviewForArticle(article: ArticleDTO, status: ReviewStatus) {
    console.log(this.currentComment);
    const newReview = {
      postId: article.id,
      reviewerId: 1,
      status: status,
      comment: this.currentComment || ''
    };

    return this.reviewService.createReview(newReview);
  }

  trackByArticleId(index: number, article: ArticleDTO): number {
    return article.id;
  }
}

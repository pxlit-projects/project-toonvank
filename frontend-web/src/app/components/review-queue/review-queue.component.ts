import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { ReviewService } from '../../services/review.service';
import { ArticleDTO } from '../../models/article.model';
import { ReviewStatus } from '../../models/review.model';
import { ArticleCardComponent } from "../article-list/article-card.component";
import { CommentSectionComponent } from "../article-list/comment-section.component";
import { NotificationService } from "../../services/notification.service";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

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
  templateUrl: './review-queue.component.html',
  styleUrls: ['./review-queue.component.css']
})
export class ReviewQueueComponent implements OnInit {
  private pendingArticlesSignal = signal<ArticleDTO[]>([]);
  private currentCommentSignal = signal<string>('');

  pendingArticles = computed(() => this.pendingArticlesSignal());
  currentComment = computed(() => this.currentCommentSignal());

  private articleService = inject(ArticleService);
  private reviewService = inject(ReviewService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.loadPendingArticles();
  }

  loadPendingArticles() {
    const articles = this.articleService.getPendingArticles();
    this.pendingArticlesSignal.set(articles);
  }

  onCommentAdded(comment: string) {
    this.currentCommentSignal.set(comment);
  }

  approveArticle(article: ArticleDTO) {
    this.createReviewForArticle(article, ReviewStatus.PUBLISHED).subscribe({
      next: (review) => {
        this.notificationService.showNotification('Success', 'Review created successfully for approval', 'success');
        this.loadPendingArticles();
      },
      error: (error) => {
        this.notificationService.showNotification('Error creating review for approval:', error, 'error');
      }
    });
  }

  rejectArticle(id: number) {
    const article = this.pendingArticlesSignal().find(a => a.id === id);
    if (article) {
      this.createReviewForArticle(article, ReviewStatus.REJECTED).subscribe({
        next: (review) => {
          this.notificationService.showNotification('Success', 'Review created successfully for rejection', 'success');
          this.loadPendingArticles();
        },
        error: (error) => {
          this.notificationService.showNotification('Error creating review for rejection:', error, 'error');
        }
      });
    }
  }

  createReviewForArticle(article: ArticleDTO, status: ReviewStatus) {
    const newReview = {
      postId: article.id,
      reviewerId: 1,
      status: status,
      comment: this.currentCommentSignal() || ''
    };

    return this.reviewService.createReview(newReview);
  }

  trackByArticleId(index: number, article: ArticleDTO): number {
    return article.id;
  }
}
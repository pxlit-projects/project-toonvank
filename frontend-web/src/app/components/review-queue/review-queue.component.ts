import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { ReviewService } from '../../services/review.service';
import { ArticleDTO } from '../../models/article.model';
import { ReviewStatus } from '../../models/review.model';
import { ArticleCardComponent } from "../article-list/article-card.component";
import { CommentSectionComponent } from "../article-list/comment-section.component";

@Component({
  selector: 'app-review-queue',
  imports: [CommonModule, ArticleCardComponent, CommentSectionComponent],
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Review Queue</h2>

      <p *ngIf="pendingArticles.length === 0" class="text-gray-600">
        No articles pending review.
      </p>

      <div *ngFor="let article of pendingArticles; trackBy: trackByArticleId" class="mb-4">
        <app-article-card [article]="article">
          <app-comment-section [articleId]="article.id"></app-comment-section>
          <div class="mt-4 flex gap-2">
            <button
                (click)="approveArticle(article)"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve
            </button>
            <button
                (click)="rejectArticle(article.id)"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        </app-article-card>
      </div>
    </div>
  `
})
export class ReviewQueueComponent implements OnInit {
  pendingArticles: ArticleDTO[] = [];

  constructor(private articleService: ArticleService, private reviewService: ReviewService) {}

  ngOnInit() {
    this.articleService.getPendingArticles().subscribe(articles => {
      this.pendingArticles = articles;
      console.log('Pending articles:', articles);
    });
  }

  approveArticle(article: ArticleDTO) {
    this.createReviewForArticle(article, ReviewStatus.APPROVED).subscribe({
      next: (review) => {
        console.log('Review created successfully for approval:', review);
      },
      error: (error) => {
        console.error('Error creating review for approval:', error);
      }
    });
  }

  rejectArticle(id: number) {
    const article = this.pendingArticles.find(a => a.id === id);
    if (article) {
      this.createReviewForArticle(article, ReviewStatus.REJECTED).subscribe({
        next: (review) => {
          console.log('Review created successfully for rejection:', review);
        },
        error: (error) => {
          console.error('Error creating review for rejection:', error);
        }
      });
    }
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

  trackByArticleId(index: number, article: ArticleDTO): number {
    return article.id;
  }
}

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
import Swal from "sweetalert2";

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
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.css']
})
export class DraftsComponent implements OnInit {
  private draftsSignal = signal<ArticleDTO[]>([]);
  private rejectedSignal = signal<ArticleDTO[]>([]);
  private pendingSignal = signal<ArticleDTO[]>([]);
  private reviewsSignal = signal<ReviewDTO[]>([]);

  // Create computed signals that filter articles by current user
  drafts = computed(() => {
    const currentUser = localStorage.getItem('userName');
    return this.draftsSignal().filter(draft => draft.author === currentUser);
  });

  rejected = computed(() => {
    const currentUser = localStorage.getItem('userName');
    return this.rejectedSignal().filter(draft => draft.author === currentUser);
  });

  pending = computed(() => {
    const currentUser = localStorage.getItem('userName');
    return this.pendingSignal().filter(draft => draft.author === currentUser);
  });

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
    if (this.isAuthor(article)) {
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
    const article = this.draftsSignal().find(d => d.id === id) ||
        this.pendingSignal().find(d => d.id === id) ||
        this.rejectedSignal().find(d => d.id === id);

    if (article && this.isAuthor(article)) {
      Swal.fire({
        title: 'Delete Article',
        text: 'Are you sure you want to delete this article?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          try {
            this.articleService.deleteArticle(id);
            this.loadDrafts();
            this.loadPendingArticles();
            this.loadRejectedArticles();
            Swal.fire(
                'Deleted!',
                'Your article has been deleted.',
                'success'
            );
          } catch (error) {
            Swal.fire(
                'Error!',
                'Failed to delete the article.',
                'error'
            );
          }
        }
      });
    }
  }

  private isAuthor(article: ArticleDTO): boolean {
    const currentUser = localStorage.getItem('userName');
    return currentUser === article.author;
  }
}
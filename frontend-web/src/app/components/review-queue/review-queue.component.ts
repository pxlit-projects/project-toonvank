import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { ArticleDTO } from '../../models/article.model';
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
                (click)="approveArticle(article.id)"
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

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.articleService.getPendingArticles().subscribe(articles => {
      this.pendingArticles = articles;
      console.log('Pending articles:', articles);
    });
  }

  approveArticle(id: number) {
    this.articleService.approveArticle(id);
  }

  rejectArticle(id: number) {
    this.articleService.rejectArticle(id);
  }

  trackByArticleId(index: number, article: ArticleDTO): number {
    return article.id;
  }
}

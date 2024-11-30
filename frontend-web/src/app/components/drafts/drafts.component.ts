import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { ArticleDTO } from '../../models/article.model';
import {CommentSectionComponent} from "../article-list/comment-section.component";

@Component({
  selector: 'app-drafts',
  imports: [CommonModule, RouterModule, CommentSectionComponent],
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">My Drafts</h2>

      <p *ngIf="drafts.length === 0" class="text-gray-600">
        No drafts found.
      </p>
      <div *ngFor="let draft of drafts; trackBy: trackByArticleId" class="mb-4">
        <div class="border p-4 rounded shadow-sm">
          <h3 class="text-xl font-bold">{{ draft.title }}</h3>
          <p class="text-gray-600">Category: {{ draft.category }}</p>
          <p class="mt-2" [innerHTML]="draft.content"></p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ draft.updatedAt | date: 'medium' }}</p>

          <div class="mt-4 flex gap-2">
            <a
                [routerLink]="['/editor']"
                [queryParams]="{ id: draft.id }"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Draft
            </a>
            <button
                (click)="submitForReview(draft.id)"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Submit for Review
            </button>
            <button
                (click)="deleteDraft(draft.id)"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <h2 *ngIf="rejected.length > 0" class="text-2xl font-bold mb-4">Rejected Posts</h2>
      <div *ngFor="let draft of rejected; trackBy: trackByArticleId" class="mb-4">
        <div class="border p-4 rounded shadow-sm">
          <h3 class="text-xl font-bold">{{ draft.title }}</h3>
          <p class="text-gray-600">Category: {{ draft.category }}</p>
          <p class="mt-2"  [innerHTML]="draft.content"></p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ draft.updatedAt | date: 'medium' }}</p>

          <app-comment-section [articleId]="draft.id"></app-comment-section>

          <div class="mt-4 flex gap-2">
            <a
                [routerLink]="['/editor']"
                [queryParams]="{ id: draft.id }"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Post
            </a>
            <button
                (click)="submitForReview(draft.id)"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Resubmit for Review
            </button>
            <button
                (click)="deleteDraft(draft.id)"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Post
            </button>
          </div>
        </div>
      </div>

      <h2 *ngIf="pending.length > 0" class="text-2xl font-bold mb-4">Pending Posts</h2>
      <div *ngFor="let draft of pending; trackBy: trackByArticleId" class="mb-4">
        <div class="border p-4 rounded shadow-sm">
          <h3 class="text-xl font-bold">{{ draft.title }}</h3>
          <p class="text-gray-600">Category: {{ draft.category }}</p>
          <p class="mt-2" [innerHTML]="draft.content"></p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ draft.updatedAt | date: 'medium' }}</p>

          <div class="mt-4 flex gap-2">
            <a
                [routerLink]="['/editor']"
                [queryParams]="{ id: draft.id }"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Draft
            </a>
            <button
                (click)="deleteDraft(draft.id)"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DraftsComponent implements OnInit {
  drafts: ArticleDTO[] = [];
  rejected: ArticleDTO[] = [];
  pending: ArticleDTO[] = [];

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.loadDrafts();
    this.loadRejectedArticles();
    this.loadPendingArticles();
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

  submitForReview(id: number) {
    this.articleService.submitForReview(id);
    this.loadDrafts();
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
}

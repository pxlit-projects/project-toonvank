import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">My Drafts</h2>
      
      @if (drafts.length === 0) {
        <p class="text-gray-600">No drafts found.</p>
      }
      
      @for (draft of drafts; track draft.id) {
        <div class="border p-4 rounded shadow-sm mb-4">
          <h3 class="text-xl font-bold">{{ draft.title }}</h3>
          <p class="text-gray-600">Category: {{ draft.category }}</p>
          <p class="mt-2">{{ draft.content }}</p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ draft.updatedAt | date:'medium' }}</p>
          
          <div class="mt-4 flex gap-2">
            <a 
              [routerLink]="['/editor']" 
              [queryParams]="{id: draft.id}"
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
      }
    </div>
  `
})
export class DraftsComponent implements OnInit {
  drafts: Article[] = [];

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.loadDrafts();
  }

  loadDrafts() {
    this.articleService.getDraftArticles().subscribe(articles => {
      this.drafts = articles;
    });
  }

  submitForReview(id: string) {
    this.articleService.submitForReview(id);
    this.loadDrafts();
  }

  deleteDraft(id: string) {
    if (confirm('Are you sure you want to delete this draft?')) {
      this.articleService.deleteArticle(id);
      this.loadDrafts();
    }
  }
}
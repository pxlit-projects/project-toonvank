import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-review-queue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Review Queue</h2>
      
      @if (pendingArticles.length === 0) {
        <p class="text-gray-600">No articles pending review.</p>
      }
      
      @for (article of pendingArticles; track article.id) {
        <div class="border p-4 rounded shadow-sm mb-4">
          <h3 class="text-xl font-bold">{{ article.title }}</h3>
          <p class="text-gray-600">Category: {{ article.category }}</p>
          <p class="mt-2">{{ article.content }}</p>
          <p class="text-sm text-gray-500 mt-2">Submitted: {{ article.createdAt | date:'medium' }}</p>
          
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
        </div>
      }
    </div>
  `
})
export class ReviewQueueComponent implements OnInit {
  pendingArticles: Article[] = [];

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.articleService.getPendingArticles().subscribe(articles => {
      this.pendingArticles = articles;
      console.log('Pending articles:', articles);
    });
  }

  approveArticle(id: string) {
    this.articleService.approveArticle(id);
  }

  rejectArticle(id: string) {
    this.articleService.rejectArticle(id);
  }
}
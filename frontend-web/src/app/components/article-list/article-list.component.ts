import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-4 flex gap-4">
        <div>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Search articles..."
            class="p-2 border rounded"
          />
        </div>
        <div>
          <select [(ngModel)]="selectedCategory" class="p-2 border rounded">
            <option value="">All Categories</option>
            <option value="news">News</option>
            <option value="updates">Updates</option>
            <option value="announcements">Announcements</option>
          </select>
        </div>
        <div>
          <select [(ngModel)]="viewMode" class="p-2 border rounded">
            <option value="published">Published</option>
            <option value="drafts">My Drafts</option>
          </select>
        </div>
      </div>

      <div class="grid gap-4">
        @if (filteredArticles.length === 0) {
          <p class="text-gray-600">No articles found.</p>
        }

        @for (article of filteredArticles; track article.id) {
          <div class="border p-4 rounded shadow-sm">
            <h2 class="text-xl font-bold">{{ article.title }}</h2>
            <p class="text-gray-600">{{ article.category }}</p>
            <p class="mt-2">{{ article.content }}</p>
            <p class="text-sm text-gray-500 mt-2">Last updated: {{ article.updatedAt | date:'medium' }}</p>
            <div class="mt-4">
              <h3 class="font-bold">Comments</h3>
              @for (comment of article.comments; track comment.id) {
                <div class="ml-4 mt-2 p-2 bg-gray-50 rounded">
                  <p>{{ comment.content }}</p>
                  <p class="text-sm text-gray-500">{{ comment.createdAt | date:'medium' }}</p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  searchTerm = '';
  selectedCategory = '';
  viewMode: 'published' | 'drafts' = 'published';

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    if (this.viewMode === 'published') {
      this.articleService.getPublishedArticles().subscribe(
        articles => this.articles = articles
      );
    } else {
      this.articleService.getDraftArticles().subscribe(
        articles => this.articles = articles
      );
    }
  }

  get filteredArticles(): Article[] {
    return this.articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          article.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || article.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }
}
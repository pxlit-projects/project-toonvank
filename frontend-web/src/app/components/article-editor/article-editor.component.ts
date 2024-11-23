import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Router, ActivatedRoute } from '@angular/router';
import {Article, ArticleDTO} from '../../models/article.model';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <form (ngSubmit)="saveArticle()" class="max-w-2xl mx-auto">
        <div class="mb-4">
          <label class="block mb-2">Title</label>
          <input
            type="text"
            [(ngModel)]="article.title"
            name="title"
            class="w-full p-2 border rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-2">Category</label>
          <select
            [(ngModel)]="article.category"
            name="category"
            class="w-full p-2 border rounded"
            required
          >
            <option value="news">News</option>
            <option value="updates">Updates</option>
            <option value="announcements">Announcements</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block mb-2">Content</label>
          <textarea
            [(ngModel)]="article.content"
            name="content"
            rows="10"
            class="w-full p-2 border rounded"
            required
          ></textarea>
        </div>

        <div class="flex gap-2">
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save as Draft
          </button>
          <button
            type="button"
            (click)="submitForReview()"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  `
})
export class ArticleEditorComponent implements OnInit {
  article: Partial<ArticleDTO> = {
    title: '',
    content: '',
    category: 'news'
  };
  isEditing = false;

  constructor(
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if we're editing an existing article
    const articleId = this.route.snapshot.queryParams['id'];
    if (articleId) {
      this.articleService.getArticles().subscribe(articles => {
        const existingArticle = articles.find(a => a.id === articleId);
        if (existingArticle) {
          this.article = { ...existingArticle };
          this.isEditing = true;
        }
      });
    }
  }

  saveArticle() {
    if (!this.article.title || !this.article.content) return;
    
    if (this.isEditing && this.article.id) {
      this.articleService.updateArticle(this.article.id, {
        ...this.article,
        status: 'draft'
      });
    } else {
      this.articleService.createArticle({
        ...this.article,
        author: 'current-user-id',
        status: 'draft'
      });
    }
    this.router.navigate(['/drafts']);
  }

  submitForReview() {
    if (!this.article.title || !this.article.content) return;
    
    if (this.isEditing && this.article.id) {
      this.articleService.updateArticle(this.article.id, {
        ...this.article,
        status: 'pending'
      });
    } else {
      this.articleService.createArticle({
        ...this.article,
        author: 'current-user-id',
        status: 'pending'
      });
    }
    this.router.navigate(['/']);
  }
}
import {Component, NgModule, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgModel} from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Router, ActivatedRoute } from '@angular/router';
import {Article, ArticleDTO} from '../../models/article.model';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-article-editor',
  imports: [CommonModule, FormsModule,QuillModule],
  standalone: true,
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
          <quill-editor name="content" [(ngModel)]="article.content"></quill-editor>

        </div>

        <div class="flex gap-2">
          <button
              type="submit"
              (click)="saveArticle()"
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
    const articleId = this.route.snapshot.queryParams['id'];
    if (articleId) {
      this.articleService.getArticleById(Number(articleId)).subscribe({
        next: (article) => {
          console.log(article)
          this.article = { ...article };
          this.isEditing = true;
        },
        error: (error) => {
          // Handle potential errors (e.g., article not found)
          console.error('Error fetching article', error);
          // Optionally show user-friendly error message
        }
      });
    }
  }

  saveArticle() {
    if (!this.article.title || !this.article.content) return;

    if (this.isEditing && this.article.id) {
      this.articleService.updateArticle(this.article.id, {
        ...this.article,
        status: 'DRAFT'
      });
    } else {
      this.articleService.createArticle({
        ...this.article,
        author: localStorage.getItem("userName") || "no-user-id",
        status: 'DRAFT'
      }).subscribe();
    }
    this.router.navigate(['/drafts']);
  }

  submitForReview() {
    if (!this.article.title || !this.article.content) return;

    if (this.isEditing && this.article.id) {
      this.articleService.updateArticle(this.article.id, {
        ...this.article,
        status: 'PENDING'
      });
    } else {
      this.articleService.createArticle({
        ...this.article,
        author: localStorage.getItem("userName") || "no-user-id",
        status: 'PENDING'
      });
    }
    this.router.navigate(['/']);
  }
}
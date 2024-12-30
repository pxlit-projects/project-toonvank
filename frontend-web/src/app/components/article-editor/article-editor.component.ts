import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Article, ArticleDTO } from '../../models/article.model';
import { QuillModule } from 'ngx-quill';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-article-editor',
  imports: [
    CommonModule,
    FormsModule,
    QuillModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <form (ngSubmit)="saveArticle()" class="max-w-2xl mx-auto">
        <mat-form-field class="w-full mb-4">
          <mat-label>Title</mat-label>
          <input
            matInput
            type="text"
            [(ngModel)]="article.title"
            name="title"
            required
          />
        </mat-form-field>

        <mat-form-field class="w-full mb-4">
          <mat-label>Category</mat-label>
          <mat-select
            [(ngModel)]="article.category"
            name="category"
            required
          >
            <mat-option value="news">News</mat-option>
            <mat-option value="updates">Updates</mat-option>
            <mat-option value="announcements">Announcements</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="mb-4">
          <label class="block mb-2">Content</label>
          <quill-editor 
            name="content" 
            [(ngModel)]="article.content"
          ></quill-editor>
        </div>

        <div class="flex gap-2">
          <button
            mat-raised-button
            color="primary"
            type="submit"
          >
            Save as Draft
          </button>
          <button
            mat-raised-button
            color="accent"
            type="button"
            (click)="submitForReview()"
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
        author: localStorage.getItem("userName")!,
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
        author: localStorage.getItem("userName")!,
        status: 'PENDING'
      });
    }
    this.router.navigate(['/']);
  }
}
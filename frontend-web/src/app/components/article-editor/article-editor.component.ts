import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleDTO } from '../../models/article.model';
import { QuillModule } from 'ngx-quill';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {switchMap, tap} from "rxjs";

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuillModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.css']
})
export class ArticleEditorComponent implements OnInit {
  private articleService = inject(ArticleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  article: Partial<ArticleDTO> = {
    title: '',
    content: '',
    category: 'news'
  };
  isEditing = false;

  ngOnInit() {
    const articleId = this.route.snapshot.queryParams['id'];
    if (articleId) {
      this.articleService.getArticleById(Number(articleId)).subscribe({
        next: (article) => {
          this.article = { ...article };
          this.isEditing = true;
        },
        error: (error) => {
          console.error('Error fetching article', error);
        }
      });
    }
  }

  saveArticle() {
    if (!this.article.title || !this.article.content) return;

    if (this.isEditing && this.article.id) {

      this.articleService.updateArticle(this.article.id, {
        ...this.article,
        status: this.article.status
      }).pipe(

          switchMap(() => this.articleService.loadArticles()),

          tap(() => {
            if (this.article.status === 'DRAFT') {
              this.router.navigate(['/drafts']);
            } else {
              this.router.navigate(['/articles']);
            }
          })
      ).subscribe();
    } else {

      this.articleService.createArticle({
        ...this.article,
        author: localStorage.getItem("userName")!,
        status: 'DRAFT'
      }).pipe(

          switchMap(() => this.articleService.loadArticles()),

          tap(() => {
            this.router.navigate(['/drafts']);
          })
      ).subscribe();
    }
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
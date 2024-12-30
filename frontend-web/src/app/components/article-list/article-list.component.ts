import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ArticleDTO } from "../../models/article.model";
import { ArticleService } from "../../services/article.service";
import { ArticleCardComponent } from "./article-card.component";
import { CommentSectionComponent } from "./comment-section.component";
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: "app-article-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ArticleCardComponent,
    CommentSectionComponent,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-4 flex gap-4">
        <mat-form-field>
          <mat-label>Search articles & authors</mat-label>
          <input matInput [(ngModel)]="searchTerm">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="selectedCategory">
            <mat-option value="">All Categories</mat-option>
            <mat-option value="news">News</mat-option>
            <mat-option value="updates">Updates</mat-option>
            <mat-option value="announcements">Announcements</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Author</mat-label>
          <mat-select [(ngModel)]="selectedAuthor">
            <mat-option value="" disabled>Select an author</mat-option>
            <mat-option *ngFor="let author of uniqueAuthors" [value]="author">
              {{ author }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Start date</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate">
          <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field>
          <mat-label>End date</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate">
          <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <div class="grid gap-4">
        <p *ngIf="filteredArticles.length === 0" class="text-gray-600">No articles found.</p>
        <app-article-card
            *ngFor="let article of filteredArticles; trackBy: trackByArticleId"
            [article]="article"
        >
          <app-comment-section [articleId]="article.id"></app-comment-section>
        </app-article-card>
      </div>
    </div>
  `,
})
export class ArticleListComponent implements OnInit {
  articles: ArticleDTO[] = [];
  searchTerm = '';
  selectedCategory = '';
  startDate = '';
  endDate = '';
  selectedAuthor = '';
  uniqueAuthors: string[] = [];

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.articleService.getArticles().subscribe((articles) => {
      this.articles = articles;
      this.uniqueAuthors = this.getUniqueAuthors();
    });
  }

  getUniqueAuthors(): string[] {
    return [...new Set(this.articles.map((article) => article.author))];
  }

  get filteredArticles(): ArticleDTO[] {
    return this.articles.filter((article) => {
      const matchesSearch =
          article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          article.author.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory =
          !this.selectedCategory || article.category === this.selectedCategory;
      const articleDate = new Date(article.updatedAt);
      const matchesDate =
          (!this.startDate || articleDate >= new Date(this.startDate)) &&
          (!this.endDate || articleDate <= new Date(this.endDate));
      const matchesAuthor =
          !this.selectedAuthor || article.author === this.selectedAuthor;

      return matchesSearch && matchesCategory && matchesDate && matchesAuthor;
    });
  }

  trackByArticleId(index: number, article: ArticleDTO): number {
    return article.id;
  }
}

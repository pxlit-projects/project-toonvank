import {
  Component,
  signal,
  computed,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleDTO } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { ArticleCardComponent } from './article-card.component';
import { CommentSectionComponent } from './comment-section.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-article-list',
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
          <input matInput [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Category</mat-label>
          <mat-select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)">
            <mat-option value="">All Categories</mat-option>
            <mat-option value="news">News</mat-option>
            <mat-option value="updates">Updates</mat-option>
            <mat-option value="announcements">Announcements</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Author</mat-label>
          <mat-select [ngModel]="selectedAuthor()" (ngModelChange)="selectedAuthor.set($event)">
            <mat-option value="" disabled>Select an author</mat-option>
            @for (author of uniqueAuthors(); track author) {
              <mat-option [value]="author">
                {{ author }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Start date</mat-label>
          <input matInput [matDatepicker]="startPicker" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)">
          <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field>
          <mat-label>End date</mat-label>
          <input matInput [matDatepicker]="endPicker" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)">
          <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <div class="grid gap-4">
        @if (filteredArticles().length === 0) {
          <p class="text-gray-600">No articles found.</p>
        }
        @for (article of filteredArticles(); track article.id) {
          <app-article-card [article]="article">
            <app-comment-section [articleId]="article.id"></app-comment-section>
          </app-article-card>
        }
      </div>
    </div>
  `,
})
export class ArticleListComponent {
  private articleService = inject(ArticleService);

  // Signals for reactive state management
  articles = signal<ArticleDTO[]>([]);
  searchTerm = signal('');
  selectedCategory = signal('');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  selectedAuthor = signal('');

  // Computed unique authors
  uniqueAuthors = computed(() =>
      [...new Set(this.articles().map((article) => article.author))]
  );

  filteredArticles = computed(() => {
    return this.articles().filter((article) => {
      const isPublished = article.status === 'PUBLISHED';

      const matchesSearch =
          article.title.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
          article.content.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
          article.author.toLowerCase().includes(this.searchTerm().toLowerCase());

      const matchesCategory =
          !this.selectedCategory() || article.category === this.selectedCategory();

      const articleDate = new Date(article.updatedAt);
      const matchesDate =
          (!this.startDate() || articleDate >= this.startDate()!) &&
          (!this.endDate() || articleDate <= this.endDate()!);

      const matchesAuthor =
          !this.selectedAuthor() || article.author === this.selectedAuthor();

      return isPublished && matchesSearch && matchesCategory && matchesDate && matchesAuthor;
    });
  });

  constructor() {
    // Use effect for loading articles
    effect(() => {
      const articles = this.articleService.getArticles();
      this.articles.set(articles);
    });
  }
}
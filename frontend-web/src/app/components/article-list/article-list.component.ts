import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ArticleDTO } from "../../models/article.model";
import { ArticleService } from "../../services/article.service";
import {ArticleCardComponent} from "./article-card.component";
import {CommentSectionComponent} from "./comment-section.component";

@Component({
  selector: "app-article-list",
  standalone: true,
  imports: [CommonModule, FormsModule, ArticleCardComponent, CommentSectionComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-4 flex gap-4">
        <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Search articles & authors..."
            class="p-2 border rounded"
        />
        <select [(ngModel)]="selectedCategory" class="p-2 border rounded">
          <option value="">All Categories</option>
          <option value="news">News</option>
          <option value="updates">Updates</option>
          <option value="announcements">Announcements</option>
        </select>
        <select [(ngModel)]="selectedAuthor" class="p-2 border rounded">
          <option value="" disabled>Select an author</option>
          <option *ngFor="let author of uniqueAuthors" [ngValue]="author">
            {{ author }}
          </option>
        </select>
        <input type="date" [(ngModel)]="startDate" class="p-2 border rounded" />
        <input type="date" [(ngModel)]="endDate" class="p-2 border rounded" />
      </div>

      <div class="grid gap-4">
        <p *ngIf="filteredArticles.length === 0" class="text-gray-600">No articles found.</p>
        <app-article-card
            *ngFor="let article of filteredArticles; trackBy: trackByArticleId"
            [article]="article"
        ><app-comment-section [articleId]="article.id"></app-comment-section></app-article-card>
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

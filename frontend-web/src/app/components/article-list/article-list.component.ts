import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Component, OnInit} from "@angular/core";
import {ArticleDTO} from "../../models/article.model";
import {ArticleService} from "../../services/article.service";
import {CommentService} from "../../services/comment.service";
import {Comment} from "../../models/comment.model";

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, FormsModule],
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <!-- Filters -->
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
        <input type="date" [(ngModel)]="startDate" class="p-2 border rounded"/>
        <input type="date" [(ngModel)]="endDate" class="p-2 border rounded"/>
      </div>

      <div class="grid gap-4">
        <p *ngIf="filteredArticles.length === 0" class="text-gray-600">No articles found.</p>
        <div *ngFor="let article of filteredArticles; trackBy: trackByArticleId"
            class="border p-4 rounded shadow-sm">
          <h2 class="text-xl font-bold">{{ article.title }}</h2>
          <p class="text-gray-600">{{ article.category }}</p>
          <p class="mt-2" [innerHTML]="article.content"></p>
          <p class="text-sm text-gray-500 mt-2">Last updated: {{ article.updatedAt | date: 'medium' }}</p>
          <p class="text-sm text-gray-500 mt-2">Posted by: {{ article.author }}</p>

          <div *ngIf="commentsMap[article.id]?.length; else noComments">
            <div *ngFor="let comment of commentsMap[article.id]" class="border p-4 rounded shadow-sm">
              <p>{{ comment.content }}</p>
              <p class="text-sm text-gray-500 mt-2">Posted by: {{ comment.postedBy }}</p>
            </div>
          </div>
          <ng-template #noComments>
            <p class="text-sm text-gray-500 mt-2">No comments yet.</p>
          </ng-template>

          <div class="mt-4">
            <div class="flex gap-4">
              <input
                  type="text"
                  [(ngModel)]="newComments[article.id]"
                  placeholder="Add a comment..."
                  class="flex-1 p-2 border rounded"
                  (keyup.enter)="addComment(article.id)"
              />
              <button
                  (click)="addComment(article.id)"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArticleListComponent implements OnInit {
  articles: ArticleDTO[] = [];
  commentsMap: { [articleId: number]: Comment[] } = {};
  newComments: { [key: string]: string } = {};
  searchTerm = '';
  selectedCategory = '';
  startDate = '';
  endDate = '';
  selectedAuthor = '';
  uniqueAuthors: string[] = [];

  constructor(private articleService: ArticleService, private commentService: CommentService) {}

  ngOnInit() {
    this.articleService.getArticles().subscribe((articles) => {
      this.articles = articles;
      this.uniqueAuthors = this.getUniqueAuthors();
      this.loadComments();
    });
  }

  loadComments(): void {
    this.articles.forEach((article: ArticleDTO) => {
      this.commentService.getCommentByPostId(article.id).subscribe((comments: Comment[]) => {
        this.commentsMap[article.id] = comments;
      });
    });
  }

  addComment(articleId: number) {
    if (!this.newComments[articleId]?.trim()) {
      return;
    }

    if (!this.commentsMap[articleId]) {
      this.commentsMap[articleId] = [];
    }

    let addedComment = {
          postId: articleId,
          content: this.newComments[articleId],
          createdAt: new Date(),
          postedBy: localStorage.getItem("userName")!,
      };

    this.commentsMap[articleId].push(addedComment);

    this.commentService.createComment(addedComment).subscribe();

    this.newComments[articleId] = '';
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

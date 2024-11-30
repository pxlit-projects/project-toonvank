import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ArticleDTO } from "../../models/article.model";
import { CommentService } from "../../services/comment.service";
import { Comment } from "../../models/comment.model";
import {CommentSectionComponent} from "./comment-section.component";

@Component({
    selector: "app-article-card",
    standalone: true,
    imports: [CommonModule, FormsModule, CommentSectionComponent],
    template: `
    <div class="border p-4 rounded shadow-sm">
      <h2 class="text-xl font-bold">{{ article.title }}</h2>
      <p class="text-gray-600">{{ article.category }}</p>
      <p class="mt-2" [innerHTML]="article.content"></p>
      <p class="text-sm text-gray-500 mt-2">Last updated: {{ article.updatedAt | date: 'medium' }}</p>
      <p class="text-sm text-gray-500 mt-2">Posted by: {{ article.author }}</p>

      <app-comment-section [articleId]="article.id"></app-comment-section>
    </div>
  `,
})
export class ArticleCardComponent {
    @Input() article!: ArticleDTO;
}

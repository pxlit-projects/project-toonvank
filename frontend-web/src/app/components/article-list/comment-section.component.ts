import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommentService } from "../../services/comment.service";
import { Comment } from "../../models/comment.model";

@Component({
    selector: "app-comment-section",
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div *ngIf="comments.length; else noComments">
      <div *ngFor="let comment of comments" class="border p-4 rounded shadow-sm">
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
          [(ngModel)]="newComment"
          placeholder="Add a comment..."
          class="flex-1 p-2 border rounded"
          (keyup.enter)="addComment()"
        />
        <button
          (click)="addComment()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  `,
})
export class CommentSectionComponent implements OnInit {
    @Input() articleId!: number;
    comments: Comment[] = [];
    newComment = '';

    constructor(private commentService: CommentService) {}

    ngOnInit() {
        this.commentService.getCommentByPostId(this.articleId).subscribe((comments) => {
            this.comments = comments;
        });
    }

    addComment() {
        if (!this.newComment.trim()) {
            return;
        }

        const comment: Comment = {
            postId: this.articleId,
            content: this.newComment,
            createdAt: new Date(),
            postedBy: localStorage.getItem("userName")!,
        };

        this.comments.push(comment);

        this.commentService.createComment(comment).subscribe(() => {
            this.newComment = '';
        });
    }
}

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommentService } from "../../services/comment.service";
import { Comment, CommentDTO } from "../../models/comment.model";

@Component({
    selector: "app-comment-section",
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div *ngIf="comments.length; else noComments">
      <div *ngFor="let comment of comments" class="border p-4 rounded shadow-sm">
        <div *ngIf="editingCommentId === comment.id; else viewMode">
          <textarea
            [(ngModel)]="editableCommentContent"
            rows="3"
            class="w-full p-2 border rounded"
          ></textarea>
          <div class="flex gap-2 mt-2">
            <button
              (click)="saveEdit(comment)"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Save
            </button>
            <button
              (click)="cancelEdit()"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        <ng-template #viewMode>
          <p>{{ comment.content }}</p>
          <p class="text-sm text-gray-500 mt-2">Posted by: {{ comment.postedBy }}</p>
          <div class="flex gap-2 mt-2">
            <button
              (click)="startEdit(comment)"
              class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Edit
            </button>
            <button
              (click)="deleteComment(comment)"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </ng-template>
      </div>
    </div>
    <ng-template #noComments>
      <p class="text-sm text-gray-500 mt-2">No comments yet.</p>
    </ng-template>

    <div *ngIf="isAllowedToAdd" class="mt-4">
      <div class="flex gap-4">
        <input
          type="text"
          [(ngModel)]="newComment"
          (ngModelChange)="onInputChange($event)"
          placeholder="Add a comment..."
          class="flex-1 p-2 border rounded"
          (keyup.enter)="addComment()"
        />
        <button *ngIf="isAllowedToPost"
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
    @Input() isAllowedToAdd: boolean = true
    @Input() isAllowedToPost: boolean = true
    @Output() commentAdded = new EventEmitter<string>();
    comments: CommentDTO[] = [];
    newComment = '';
    editingCommentId: number | null = null;
    editableCommentContent: string = '';

    constructor(private commentService: CommentService) {}

    ngOnInit() {
        this.commentService.getCommentByPostId(this.articleId).subscribe((comments) => {
            this.comments = comments;
        });
    }

    onInputChange(value: string) {
        this.commentAdded.emit(value);
    }

    addComment() {
        if (!this.newComment.trim()) {
            return;
        }

        const comment: CommentDTO = {
            id: 0,
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

    startEdit(comment: CommentDTO) {
        this.editingCommentId = comment.id;
        this.editableCommentContent = comment.content;
    }

    saveEdit(comment: Comment) {
        if (!this.editableCommentContent.trim()) {
            return;
        }

        comment.content = this.editableCommentContent;

        this.commentService.updateComment(this.editingCommentId!,this.editableCommentContent).subscribe()

        this.editingCommentId = null;
        this.editableCommentContent = '';
    }

    cancelEdit() {
        this.editingCommentId = null;
        this.editableCommentContent = '';
    }

    deleteComment(comment: CommentDTO) {
        this.comments = this.comments.filter(c => c.id !== comment.id);

        this.commentService.deleteComment(comment.id).subscribe()
    }
}

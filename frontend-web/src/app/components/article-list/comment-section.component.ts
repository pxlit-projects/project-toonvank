import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommentService } from "../../services/comment.service";
import { Comment, CommentDTO } from "../../models/comment.model";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: "app-comment-section",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
    ],
    template: `
    <div *ngIf="comments.length; else noComments" class="w-full">
      <mat-card *ngFor="let comment of comments" class="mb-4 w-full">
        <mat-card-content>
          <div *ngIf="editingCommentId === comment.id; else viewMode">
            <mat-form-field class="w-full">
              <textarea
                matInput
                [(ngModel)]="editableCommentContent"
                rows="3"
                placeholder="Edit comment"
              ></textarea>
            </mat-form-field>
            <div class="flex gap-2">
              <button
                mat-raised-button
                color="primary"
                (click)="saveEdit(comment)"
              >
                <mat-icon>save</mat-icon>
                Save
              </button>
              <button
                mat-raised-button
                (click)="cancelEdit()"
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
                mat-icon-button
                color="accent"
                (click)="startEdit(comment)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="deleteComment(comment)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
    <ng-template #noComments>
      <p class="text-sm text-gray-500 mt-2">No comments yet.</p>
    </ng-template>

    <div *ngIf="isAllowedToAdd" class="mt-4 w-full flex items-center gap-4">
      <mat-form-field class="flex-grow">
        <input
          matInput
          [(ngModel)]="newComment"
          (ngModelChange)="onInputChange($event)"
          placeholder="Add a comment..."
          (keyup.enter)="addComment()"
        />
      </mat-form-field>
      <button
        *ngIf="isAllowedToPost"
        mat-raised-button
        color="primary"
        (click)="addComment()"
        class="h-14"
      >
        Post
      </button>
    </div>
  `,
    styles: [`
    :host {
      width: 100%;
      display: block;
    }
  `]
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

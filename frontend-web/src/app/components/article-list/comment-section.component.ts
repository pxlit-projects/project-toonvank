import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    inject,
    signal,
    computed,
    effect,
    DestroyRef
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommentService } from "../../services/comment.service";
import { CommentDTO } from "../../models/comment.model";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
        @if (comments().length) {
            <div class="w-full">
                @for (comment of comments(); track comment.id) {
                    <mat-card class="mb-4 w-full">
                        <mat-card-content>
                            @if (editingCommentId() === comment.id) {
                                <mat-form-field class="w-full">
                                    <textarea
                                            matInput
                                            [ngModel]="editableCommentContent()"
                                            (ngModelChange)="editableCommentContent.set($event)"
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
                            } @else {
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
                            }
                        </mat-card-content>
                    </mat-card>
                }
            </div>
        } @else {
            @if (showNoCommentsYet) {
                <p class="text-sm text-gray-500 mt-2">No comments yet.</p>
            }
        }

        @if (isAllowedToAdd) {
            <div class="mt-4 w-full flex items-center gap-4">
                <mat-form-field class="flex-grow">
                    <input
                            matInput
                            [ngModel]="newComment()"
                            (ngModelChange)="updateNewComment($event)"
                            placeholder="Add a comment..."
                            (keyup.enter)="addComment()"
                    />
                </mat-form-field>
                @if (isAllowedToPost) {
                    <button
                            mat-raised-button
                            color="primary"
                            (click)="addComment()"
                            class="h-14"
                    >
                        Post
                    </button>
                }
            </div>
        }
    `,
    styles: [`
        :host {
            width: 100%;
            display: block;
        }
    `]
})
export class CommentSectionComponent implements OnInit {
    @Input({ required: true }) articleId!: number;
    @Input() isAllowedToAdd: boolean = true;
    @Input() isAllowedToPost: boolean = true;
    @Input() showNoCommentsYet: boolean = true;
    @Output() commentAdded = new EventEmitter<string>();

    private commentService = inject(CommentService);
    private destroyRef = inject(DestroyRef);

    comments = signal<CommentDTO[]>([]);
    newComment = signal('');
    editingCommentId = signal<number | null>(null);
    editableCommentContent = signal('');

    ngOnInit() {
        this.commentService.getCommentByPostId(this.articleId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((comments) => {
                this.comments.set(comments);
            });
    }

    updateNewComment(value: string) {
        this.newComment.set(value);
        this.commentAdded.emit(value);
    }

    addComment() {
        const commentContent = this.newComment();
        if (!commentContent.trim()) {
            return;
        }

        const comment: CommentDTO = {
            id: 0,
            postId: this.articleId,
            content: commentContent,
            createdAt: new Date(),
            postedBy: localStorage.getItem("userName")!,
        };

        this.comments.update((comments) => [...comments, comment]);

        this.commentService.createComment(comment)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.newComment.set('');
            });
    }

    startEdit(comment: CommentDTO) {
        this.editingCommentId.set(comment.id);
        this.editableCommentContent.set(comment.content);
    }

    saveEdit(comment: CommentDTO) {
        const editedContent = this.editableCommentContent();
        if (!editedContent.trim()) {
            return;
        }

        comment.content = editedContent;

        this.commentService.updateComment(this.editingCommentId()!, editedContent)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();

        this.editingCommentId.set(null);
        this.editableCommentContent.set('');
    }

    cancelEdit() {
        this.editingCommentId.set(null);
        this.editableCommentContent.set('');
    }

    deleteComment(comment: CommentDTO) {
        this.comments.update((comments) => comments.filter(c => c.id !== comment.id));

        this.commentService.deleteComment(comment.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }
}
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
    templateUrl: './comment-section.component.html',
    styleUrls: ['./comment-section.component.css']
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
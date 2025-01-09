import {Component, inject, Input} from "@angular/core";
import {ArticleDTO} from "../../models/article.model";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {RouterModule} from "@angular/router";
import {ArticleService} from "../../services/article.service";
import Swal from "sweetalert2";

@Component({
    selector: 'app-article-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
    templateUrl: './article-card.component.html',
    styleUrls: ['./article-card.component.css']
})
export class ArticleCardComponent {
    @Input() article!: ArticleDTO;
    @Input() isAllowedToEdit: boolean = true;

    private articleService = inject(ArticleService);

    isAuthor(): boolean {
        const currentUser = localStorage.getItem('userName');
        return currentUser === this.article.author;
    }

    deleteArticle(): void {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {

                this.articleService.deleteArticle(this.article.id).subscribe({
                    next: () => {
                        Swal.fire(
                            'Deleted!',
                            'Your article has been deleted.',
                            'success'
                        );
                    },
                    error: (error) => {
                        Swal.fire(
                            'Error!',
                            'Failed to delete the article.',
                            'error'
                        );
                    }
                });
            }
        });
    }
}

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
    template: `
        <mat-card class="w-full">
            <mat-card-header>
                <mat-card-title>{{ article.title }}</mat-card-title>
                <mat-card-subtitle>Category: {{ article.category }}</mat-card-subtitle>
                <div class="action-buttons">
                    <button *ngIf="isAuthor() && isAllowedToEdit"
                            mat-icon-button
                            color="primary"
                            class="edit-button"
                            [routerLink]="['/editor']"
                            [queryParams]="{ id: article.id }">
                        <mat-icon>edit</mat-icon>
                    </button>
                    <button *ngIf="isAuthor() && isAllowedToEdit"
                            mat-icon-button
                            color="warn"
                            class="delete-button"
                            (click)="deleteArticle()">
                        <mat-icon>delete</mat-icon>
                    </button>
                </div>
            </mat-card-header>
            <mat-card-content>
                <p [innerHTML]="article.content"></p>
                <p class="text-sm text-gray-500 mt-2">
                    Last updated: {{ article.updatedAt | date: 'medium' }}
                </p>
            </mat-card-content>
            <mat-card-actions class="px-4 w-full">
                <ng-content></ng-content>
            </mat-card-actions>
        </mat-card>
    `,
    styles: [`
        :host {
            display: block;
            width: 100%;
        }
        mat-card-header {
            position: relative;
            display: flex;
            align-items: center;
        }
        mat-card-actions {
            padding: 16px;
            display: flex;
            gap: 8px;
        }
        .action-buttons {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 8px;
        }
    `]
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
                this.articleService.deleteArticle(this.article.id);
                Swal.fire(
                    'Deleted!',
                    'Your article has been deleted.',
                    'success'
                );
            }
        });
    }
}

import {Component, Input} from "@angular/core";
import {ArticleDTO} from "../../models/article.model";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {RouterModule} from "@angular/router";

@Component({
    selector: 'app-article-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
    template: `
        <mat-card class="w-full">
            <mat-card-header>
                <mat-card-title>{{ article.title }}</mat-card-title>
                <mat-card-subtitle>Category: {{ article.category }}</mat-card-subtitle>
                <button *ngIf="isAuthor()&& isAllowedToEdit" 
                        mat-icon-button 
                        color="primary" 
                        class="edit-button"
                        [routerLink]="['/editor']" 
                        [queryParams]="{ id: article.id }">
                    <mat-icon>edit</mat-icon>
                </button>
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
        .edit-button {
            position: absolute;
            top: 8px;
            right: 8px;
        }
        mat-card-actions {
            padding: 16px;
            display: flex;
            gap: 8px;
        }
    `]
})
export class ArticleCardComponent {
    @Input() article!: ArticleDTO;
    @Input() isAllowedToEdit: boolean = true;

    isAuthor(): boolean {
        const currentUser = localStorage.getItem('userName');
        return currentUser === this.article.author;
    }
}

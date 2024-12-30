import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleDTO } from '../../models/article.model';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-article-card',
    standalone: true,
    imports: [CommonModule, MatCardModule],
    template: `
        <mat-card class="w-full">
            <mat-card-header>
                <mat-card-title>{{ article.title }}</mat-card-title>
                <mat-card-subtitle>Category: {{ article.category }}</mat-card-subtitle>
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
        mat-card-actions {
            padding: 16px;
        }
    `]
})
export class ArticleCardComponent {
    @Input() article!: ArticleDTO;
}
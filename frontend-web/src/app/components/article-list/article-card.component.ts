import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleDTO } from '../../models/article.model';

@Component({
    selector: 'app-article-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="border p-4 rounded shadow-sm">
            <h3 class="text-xl font-bold">{{ article.title }}</h3>
            <p class="text-gray-600">Category: {{ article.category }}</p>
            <p class="mt-2" [innerHTML]="article.content"></p>
            <p class="text-sm text-gray-500 mt-2">
                Last updated: {{ article.updatedAt | date: 'medium' }}
            </p>

            <ng-content></ng-content>
        </div>
    `
})
export class ArticleCardComponent {
    @Input() article!: ArticleDTO;
}

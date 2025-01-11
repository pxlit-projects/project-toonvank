import {
    Component,
    signal,
    computed,
    effect,
    inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleDTO } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { ArticleCardComponent } from './article-card.component';
import { CommentSectionComponent } from './comment-section.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-article-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ArticleCardComponent,
        CommentSectionComponent,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatButtonModule
    ],
    templateUrl: './article-list.component.html',
    styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent {
    private articleService = inject(ArticleService);

    articles = signal<ArticleDTO[]>([]);
    searchTerm = signal('');
    selectedCategory = signal('');
    startDate = signal<Date | null>(null);
    endDate = signal<Date | null>(null);
    selectedAuthor = signal('');

    uniqueAuthors = computed(() =>
        [...new Set(this.articles().map((article) => article.author))]
    );

    hasActiveFilters = computed(() => {
        return this.searchTerm() !== '' ||
            this.selectedCategory() !== '' ||
            this.selectedAuthor() !== '' ||
            this.startDate() !== null ||
            this.endDate() !== null;
    });

    filteredArticles = computed(() => {
        return this.articles().filter((article) => {
            const isPublished = article.status === 'PUBLISHED';

            const matchesSearch =
                !this.searchTerm() ||
                article.title.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                article.content.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                article.author.toLowerCase().includes(this.searchTerm().toLowerCase());

            const matchesCategory =
                !this.selectedCategory() || article.category === this.selectedCategory();

            const articleDate = new Date(article.updatedAt);
            articleDate.setHours(0, 0, 0, 0);

            const startDate = this.startDate();
            const endDate = this.endDate();

            const adjustedEndDate = endDate ? new Date(endDate.getTime() + 24 * 60 * 60 * 1000) : null;

            const matchesDate =
                (!startDate || articleDate.getTime() >= startDate.getTime()) &&
                (!endDate || articleDate.getTime() < adjustedEndDate!.getTime());

            const matchesAuthor =
                !this.selectedAuthor() || article.author === this.selectedAuthor();

            return isPublished && matchesSearch && matchesCategory && matchesDate && matchesAuthor;
        });
    });

    constructor() {
        effect(() => {
            const articles = this.articleService.getArticles();
            this.articles.set(articles);
        });
    }

    setStartDate(date: Date | null) {
        if (date) {
            const normalized = new Date(date);
            normalized.setHours(0, 0, 0, 0);
            this.startDate.set(normalized);
        } else {
            this.startDate.set(null);
        }
    }

    setEndDate(date: Date | null) {
        if (date) {
            const normalized = new Date(date);
            normalized.setHours(0, 0, 0, 0);
            this.endDate.set(normalized);
        } else {
            this.endDate.set(null);
        }
    }

    clearFilters() {
        this.searchTerm.set('');
        this.selectedCategory.set('');
        this.selectedAuthor.set('');
        this.startDate.set(null);
        this.endDate.set(null);
    }
}
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideRouter, RouterModule, RouterOutlet, Routes } from '@angular/router';
import { ArticleListComponent } from './app/components/article-list/article-list.component';
import { ArticleEditorComponent } from './app/components/article-editor/article-editor.component';
import { ReviewQueueComponent } from './app/components/review-queue/review-queue.component';
import { DraftsComponent } from './app/components/drafts/drafts.component';

const routes: Routes = [
  { path: '', component: ArticleListComponent },
  { path: 'editor', component: ArticleEditorComponent },
  { path: 'review', component: ReviewQueueComponent },
  { path: 'drafts', component: DraftsComponent }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <nav class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex gap-4">
        <a routerLink="/" class="hover:text-gray-300">Articles</a>
        <a routerLink="/editor" class="hover:text-gray-300">New Article</a>
        <a routerLink="/drafts" class="hover:text-gray-300">My Drafts</a>
        <a routerLink="/review" class="hover:text-gray-300">Review Queue</a>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `
})
export class App {
  name = 'News Management System';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
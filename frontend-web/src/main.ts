import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideRouter, RouterModule, RouterOutlet, Routes } from '@angular/router';
import { AuthenticationService } from './app/services/authentication/auth.service';
import { UserRole } from './app/services/authentication/user-roles.enum';
import {ArticleListComponent} from "./app/components/article-list/article-list.component";
import {ArticleEditorComponent} from "./app/components/article-editor/article-editor.component";
import {ReviewQueueComponent} from "./app/components/review-queue/review-queue.component";
import {DraftsComponent} from "./app/components/drafts/drafts.component";
import {LoginComponent} from "./app/components/login/login.component";

const routes: Routes = [
  { path: 'articles', component: ArticleListComponent, canActivate: [() => inject(AuthenticationService).hasRole(UserRole.Hoofdredacteur)] },
  { path: 'editor', component: ArticleEditorComponent, canActivate: [() => inject(AuthenticationService).hasRole(UserRole.Redacteur)] },
  { path: 'review', component: ReviewQueueComponent, canActivate: [() => inject(AuthenticationService).hasRole(UserRole.Gebruiker)] },
  { path: 'drafts', component: DraftsComponent, canActivate: [() => inject(AuthenticationService).hasRole(UserRole.Redacteur)] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/login' }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <nav class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex gap-4">
        <a routerLink="/articles" class="hover:text-gray-300">Articles</a>
        <a routerLink="/editor" class="hover:text-gray-300">New Article</a>
        <a routerLink="/drafts" class="hover:text-gray-300">My Drafts</a>
        <a routerLink="/review" class="hover:text-gray-300">Review Queue</a>

        <div class="ml-auto flex items-center gap-4">
          <a *ngIf="!userRole" routerLink="/login" class="hover:text-gray-300">Login</a>
          <a *ngIf="userRole" (click)="logout()" class="hover:text-gray-300">Logout</a>
          <span class="text-sm">({{ userRole }})</span>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `
})
export class App {
  constructor(private authService: AuthenticationService) {}

  get userRole() {
    return this.authService.getUserRole();
  }

  logout() {
    this.authService.logout();
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    AuthenticationService
  ]
}).catch(err => console.error(err));

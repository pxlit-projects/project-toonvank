import {Component, inject} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {provideRouter, Router, RouterModule, RouterOutlet, Routes} from '@angular/router';
import {ArticleListComponent} from './app/components/article-list/article-list.component';
import {ArticleEditorComponent} from './app/components/article-editor/article-editor.component';
import {ReviewQueueComponent} from './app/components/review-queue/review-queue.component';
import {DraftsComponent} from './app/components/drafts/drafts.component';
import {provideHttpClient} from '@angular/common/http';
import {LoginComponent} from './app/components/login/login.component';
import {UserRole} from './app/services/authentication/user-roles.enum';
import {AuthenticationService} from "./app/services/authentication/auth.service";

const roleGuard = (requiredRoles: UserRole[]) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (requiredRoles.some(role => authService.hasRole(role))) {
    return true;
  } else {
    if (requiredRoles.some(role => authService.hasRole(UserRole.Gebruiker))){
      router.navigate(['/articles']);
    }
    else{
      router.navigate(['/login']);
    }
    return false;
  }
};

const routes: Routes = [
  { path: 'articles', component: ArticleListComponent, canActivate: [() => roleGuard([UserRole.Hoofdredacteur, UserRole.Redacteur, UserRole.Gebruiker])] },
  { path: 'editor', component: ArticleEditorComponent, canActivate: [() => roleGuard([UserRole.Hoofdredacteur, UserRole.Redacteur])] },
  { path: 'review', component: ReviewQueueComponent, canActivate: [() => roleGuard([UserRole.Hoofdredacteur])] },
  { path: 'drafts', component: DraftsComponent, canActivate: [() => roleGuard([UserRole.Redacteur, UserRole.Hoofdredacteur])] },
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
        @if (isHoofdredacteur() || isRedacteur()) {
          <a routerLink="/editor" class="hover:text-gray-300">New Article</a>
          <a routerLink="/drafts" class="hover:text-gray-300">My Drafts</a>
        }
        @if (isHoofdredacteur()) {
          <a routerLink="/review" class="hover:text-gray-300">Review Queue</a>
        }

        <div class="ml-auto flex items-center gap-4">
          <a *ngIf="!userRole" routerLink="/login" class="hover:text-gray-300">Login</a>
          <a *ngIf="userRole" (click)="logout()" class="hover:text-gray-300">Logout</a>
          <span class="text-sm">({{ userRole?.toString() }})</span>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `
})
export class App {
  name = 'News Management System';

  constructor(private authService: AuthenticationService) {}

  get userRole() {
    return this.authService.getUserRole();
  }

  isGebruiker() {
    return this.authService.hasRole(UserRole.Gebruiker);
  }

  isRedacteur() {
    return this.authService.hasRole(UserRole.Redacteur);
  }

  isHoofdredacteur() {
    return this.authService.hasRole(UserRole.Hoofdredacteur);
  }

  logout() {
    this.authService.logout();
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    AuthenticationService
  ]
}).catch(err => console.error(err));

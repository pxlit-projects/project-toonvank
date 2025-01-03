import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideRouter, Router, RouterModule, RouterOutlet, Routes } from '@angular/router';
import { ArticleListComponent } from './app/components/article-list/article-list.component';
import { ArticleEditorComponent } from './app/components/article-editor/article-editor.component';
import { ReviewQueueComponent } from './app/components/review-queue/review-queue.component';
import { DraftsComponent } from './app/components/drafts/drafts.component';
import { provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './app/components/login/login.component';
import { UserRole } from './app/services/authentication/user-roles.enum';
import { AuthenticationService } from "./app/services/authentication/auth.service";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

const roleGuard = (requiredRoles: UserRole[]) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (requiredRoles.some(role => authService.hasRole(role))) {
    return true;
  } else {
    if (requiredRoles.some(role => authService.hasRole(UserRole.Gebruiker))){
      router.navigate(['/articles']);
    } else {
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
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  standalone: true,
  template: `
    <mat-toolbar color="primary">
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex gap-4">
          <a mat-button routerLink="/articles">
            <mat-icon>article</mat-icon>
            Articles
          </a>
          @if (isHoofdredacteur() || isRedacteur()) {
            <a mat-button routerLink="/editor">
              <mat-icon>edit</mat-icon>
              New Article
            </a>
            <a mat-button routerLink="/drafts">
              <mat-icon>drafts</mat-icon>
              My Drafts
            </a>
          }
          @if (isHoofdredacteur()) {
            <a mat-button routerLink="/review">
              <mat-icon>rate_review</mat-icon>
              Review Queue
            </a>
          }
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm">{{ userRole?.toString() }}</span>
          
          @if (!userRole) {
            <a mat-button routerLink="/login">
              <mat-icon>login</mat-icon>
              Login
            </a>
          } @else {
            <button mat-icon-button routerLink="/login" title="Switch User">
              <mat-icon>switch_account</mat-icon>
            </button>
            <button mat-button (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          }
        </div>
      </div>
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .container {
      width: 100%;
    }
  `]
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
    AuthenticationService,
    provideAnimationsAsync()
  ]
}).catch(err => console.error(err));
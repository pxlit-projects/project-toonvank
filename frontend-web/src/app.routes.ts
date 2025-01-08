import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleListComponent } from './app/components/article-list/article-list.component';
import { ArticleEditorComponent } from './app/components/article-editor/article-editor.component';
import { ReviewQueueComponent } from './app/components/review-queue/review-queue.component';
import { DraftsComponent } from './app/components/drafts/drafts.component';
import { LoginComponent } from './app/components/login/login.component';
import { UserRole } from './app/services/authentication/user-roles.enum';
import { AuthenticationService } from "./app/services/authentication/auth.service";

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

export const routes: Routes = [
    {
        path: 'articles',
        component: ArticleListComponent,
        canActivate: [() => roleGuard([UserRole.Redacteur, UserRole.Gebruiker])]
    },
    {
        path: 'editor',
        component: ArticleEditorComponent,
        canActivate: [() => roleGuard([UserRole.Redacteur])]
    },
    {
        path: 'review',
        component: ReviewQueueComponent,
        canActivate: [() => roleGuard([UserRole.Redacteur])]
    },
    {
        path: 'drafts',
        component: DraftsComponent,
        canActivate: [() => roleGuard([UserRole.Redacteur])]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { UserRole } from './app/services/authentication/user-roles.enum';
import { AuthenticationService } from "./app/services/authentication/auth.service";

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
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    name = 'News Management System';
    private authService = inject(AuthenticationService);
    private userRoleSignal = signal<UserRole | null>(null);

    constructor() {
        this.userRoleSignal.set(this.authService.getUserRole());
    }

    get userRole() {
        return this.userRoleSignal();
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
        this.userRoleSignal.set(null);
    }
}
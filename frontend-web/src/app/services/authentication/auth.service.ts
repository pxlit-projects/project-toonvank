import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {UserRole} from "./user-roles.enum";

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    constructor(private router: Router) {}

    getUserRole(): UserRole | null {
        return localStorage.getItem('userRole') as UserRole || null;
    }

    hasRole(requiredRole: UserRole): boolean {
        return this.getUserRole() === requiredRole;
    }

    logout(): void {
        localStorage.clear();
        this.router.navigate(['/login']);
    }
}

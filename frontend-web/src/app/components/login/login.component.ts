import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { UserRole } from "../../services/authentication/user-roles.enum";
import { CommonModule } from "@angular/common";
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'login',
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule
    ],
    standalone: true,
    template: `
        <div class="min-h-screen bg-gray-100 flex items-center justify-center">
            <mat-card class="p-8 w-96">
                <mat-card-header>
                    <mat-card-title class="text-2xl font-bold mb-6 text-center">Login</mat-card-title>
                </mat-card-header>

                <mat-card-content>
                    <form (ngSubmit)="login()" #loginForm="ngForm" class="space-y-6">
                        <mat-form-field class="w-full">
                            <mat-label>Naam</mat-label>
                            <input
                                matInput
                                type="text"
                                id="name"
                                name="name"
                                [(ngModel)]="userName"
                                required
                                placeholder="Voer uw naam in"
                            />
                        </mat-form-field>

                        <mat-form-field class="w-full">
                            <mat-label>Selecteer uw rol</mat-label>
                            <mat-select
                                id="role"
                                name="role"
                                [(ngModel)]="selectedRole"
                                required
                            >
                                <mat-option [value]="null" disabled>Kies een rol...</mat-option>
                                <mat-option [value]="UserRole.Gebruiker">Gebruiker</mat-option>
                                <mat-option [value]="UserRole.Redacteur">Redacteur</mat-option>
                                <mat-option [value]="UserRole.Hoofdredacteur">Hoofdredacteur</mat-option>
                            </mat-select>
                        </mat-form-field>

                        <button
                            mat-raised-button
                            color="primary"
                            type="submit"
                            [disabled]="!loginForm.form.valid"
                            class="w-full"
                        >
                            Log in
                        </button>
                    </form>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            height: 100vh;
        }
        mat-form-field {
            width: 100%;
        }
    `]
})
export class LoginComponent {
    roleOptions = Object.values(UserRole);
    selectedRole: UserRole;
    userName: string;

    constructor(private router: Router) {
        const savedRole = localStorage.getItem('userRole') as UserRole;
        const savedName = localStorage.getItem('userName');

        this.selectedRole = savedRole || UserRole.Gebruiker;
        this.userName = savedName || '';
    }

    login() {
        localStorage.setItem('userRole', this.selectedRole);
        localStorage.setItem('userName', this.userName);
        this.router.navigate(['/articles']);
    }

    protected readonly UserRole = UserRole;
}
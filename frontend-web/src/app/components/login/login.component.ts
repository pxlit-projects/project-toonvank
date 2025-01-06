import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from "@angular/forms";
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
        ReactiveFormsModule,
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
                    <form [formGroup]="loginForm" (ngSubmit)="login()" class="space-y-6">
                        <mat-form-field class="w-full">
                            <mat-label>Naam</mat-label>
                            <input
                                    matInput
                                    type="text"
                                    id="name"
                                    formControlName="userName"
                                    required
                                    placeholder="Voer uw naam in"
                            />
                            @if (loginForm.get('userName')?.invalid && loginForm.get('userName')?.touched) {
                                <mat-error>Naam is verplicht</mat-error>
                            }
                        </mat-form-field>

                        <mat-form-field class="w-full">
                            <mat-label>Selecteer uw rol</mat-label>
                            <mat-select
                                    id="role"
                                    formControlName="selectedRole"
                                    required
                            >
                                <mat-option [value]="null" disabled>Kies een rol...</mat-option>
                                @for (role of roleOptions; track role) {
                                    <mat-option [value]="role">{{ role }}</mat-option>
                                }
                            </mat-select>
                            @if (loginForm.get('selectedRole')?.invalid && loginForm.get('selectedRole')?.touched) {
                                <mat-error>Rol is verplicht</mat-error>
                            }
                        </mat-form-field>

                        <button
                                mat-raised-button
                                color="primary"
                                type="submit"
                                [disabled]="loginForm.invalid"
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
export class LoginComponent implements OnInit {
    roleOptions = Object.values(UserRole);
    loginForm!: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router
    ) {}

    ngOnInit() {
        const savedRole = localStorage.getItem('userRole') as UserRole;
        const savedName = localStorage.getItem('userName');

        this.loginForm = this.formBuilder.group({
            userName: [savedName || '', Validators.required],
            selectedRole: [savedRole || UserRole.Gebruiker, Validators.required]
        });
    }

    login() {
        if (this.loginForm.invalid) return;

        const { userName, selectedRole } = this.loginForm.value;

        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('userName', userName);

        this.router.navigate(['/articles']);
    }

    protected readonly UserRole = UserRole;
}
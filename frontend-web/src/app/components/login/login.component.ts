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
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
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
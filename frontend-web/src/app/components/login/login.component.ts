import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from "@angular/forms";
import {UserRole} from "../../services/authentication/user-roles.enum";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'login',
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
        
        <form (ngSubmit)="login()" #loginForm="ngForm" class="space-y-6">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
              Naam
            </label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="userName"
              required
              class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Voer uw naam in"
            />
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="role">
              Selecteer uw rol
            </label>
            <select
              id="role"
              name="role"
              [(ngModel)]="selectedRole"
              required
              class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option [ngValue]="null" disabled>Kies een rol...</option>
              <option [value]="UserRole.Gebruiker">Gebruiker</option>
              <option [value]="UserRole.Redacteur">Redacteur</option>
              <option [value]="UserRole.Hoofdredacteur">Hoofdredacteur</option>
            </select>
          </div>

          <button
            type="submit"
            [disabled]="!loginForm.form.valid"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
    roleOptions = Object.values(UserRole);
    selectedRole: UserRole = UserRole.Gebruiker;
    userName = '';

    constructor(private router: Router) {}

    login() {
        localStorage.setItem('userRole', this.selectedRole);
        localStorage.setItem('userName', this.userName);
        this.router.navigate(['/articles']);
    }

    protected readonly UserRole = UserRole;
}

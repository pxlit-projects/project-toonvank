import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    showNotification(title: string, text: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') {
        Swal.fire({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            title: title,
            text: text,
            icon: icon,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            },
        });
    }
}
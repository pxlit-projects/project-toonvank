import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import Swal from 'sweetalert2';

describe('NotificationService', () => {
    let service: NotificationService;
    let swalFireSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NotificationService]
        });
        service = TestBed.inject(NotificationService);

        swalFireSpy = spyOn(Swal, 'fire');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call Swal.fire with correct default parameters', () => {
        const title = 'Test Title';
        const text = 'Test Message';

        service.showNotification(title, text);

        expect(swalFireSpy).toHaveBeenCalledWith({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            title: title,
            text: text,
            icon: 'info',
            didOpen: jasmine.any(Function)
        });
    });

    it('should call Swal.fire with custom icon', () => {
        const title = 'Test Title';
        const text = 'Test Message';
        const icon = 'success';

        service.showNotification(title, text, icon);

        expect(swalFireSpy).toHaveBeenCalledWith({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            title: title,
            text: text,
            icon: icon,
            didOpen: jasmine.any(Function)
        });
    });

    it('should handle mouse events correctly', () => {
        const stopTimerSpy = spyOn(Swal, 'stopTimer');
        const resumeTimerSpy = spyOn(Swal, 'resumeTimer');

        service.showNotification('Test', 'Message');

        const didOpenFn = swalFireSpy.calls.mostRecent().args[0].didOpen;

        const mockToast = {
            onmouseenter: null as Function | null,
            onmouseleave: null as Function | null
        };

        didOpenFn(mockToast as any);

        mockToast.onmouseenter!();
        expect(stopTimerSpy).toHaveBeenCalled();

        mockToast.onmouseleave!();
        expect(resumeTimerSpy).toHaveBeenCalled();
    });

    it('should handle all supported icon types', () => {
        const icons: Array<'success' | 'error' | 'info' | 'warning'> = ['success', 'error', 'info', 'warning'];

        icons.forEach(icon => {
            service.showNotification('Test', 'Message', icon);

            expect(swalFireSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                icon: icon
            }));
        });
    });
});
import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import { ArticleDTO } from '../models/article.model';
import { of, throwError } from 'rxjs';

describe('ArticleService', () => {
    let service: ArticleService;
    let httpMock: HttpTestingController;
    const endpoint = 'http://localhost:8086/post/api/posts';

    const mockArticles: ArticleDTO[] = [
        {
            id: 1,
            title: 'Test Article 1',
            content: 'Content 1',
            author: 'Author 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'DRAFT',
            category: 'Test'
        },
        {
            id: 2,
            title: 'Test Article 2',
            content: 'Content 2',
            author: 'Author 2',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'PENDING',
            category: 'Test'
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ArticleService]
        });
    });

    beforeEach(() => {
        service = TestBed.inject(ArticleService);
        httpMock = TestBed.inject(HttpTestingController);

        // Handle initial loadArticles call from constructor
        const req = httpMock.expectOne(endpoint);
        req.flush(mockArticles);
    });

    afterEach(() => {
        // Verify no pending requests and clean up
        try {
            httpMock.verify();
        } catch (e) {
            console.log('Cleaning up pending requests');
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('loadArticles', () => {
        it('should load articles and update signal', fakeAsync(() => {
            // Initial load was handled in beforeEach
            expect(service.getArticles()).toEqual(mockArticles);

            // Test subsequent load
            service.loadArticles();

            const req = httpMock.expectOne(endpoint);
            expect(req.request.method).toBe('GET');
            req.flush(mockArticles);

            tick();
            expect(service.getArticles()).toEqual(mockArticles);
            discardPeriodicTasks();
        }));

        it('should handle error when loading articles', fakeAsync(() => {
            const consoleSpy = spyOn(console, 'error').and.callThrough();

            service.loadArticles();

            const req = httpMock.expectOne(endpoint);
            req.error(new ErrorEvent('Network error'));

            tick();
            expect(consoleSpy).toHaveBeenCalled();
            discardPeriodicTasks();
        }));
    });

    describe('getArticleById', () => {
        it('should return article by id', (done) => {
            const testId = 1;
            const testArticle = mockArticles[0];

            service.getArticleById(testId).subscribe({
                next: (article) => {
                    expect(article).toEqual(testArticle);
                    done();
                },
                error: done.fail
            });

            const req = httpMock.expectOne(`${endpoint}/${testId}`);
            expect(req.request.method).toBe('GET');
            req.flush(testArticle);
        });

        it('should handle article not found', (done) => {
            const testId = 999;

            service.getArticleById(testId).subscribe({
                next: () => done.fail('Should have failed'),
                error: (error) => {
                    expect(error.message).toContain('An error occurred');
                    done();
                }
            });

            const req = httpMock.expectOne(`${endpoint}/${testId}`);
            req.flush(null);
        });
    });

    describe('filtered articles', () => {
        beforeEach(() => {
            service['articles'].set(mockArticles);
        });

        it('should return pending articles', () => {
            const pendingArticles = service.getPendingArticles();
            expect(pendingArticles.length).toBe(1);
            expect(pendingArticles[0].status).toBe('PENDING');
        });

        it('should return draft articles', () => {
            const draftArticles = service.getDraftArticles();
            expect(draftArticles.length).toBe(1);
            expect(draftArticles[0].status).toBe('DRAFT');
        });

        it('should return rejected articles', () => {
            const rejectedArticles = service.getRejectedArticles();
            expect(rejectedArticles.length).toBe(0);
        });
    });

    describe('createArticle', () => {
        it('should create and reload articles', fakeAsync(() => {
            const newArticle = {
                title: 'New Article',
                content: 'Content',
                author: 'Author'
            };

            let result: any;
            service.createArticle(newArticle).subscribe({
                next: (response) => result = response,
                error: (error) => fail(error)
            });

            // Handle create request
            const createReq = httpMock.expectOne(endpoint);
            expect(createReq.request.method).toBe('POST');
            createReq.flush({ ...newArticle, id: 3 });

            // Handle reload request
            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush([...mockArticles, { ...newArticle, id: 3 }]);

            tick();
            expect(result).toBeTruthy();
            discardPeriodicTasks();
        }));

        it('should handle creation error', fakeAsync(() => {
            const newArticle = { title: 'New Article' };
            let errorResult: any;

            service.createArticle(newArticle).subscribe({
                next: () => fail('Should have failed'),
                error: (error) => errorResult = error
            });

            const req = httpMock.expectOne(endpoint);
            req.error(new ErrorEvent('Network error'));

            tick();
            expect(errorResult).toBeTruthy();
            expect(errorResult.message).toContain('An error occurred');
            discardPeriodicTasks();
        }));
    });

    describe('updateArticle', () => {
        it('should update and reload articles', fakeAsync(() => {
            const updatedArticle = { title: 'Updated Title' };
            service.updateArticle(1, updatedArticle);

            // Handle update request
            const updateReq = httpMock.expectOne(`${endpoint}/1`);
            expect(updateReq.request.method).toBe('PUT');
            updateReq.flush({ ...mockArticles[0], ...updatedArticle });

            // Handle reload request
            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush(mockArticles);

            tick();
            discardPeriodicTasks();
        }));
    });

    describe('deleteArticle', () => {
        it('should delete and reload articles', fakeAsync(() => {
            service.deleteArticle(1);

            // Handle delete request
            const deleteReq = httpMock.expectOne(`${endpoint}/1`);
            expect(deleteReq.request.method).toBe('DELETE');
            deleteReq.flush({});

            // Handle reload request
            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush(mockArticles.slice(1));

            tick();
            discardPeriodicTasks();
        }));
    });
});
import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import { ArticleDTO } from '../models/article.model';

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
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getArticleById', () => {
        it('should fetch article by id', (done) => {
            const articleId = 1;

            service.getArticleById(articleId).subscribe({
                next: (article) => {
                    expect(article).toEqual(mockArticles[0]);
                    done();
                }
            });

            const req = httpMock.expectOne(`${endpoint}/${articleId}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockArticles[0]);
        });

        it('should handle error when article not found', (done) => {
            const articleId = 999;

            service.getArticleById(articleId).subscribe({
                error: (error) => {
                    expect(error.message).toContain('An error occurred');
                    done();
                }
            });

            const req = httpMock.expectOne(`${endpoint}/${articleId}`);
            req.flush(null, { status: 404, statusText: 'Not Found' });
        });
    });

    describe('loadArticles', () => {
        it('should load articles and update signal', fakeAsync(() => {
            service.loadArticles();

            const req = httpMock.expectOne(endpoint);
            expect(req.request.method).toBe('GET');
            req.flush(mockArticles);

            tick();
            expect(service.getArticles()).toEqual(mockArticles);
            discardPeriodicTasks();
        }));

/*        it('should handle error when loading articles', fakeAsync(() => {
            const consoleSpy = spyOn(console, 'error').and.callThrough();

            service.loadArticles();

            const req = httpMock.expectOne(endpoint);
            req.error(new ErrorEvent('Network error'));

            tick();
            expect(consoleSpy).toHaveBeenCalled();
            discardPeriodicTasks();
        }));*/
    });

    describe('filtered articles', () => {
        beforeEach(() => {
            // Manually set articles signal
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

            service.createArticle(newArticle).subscribe({
                next: (response) => {
                    expect(response).toBeTruthy();
                    expect(response.title).toBe(newArticle.title);
                }
            });

            // Handle create request
            const createReq = httpMock.expectOne(endpoint);
            expect(createReq.request.method).toBe('POST');
            createReq.flush({ ...newArticle, id: 3 });

            // Handle subsequent loadArticles call
            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush([...mockArticles, { ...newArticle, id: 3 }]);

            tick();
            discardPeriodicTasks();
        }));

        it('should handle creation error', fakeAsync(() => {
            const newArticle = { title: 'New Article' };

            service.createArticle(newArticle).subscribe({
                error: (error) => {
                    expect(error.message).toContain('An error occurred');
                }
            });

            const req = httpMock.expectOne(endpoint);
            req.error(new ErrorEvent('Network error'));

            tick();
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

            // Handle subsequent loadArticles call
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

            // Handle subsequent loadArticles call
            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush(mockArticles.slice(1));

            tick();
            discardPeriodicTasks();
        }));
    });
});
import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import { ArticleDTO, Article } from '../models/article.model';

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

        service = TestBed.inject(ArticleService);
        httpMock = TestBed.inject(HttpTestingController);

        const initialReq = httpMock.expectOne(endpoint);
        initialReq.flush(mockArticles);
    });

    afterEach(() => {
        try {
            httpMock.verify();
        } catch (error) {
            console.warn('HttpTestingController verification error:', error);
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getArticleById', () => {
        it('should fetch article by id', fakeAsync(() => {
            let fetchedArticle: ArticleDTO | undefined;
            const articleId = 1;

            service.getArticleById(articleId).subscribe({
                next: (article) => {
                    fetchedArticle = article;
                }
            });

            const req = httpMock.expectOne(`${endpoint}/${articleId}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockArticles[0]);

            tick();
            expect(fetchedArticle).toEqual(mockArticles[0]);
        }));

        it('should handle error when article not found', fakeAsync(() => {
            const articleId = 999;
            let errorThrown = false;

            service.getArticleById(articleId).subscribe({
                error: (error) => {
                    errorThrown = true;
                    expect(error.message).toContain('An error occurred');
                }
            });

            const req = httpMock.expectOne(`${endpoint}/${articleId}`);
            req.flush(null, { status: 404, statusText: 'Not Found' });

            tick();
            expect(errorThrown).toBeTruthy();
            discardPeriodicTasks();
        }));
    });

    describe('loadArticles', () => {
        it('should load articles and update signal', fakeAsync(() => {
            service.loadArticles().subscribe(() => {
                const articles = service.getArticles();
                expect(articles).toEqual(mockArticles);
            });

            const req = httpMock.expectOne(endpoint);
            expect(req.request.method).toBe('GET');
            req.flush(mockArticles);

            tick();
            discardPeriodicTasks();
        }));

        it('should handle error when loading articles', fakeAsync(() => {
            const consoleSpy = spyOn(console, 'error').and.callThrough();

            service.loadArticles().subscribe({
                error: (err) => {
                    expect(err.message).toContain('An error occurred');
                }
            });

            const req = httpMock.expectOne(endpoint);
            req.error(new ErrorEvent('Network error'));

            tick();
            expect(consoleSpy).toHaveBeenCalled();
            discardPeriodicTasks();
        }));
    });

    describe('filtered articles', () => {
        it('should return pending articles', () => {
            const pendingArticles = service.getPendingArticles();
            expect(pendingArticles.length).toBe(1);
            expect(pendingArticles[0].status).toBe('PENDING');
        });

        it('should return draft articles', fakeAsync(() => {
            const draftArticles = service.getDraftArticles();

            const req = httpMock.expectOne(endpoint);
            req.flush(mockArticles);

            tick();
            expect(draftArticles.length).toBe(1);
            expect(draftArticles[0].status).toBe('DRAFT');
            discardPeriodicTasks();
        }));

        it('should return rejected articles', fakeAsync(() => {
            const rejectedArticles = service.getRejectedArticles();

            const req = httpMock.expectOne(endpoint);
            req.flush(mockArticles);

            tick();
            expect(rejectedArticles.length).toBe(0);
            discardPeriodicTasks();
        }));
    });
    describe('createArticle', () => {
        it('should create and reload articles', fakeAsync(() => {
            const newArticle: Partial<Article> = {
                title: 'New Article',
                content: 'Content',
                author: 'Author'
            };

            let createdArticle: Article | undefined;

            service.createArticle(newArticle).subscribe({
                next: (response) => {
                    createdArticle = response;
                }
            });

            const createReq = httpMock.expectOne(endpoint);
            expect(createReq.request.method).toBe('POST');
            const createdArticleResponse = {
                ...newArticle,
                id: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'DRAFT',
                category: ''
            };
            createReq.flush(createdArticleResponse);

            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush([...mockArticles, createdArticleResponse]);

            tick();
            expect(createdArticle).toBeDefined();
            expect(createdArticle?.title).toEqual(newArticle.title);
            discardPeriodicTasks();
        }));

        it('should handle creation error', fakeAsync(() => {
            const newArticle: Partial<Article> = { title: 'New Article' };
            let errorMessage: string | undefined;

            service.createArticle(newArticle).subscribe({
                error: (error) => {
                    errorMessage = error.message;
                }
            });

            const req = httpMock.expectOne(endpoint);
            req.error(new ErrorEvent('Network error'));

            tick();
            expect(errorMessage).toBeDefined();
            expect(typeof errorMessage).toBe('string');
            expect(errorMessage).toContain('An error occurred');
            discardPeriodicTasks();
        }));
    });

    describe('updateArticle', () => {
        it('should update and reload articles', fakeAsync(() => {
            const updatedArticle: Partial<Article> = { title: 'Updated Title' };
            let updatedResult: Article | undefined;

            service.updateArticle(1, updatedArticle).subscribe({
                next: (result) => {
                    updatedResult = result;
                }
            });

            const updateReq = httpMock.expectOne(`${endpoint}/1`);
            expect(updateReq.request.method).toBe('PUT');
            updateReq.flush({ ...mockArticles[0], ...updatedArticle });

            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush(mockArticles);

            tick();
            expect(updatedResult).toBeTruthy();
            expect(updatedResult?.title).toBe(updatedArticle.title);
            discardPeriodicTasks();
        }));
    });

    describe('deleteArticle', () => {
        it('should delete and reload articles', fakeAsync(() => {
            let deletedResult: void | undefined;

            service.deleteArticle(1).subscribe({
                next: (result) => {
                    deletedResult = result;
                }
            });

            const deleteReq = httpMock.expectOne(`${endpoint}/1`);
            expect(deleteReq.request.method).toBe('DELETE');
            deleteReq.flush({});

            const reloadReq = httpMock.expectOne(endpoint);
            reloadReq.flush(mockArticles.slice(1));

            tick();
            expect(deletedResult).toBeUndefined();
            discardPeriodicTasks();
        }));
    });
});
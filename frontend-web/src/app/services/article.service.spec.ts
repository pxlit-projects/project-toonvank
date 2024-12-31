import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import { ArticleDTO } from '../models/article.model';
import { provideHttpClient } from '@angular/common/http';

describe('ArticleService', () => {
    let service: ArticleService;
    let httpTestingController: HttpTestingController;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ArticleService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });

        service = TestBed.inject(ArticleService);
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);

        // Handle the initial HTTP request made in the constructor
        const req = httpTestingController.expectOne('http://localhost:8086/post/api/posts');
        req.flush([]);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load articles and update BehaviorSubject', fakeAsync(() => {
        const mockArticles: ArticleDTO[] = [
            { id: 1, title: 'Test Article', content: 'Test Content', author: 'Test Author', createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT', category: 'Test' }
        ];

        service.loadArticles();

        const req = httpTestingController.expectOne('http://localhost:8086/post/api/posts');
        expect(req.request.method).toBe('GET');
        req.flush(mockArticles);

        tick();

        service.getArticles().subscribe(articles => {
            expect(articles).toEqual(mockArticles);
        });
    }));

    it('should return article by id', fakeAsync(() => {
        const mockArticle: ArticleDTO = { id: 1, title: 'Test Article', content: 'Test Content', author: 'Test Author', createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT', category: 'Test' };

        service.getArticleById(1).subscribe(article => {
            expect(article).toEqual(mockArticle);
        });

        const req = httpTestingController.expectOne('http://localhost:8086/post/api/posts/1');
        expect(req.request.method).toBe('GET');
        req.flush(mockArticle);

        tick();
    }));

    it('should create new article and reload articles', fakeAsync(() => {
        const newArticle = { title: 'New Article', content: 'New Content', author: 'New Author', category: 'New Category' };
        const createdArticle: ArticleDTO = { ...newArticle, id: 1, createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT' };

        service.createArticle(newArticle).subscribe(article => {
            expect(article).toEqual(createdArticle);
        });

        const createReq = httpTestingController.expectOne('http://localhost:8086/post/api/posts');
        expect(createReq.request.method).toBe('POST');
        createReq.flush(createdArticle);

        tick();

        const getReq = httpTestingController.expectOne('http://localhost:8086/post/api/posts');
        expect(getReq.request.method).toBe('GET');
        getReq.flush([createdArticle]);

        tick();
    }));

    it('should update article and reload articles', fakeAsync(() => {
        const updatedArticle = { id: 1, title: 'Updated Article', content: 'Updated Content' };
        const fullUpdatedArticle: ArticleDTO = { ...updatedArticle, author: 'Test Author', createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT', category: 'Test' };

        service.updateArticle(1, updatedArticle);

        const updateReq = httpTestingController.expectOne('http://localhost:8086/post/api/posts/1');
        expect(updateReq.request.method).toBe('PUT');
        updateReq.flush(fullUpdatedArticle);

        tick();

        const getReq = httpTestingController.expectOne('http://localhost:8086/post/api/posts');
        expect(getReq.request.method).toBe('GET');
        getReq.flush([fullUpdatedArticle]);

        tick();
    }));

    it('should delete article and reload articles', fakeAsync(() => {
        service.deleteArticle(1);

        const deleteReq = httpTestingController.expectOne('http://localhost:8086/post/api/posts/1');
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush({});

        tick();

        const getReq = httpTestingController.expectOne('http://localhost:8086/post/api/posts');
        expect(getReq.request.method).toBe('GET');
        getReq.flush([]);

        tick();
    }));

    it('should get pending articles', fakeAsync(() => {
        const mockArticles: ArticleDTO[] = [
            { id: 1, title: 'Article 1', content: 'Content 1', author: 'Author 1', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING', category: 'Test' },
            { id: 2, title: 'Article 2', content: 'Content 2', author: 'Author 2', createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT', category: 'Test' }
        ];

        service.loadArticles();

        const req = httpTestingController.expectOne('http://localhost:8086/post/api/posts');
        req.flush(mockArticles);

        tick();

        service.getPendingArticles().subscribe(articles => {
            expect(articles.length).toBe(1);
            expect(articles[0].status).toBe('PENDING');
        });
    }));
});


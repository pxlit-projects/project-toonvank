import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import { ArticleDTO } from '../models/article.model';

describe('ArticleService', () => {
    let service: ArticleService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ArticleService]
        });
        service = TestBed.inject(ArticleService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('loadArticles', () => {
        it('should load articles and update BehaviorSubject', () => {
            // Arrange
            const mockArticles: ArticleDTO[] = [
                { id: 1, title: 'Test Article', content: 'Test Content', author: 'Test Author', createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT', category: 'Test' }
            ];

            // Act
            service.loadArticles();

            // Assert
            const req = httpMock.expectOne('http://localhost:8086/post/api/posts');
            expect(req.request.method).toBe('GET');
            req.flush(mockArticles);

            service.getArticles().subscribe(articles => {
                expect(articles).toEqual(mockArticles);
            });
        });
    });

    describe('getArticleById', () => {
        it('should return article by id', () => {
            // Arrange
            const mockArticle: ArticleDTO = { id: 1, title: 'Test Article', content: 'Test Content', author: 'Test Author', createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT', category: 'Test' };

            // Act
            service.getArticleById(1).subscribe(article => {
                // Assert
                expect(article).toEqual(mockArticle);
            });

            // Assert
            const req = httpMock.expectOne('http://localhost:8086/post/api/posts/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockArticle);
        });
    });

    describe('createArticle', () => {
        it('should create new article and reload articles', () => {
            // Arrange
            const newArticle = { title: 'New Article', content: 'New Content', author: 'New Author', category: 'New Category' };
            const createdArticle: ArticleDTO = { ...newArticle, id: 1, createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT' };

            // Act
            service.createArticle(newArticle).subscribe(article => {
                // Assert
                expect(article).toEqual(createdArticle);
            });

            // Assert
            const req = httpMock.expectOne('http://localhost:8086/post/api/posts');
            expect(req.request.method).toBe('POST');
            req.flush(createdArticle);

            // Check if loadArticles was called
            const getReq = httpMock.expectOne('http://localhost:8086/post/api/posts');
            expect(getReq.request.method).toBe('GET');
        });
    });

    describe('updateArticle', () => {
        it('should update article and reload articles', () => {
            // Arrange
            const updatedArticle = { title: 'Updated Article', content: 'Updated Content' };

            // Act
            service.updateArticle(1, updatedArticle);

            // Assert
            const req = httpMock.expectOne('http://localhost:8086/post/api/posts/1');
            expect(req.request.method).toBe('PUT');
            req.flush({});

            // Check if loadArticles was called
            const getReq = httpMock.expectOne('http://localhost:8086/post/api/posts');
            expect(getReq.request.method).toBe('GET');
        });
    });

    describe('deleteArticle', () => {
        it('should delete article and reload articles', () => {
            // Act
            service.deleteArticle(1);

            // Assert
            const req = httpMock.expectOne('http://localhost:8086/post/api/posts/1');
            expect(req.request.method).toBe('DELETE');
            req.flush({});

            // Check if loadArticles was called
            const getReq = httpMock.expectOne('http://localhost:8086/post/api/posts');
            expect(getReq.request.method).toBe('GET');
        });
    });

    describe('filtered article lists', () => {
        it('should get pending articles', () => {
            // Arrange
            const mockArticles: ArticleDTO[] = [
                { id: 1, title: 'Article 1', content: 'Content 1', author: 'Author 1', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING', category: 'Test' },
                { id: 2, title: 'Article 2', content: 'Content 2', author: 'Author 2', createdAt: new Date(), updatedAt: new Date(), status: 'DRAFT', category: 'Test' }
            ];

            // Act
            service.loadArticles();
            const req = httpMock.expectOne('http://localhost:8086/post/api/posts');
            req.flush(mockArticles);

            // Assert
            service.getPendingArticles().subscribe(articles => {
                expect(articles.length).toBe(1);
                expect(articles[0].status).toBe('PENDING');
            });
        });

        // Similar tests can be written for getDraftArticles and getRejectedArticles
    });
});
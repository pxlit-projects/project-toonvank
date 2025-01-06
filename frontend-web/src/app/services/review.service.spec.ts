import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { Review, ReviewDTO, ReviewStatus } from '../models/review.model';
import { ArticleService } from './article.service';

describe('ReviewService', () => {
    let service: ReviewService;
    let httpMock: HttpTestingController;
    let articleService: jasmine.SpyObj<ArticleService>;
    const endpoint = 'http://localhost:8086/review/api/reviews';

    const mockReviews: ReviewDTO[] = [
        { id: 1, postId: 1, status: ReviewStatus.PENDING, comment: 'Pending review', reviewedAt: new Date().toISOString() },
        { id: 2, postId: 2, status: ReviewStatus.APPROVED, comment: 'Approved review', reviewedAt: new Date().toISOString() },
        { id: 3, postId: 3, status: ReviewStatus.REJECTED, comment: 'Rejected review', reviewedAt: new Date().toISOString() }
    ];

    beforeEach(() => {
        const articleServiceSpy = jasmine.createSpyObj('ArticleService', ['loadArticles']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ReviewService,
                { provide: ArticleService, useValue: articleServiceSpy }
            ]
        });

        service = TestBed.inject(ReviewService);
        httpMock = TestBed.inject(HttpTestingController);
        articleService = TestBed.inject(ArticleService) as jasmine.SpyObj<ArticleService>;

        // Handle the initial loadReviews call from constructor
        const req = httpMock.expectOne(endpoint);
        req.flush(mockReviews);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getReviewById', () => {
        it('should return a review by id', () => {
            const testId = 1;
            const expectedReview = mockReviews[0];

            service.getReviewById(testId).subscribe(review => {
                expect(review).toEqual(expectedReview);
            });

            const req = httpMock.expectOne(`${endpoint}/${testId}`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedReview);
        });

        it('should handle error when review is not found', () => {
            service.getReviewById(999).subscribe({
                next: () => fail('should have failed with an error'),
                error: (error) => {
                    expect(error.message).toBe('An error occurred. Please try again later.');
                }
            });

            const req = httpMock.expectOne(`${endpoint}/999`);
            req.error(new ErrorEvent('Not Found'));
        });
    });

    describe('filtered reviews', () => {
        it('should return pending reviews', () => {
            const pendingReviews = service.getPendingReviews();
            expect(pendingReviews.length).toBe(1);
            expect(pendingReviews[0].status).toBe(ReviewStatus.PENDING);
        });

        it('should return approved reviews', () => {
            const approvedReviews = service.getApprovedReviews();
            expect(approvedReviews.length).toBe(1);
            expect(approvedReviews[0].status).toBe(ReviewStatus.APPROVED);
        });

        it('should return rejected reviews', () => {
            const rejectedReviews = service.getRejectedReviews();
            expect(rejectedReviews.length).toBe(1);
            expect(rejectedReviews[0].status).toBe(ReviewStatus.REJECTED);
        });
    });

    describe('createReview', () => {
        it('should create a new review and reload reviews', () => {
            const newReview: Partial<Review> = {
                postId: 4,
                comment: 'New review'
            };

            const expectedReview: Review = {
                postId: 4,
                comment: 'New review',
                status: ReviewStatus.PENDING,
                reviewedAt: new Date().toISOString()
            };

            const expectedReviewDTO: ReviewDTO = {
                ...expectedReview,
                id: 4
            };

            service.createReview(newReview).subscribe(review => {
                expect(review).toEqual(expectedReview);
            });

            const req = httpMock.expectOne(endpoint);
            expect(req.request.method).toBe('POST');
            req.flush(expectedReview);

            // Handle the loadReviews call
            const reloadReq = httpMock.expectOne(endpoint);
            const updatedMockReviews = [...mockReviews, expectedReviewDTO];
            reloadReq.flush(updatedMockReviews);

            expect(service.getReviews()).toEqual(updatedMockReviews);
        });
    });

    describe('updateReview', () => {
        it('should update a review and reload reviews', () => {
            const updatedReview: Partial<ReviewDTO> = {
                id: 1,
                comment: 'Updated review',
                status: ReviewStatus.APPROVED
            };

            service.updateReview(1, updatedReview);

            const req = httpMock.expectOne(`${endpoint}/1`);
            expect(req.request.method).toBe('PUT');
            req.flush({});

            // Handle the loadReviews call
            const reloadReq = httpMock.expectOne(endpoint);
            const updatedMockReviews = mockReviews.map(r =>
                r.id === 1 ? { ...r, ...updatedReview } : r
            );
            reloadReq.flush(updatedMockReviews);

            expect(service.getReviews()).toEqual(updatedMockReviews);
        });
    });

    describe('deleteReview', () => {
        it('should delete a review and reload reviews', () => {
            service.deleteReview(1);

            const req = httpMock.expectOne(`${endpoint}/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush({});

            // Handle the loadReviews call
            const reloadReq = httpMock.expectOne(endpoint);
            const updatedMockReviews = mockReviews.filter(r => r.id !== 1);
            reloadReq.flush(updatedMockReviews);

            expect(service.getReviews()).toEqual(updatedMockReviews);
        });
    });

    describe('updateReviewStatus', () => {
        it('should update review status and reload reviews', () => {
            const updatedStatus = ReviewStatus.APPROVED;

            // Access private method through type assertion
            (service as any).updateReviewStatus(1, updatedStatus);

            const req = httpMock.expectOne(`${endpoint}/1/updateStatus`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({ status: updatedStatus });
            req.flush({});

            // Handle the loadReviews call
            const reloadReq = httpMock.expectOne(endpoint);
            const updatedMockReviews = mockReviews.map(r =>
                r.id === 1 ? { ...r, status: updatedStatus } : r
            );
            reloadReq.flush(updatedMockReviews);

            expect(service.getReviews()).toEqual(updatedMockReviews);
        });
    });

    describe('updateArticleStatus', () => {
        it('should update article status and trigger article service reload', () => {
            const newStatus = 'PUBLISHED';

            // Access private method through type assertion
            (service as any).updateArticleStatus(1, newStatus);

            const req = httpMock.expectOne(`${endpoint}/1/updateStatus`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toBe(newStatus);
            req.flush({});

            expect(articleService.loadArticles).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle errors in all operations', () => {
            const consoleErrorSpy = spyOn(console, 'error');

            // Test create error
            service.createReview({}).subscribe({
                error: (error) => expect(error.message).toBe('An error occurred. Please try again later.')
            });
            httpMock.expectOne(endpoint).error(new ErrorEvent('Network error'));

            // Test update error
            service.updateReview(1, {});
            httpMock.expectOne(`${endpoint}/1`).error(new ErrorEvent('Network error'));

            // Test delete error
            service.deleteReview(1);
            httpMock.expectOne(`${endpoint}/1`).error(new ErrorEvent('Network error'));

            expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
        });
    });
});
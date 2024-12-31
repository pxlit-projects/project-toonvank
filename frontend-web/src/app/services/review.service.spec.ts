import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { Review, ReviewDTO, ReviewStatus } from '../models/review.model';
import { ArticleService } from './article.service';

describe('ReviewService', () => {
    let service: ReviewService;
    let httpMock: HttpTestingController;
    let articleService: jasmine.SpyObj<ArticleService>;

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
        const req = httpMock.expectOne('http://localhost:8086/review/api/reviews');
        req.flush(mockReviews);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getReviewById', () => {
        it('should return a review by id', fakeAsync(() => {
            const testId = 1;
            const expectedReview = mockReviews[0];

            let actualReview: ReviewDTO | undefined;
            service.getReviewById(testId).subscribe(review => {
                actualReview = review;
            });

            const req = httpMock.expectOne(`http://localhost:8086/review/api/reviews/${testId}`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedReview);

            tick();
            expect(actualReview).toEqual(expectedReview);
        }));

        it('should handle error when review is not found', fakeAsync(() => {
            service.getReviewById(999).subscribe({
                next: () => fail('should have failed with an error'),
                error: (error) => {
                    expect(error.message).toBe('An error occurred. Please try again later.');
                }
            });

            const req = httpMock.expectOne('http://localhost:8086/review/api/reviews/999');
            req.error(new ErrorEvent('Not Found'));
            tick();
        }));
    });

    describe('filtered reviews', () => {
        it('should return pending reviews', fakeAsync(() => {
            let result: ReviewDTO[] | undefined;
            service.getPendingReviews().subscribe(reviews => {
                result = reviews;
            });

            tick();
            expect(result?.length).toBe(1);
            expect(result?.[0].status).toBe(ReviewStatus.PENDING);
        }));

        it('should return approved reviews', fakeAsync(() => {
            let result: ReviewDTO[] | undefined;
            service.getApprovedReviews().subscribe(reviews => {
                result = reviews;
            });

            tick();
            expect(result?.length).toBe(1);
            expect(result?.[0].status).toBe(ReviewStatus.APPROVED);
        }));

        it('should return rejected reviews', fakeAsync(() => {
            let result: ReviewDTO[] | undefined;
            service.getRejectedReviews().subscribe(reviews => {
                result = reviews;
            });

            tick();
            expect(result?.length).toBe(1);
            expect(result?.[0].status).toBe(ReviewStatus.REJECTED);
        }));
    });

    describe('createReview', () => {
        it('should create a new review', fakeAsync(() => {
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

            let createdReview: Review | undefined;
            service.createReview(newReview).subscribe(review => {
                createdReview = review;
            });

            const req = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            expect(req.request.method).toBe('POST');
            req.flush(expectedReview);

            // Handle the loadReviews call
            const reloadReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            reloadReq.flush([...mockReviews, expectedReview]);

            tick();
            expect(createdReview).toEqual(expectedReview);
        }));
    });

    describe('updateReview', () => {
        it('should update a review', fakeAsync(() => {
            const updatedReview: Partial<ReviewDTO> = {
                id: 1,
                comment: 'Updated review',
                status: ReviewStatus.APPROVED
            };

            service.updateReview(1, updatedReview);

            const req = httpMock.expectOne('http://localhost:8086/review/api/reviews/1');
            expect(req.request.method).toBe('PUT');
            req.flush({});

            // Handle the loadReviews call
            const reloadReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            reloadReq.flush(mockReviews);

            tick();
        }));
    });

    describe('deleteReview', () => {
        it('should delete a review', fakeAsync(() => {
            service.deleteReview(1);

            const req = httpMock.expectOne('http://localhost:8086/review/api/reviews/1');
            expect(req.request.method).toBe('DELETE');
            req.flush({});

            // Handle the loadReviews call
            const reloadReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            reloadReq.flush(mockReviews.filter(r => r.id !== 1));

            tick();
        }));
    });
});
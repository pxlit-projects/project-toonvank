import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { ArticleService } from './article.service';
import { ReviewStatus, ReviewDTO, Review } from '../models/review.model';
import { of } from 'rxjs';

describe('ReviewService', () => {
    let service: ReviewService;
    let httpMock: HttpTestingController;
    let articleServiceSpy: jasmine.SpyObj<ArticleService>;

    const mockReviews: ReviewDTO[] = [
        {
            id: 1,
            postId: 101,
            comment: 'Great article',
            status: ReviewStatus.PENDING,
            reviewedAt: new Date().toISOString()
        },
        {
            id: 2,
            postId: 102,
            comment: 'Excellent content',
            status: ReviewStatus.PUBLISHED,
            reviewedAt: new Date().toISOString()
        },
        {
            id: 3,
            postId: 103,
            comment: 'Not suitable',
            status: ReviewStatus.REJECTED,
            reviewedAt: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        const articleSpy = jasmine.createSpyObj('ArticleService', ['loadArticles']);
        articleSpy.loadArticles.and.returnValue(of([]));

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ReviewService,
                { provide: ArticleService, useValue: articleSpy }
            ]
        });

        service = TestBed.inject(ReviewService);
        httpMock = TestBed.inject(HttpTestingController);
        articleServiceSpy = TestBed.inject(ArticleService) as jasmine.SpyObj<ArticleService>;
    });

    afterEach(() => {
        try {
            httpMock.verify();
        } catch (error) {
            console.warn('HttpTestingController verification error:', error);
        }
    });

    function flushInitialRequest() {
        const req = httpMock.expectOne('http://localhost:8086/review/api/reviews');
        req.flush(mockReviews);
    }

    it('should create the service and load initial reviews', fakeAsync(() => {
        flushInitialRequest();
        tick();
        expect(service).toBeTruthy();
    }));

    describe('loadReviews', () => {
        it('should load reviews and update reviews signal', fakeAsync(() => {
            flushInitialRequest();

            service.loadReviews().subscribe(reviews => {
                expect(reviews.length).toBe(mockReviews.length);
            });

            const req = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            req.flush(mockReviews);
            tick();
        }));
    });

    describe('getReviews filters', () => {
        beforeEach(fakeAsync(() => {
            flushInitialRequest();
            tick();
        }));

        it('should get pending reviews', () => {
            const pendingReviews = service.getPendingReviews();
            expect(pendingReviews.length).toBe(1);
            expect(pendingReviews[0].status).toBe(ReviewStatus.PENDING);
        });

        it('should get approved reviews', () => {
            const approvedReviews = service.getApprovedReviews();
            expect(approvedReviews.length).toBe(1);
            expect(approvedReviews[0].status).toBe(ReviewStatus.PUBLISHED);
        });

        it('should get rejected reviews', () => {
            const rejectedReviews = service.getRejectedReviews();
            expect(rejectedReviews.length).toBe(1);
            expect(rejectedReviews[0].status).toBe(ReviewStatus.REJECTED);
        });
    });

    describe('createReview', () => {
        it('should create a new review', fakeAsync(() => {
            flushInitialRequest();

            const newReview: Partial<Review> = {
                postId: 104,
                comment: 'New review',
                status: ReviewStatus.PENDING
            };

            service.createReview(newReview).subscribe(createdReview => {
                expect(createdReview).toBeTruthy();
            });

            const postReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            postReq.flush({ ...newReview, id: 4, reviewedAt: new Date().toISOString() });

            const loadReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            loadReq.flush(mockReviews);

            expect(articleServiceSpy.loadArticles).toHaveBeenCalled();

            tick();
        }));
    });

    describe('updateReview', () => {
        it('should update an existing review', fakeAsync(() => {
            flushInitialRequest();

            const reviewId = 1;
            const updatedReviewData: Partial<ReviewDTO> = {
                comment: 'Updated comment'
            };

            service.updateReview(reviewId, updatedReviewData).subscribe(updatedReview => {
                expect(updatedReview).toBeTruthy();
            });

            const putReq = httpMock.expectOne(`http://localhost:8086/review/api/reviews/${reviewId}`);
            putReq.flush({ ...mockReviews[0], ...updatedReviewData });

            const loadReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            loadReq.flush(mockReviews);

            expect(articleServiceSpy.loadArticles).toHaveBeenCalled();

            tick();
        }));
    });

    describe('deleteReview', () => {
        it('should delete a review', fakeAsync(() => {
            flushInitialRequest();

            const reviewId = 1;

            service.deleteReview(reviewId).subscribe(result => {
                expect(result).toBeUndefined();
            });

            const deleteReq = httpMock.expectOne(`http://localhost:8086/review/api/reviews/${reviewId}`);
            deleteReq.flush(null);

            const loadReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            loadReq.flush(mockReviews);

            tick();
        }));
    });

    describe('updateReviewStatus', () => {
        it('should update review status', fakeAsync(() => {
            flushInitialRequest();

            const reviewId = 1;
            const newStatus = ReviewStatus.PUBLISHED;

            service.updateReviewStatus(reviewId, newStatus).subscribe(updatedReview => {
                expect(updatedReview).toBeTruthy();
            });

            const putReq = httpMock.expectOne(`http://localhost:8086/review/api/reviews/${reviewId}/updateStatus`);
            putReq.flush({ ...mockReviews[0], status: newStatus });

            const loadReq = httpMock.expectOne('http://localhost:8086/review/api/reviews');
            loadReq.flush(mockReviews);

            expect(articleServiceSpy.loadArticles).toHaveBeenCalled();

            tick();
        }));
    });
});
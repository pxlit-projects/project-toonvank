import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { CommentDTO, Comment } from '../models/comment.model';
import { provideHttpClient } from '@angular/common/http';

describe('CommentService', () => {
    let service: CommentService;
    let httpTestingController: HttpTestingController;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CommentService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });

        service = TestBed.inject(CommentService);
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createComment', () => {
        it('should create a new comment', fakeAsync(() => {
            const mockComment: Comment = {
                postId: 1,
                content: 'Test comment',
                postedBy: 'testUser',
                createdAt: new Date(),
                editedAt: new Date()
            };

            spyOn(localStorage, 'getItem').and.returnValue('testUser');

            service.createComment(mockComment).subscribe(result => {
                expect(result).toBeTrue();
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments');
            expect(req.request.method).toBe('POST');
            expect(req.request.body.postId).toBe(1);
            expect(req.request.body.content).toBe('Test comment');
            expect(req.request.body.postedBy).toBe('testUser');
            expect(req.request.body.createdAt).toBeDefined();
            expect(req.request.body.editedAt).toBeDefined();

            req.flush({});
            tick();
        }));

        it('should handle error when creating a comment', fakeAsync(() => {
            const mockComment: Comment = {
                postId: 1,
                content: 'Test comment',
                postedBy: 'testUser',
                createdAt: new Date(),
                editedAt: new Date()
            };

            spyOn(localStorage, 'getItem').and.returnValue('testUser');

            service.createComment(mockComment).subscribe({
                error: (error) => {
                    expect(error).toBeTruthy();
                    expect(error.message).toBe('An error occurred. Please try again later.');
                }
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments');
            req.error(new ErrorEvent('Network error'));
            tick();
        }));
    });

    describe('getCommentByPostId', () => {
        it('should return comments for a given post id', fakeAsync(() => {
            const mockComments: CommentDTO[] = [
                { id: 1, postId: 1, content: 'Comment 1', createdAt: new Date(), editedAt: new Date(), postedBy: 'User1' },
                { id: 2, postId: 1, content: 'Comment 2', createdAt: new Date(), editedAt: new Date(), postedBy: 'User2' }
            ];

            service.getCommentByPostId(1).subscribe(comments => {
                expect(comments).toEqual(mockComments);
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments/post/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockComments);
            tick();
        }));

        it('should handle error when no comments are found', fakeAsync(() => {
            service.getCommentByPostId(1).subscribe({
                error: (error) => {
                    expect(error).toBeTruthy();
                    expect(error.message).toBe('An error occurred. Please try again later.');
                }
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments/post/1');
            req.flush([], { status: 404, statusText: 'Not Found' });
            tick();
        }));
    });

    describe('updateComment', () => {
        it('should update a comment', fakeAsync(() => {
            const mockUpdatedComments: CommentDTO[] = [
                { id: 1, postId: 1, content: 'Updated comment', createdAt: new Date(), editedAt: new Date(), postedBy: 'User1' }
            ];

            service.updateComment(1, 'Updated comment').subscribe(comments => {
                expect(comments).toEqual(mockUpdatedComments);
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toBe('Updated comment');
            req.flush(mockUpdatedComments);
            tick();
        }));

        it('should handle error when updating a comment fails', fakeAsync(() => {
            service.updateComment(1, 'Updated comment').subscribe({
                error: (error) => {
                    expect(error).toBeTruthy();
                    expect(error.message).toBe('An error occurred. Please try again later.');
                }
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments/1');
            req.error(new ErrorEvent('Network error'));
            tick();
        }));
    });

    describe('deleteComment', () => {
        it('should delete a comment', fakeAsync(() => {
            const mockRemainingComments: CommentDTO[] = [
                { id: 2, postId: 1, content: 'Comment 2', createdAt: new Date(), editedAt: new Date(), postedBy: 'User2' }
            ];

            service.deleteComment(1).subscribe(comments => {
                expect(comments).toEqual(mockRemainingComments);
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(mockRemainingComments);
            tick();
        }));

        it('should handle error when deleting a comment fails', fakeAsync(() => {
            service.deleteComment(1).subscribe({
                error: (error) => {
                    expect(error).toBeTruthy();
                    expect(error.message).toBe('An error occurred. Please try again later.');
                }
            });

            const req = httpTestingController.expectOne('http://localhost:8086/comment/api/comments/1');
            req.error(new ErrorEvent('Network error'));
            tick();
        }));
    });
});


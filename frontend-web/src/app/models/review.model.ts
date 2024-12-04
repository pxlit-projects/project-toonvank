export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface ReviewDTO {
    id: number;
    postId: number;
    reviewerId: number;
    status: ReviewStatus;
    comment?: string;
    reviewedAt: string;
}

export interface Review {
    postId: number;
    reviewerId: number;
    status: ReviewStatus;
    comment?: string;
    reviewedAt: string;
}
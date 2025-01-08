export enum ReviewStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
    REJECTED = 'REJECTED'
}

export interface ReviewDTO {
    id: number;
    postId: number;
    status: ReviewStatus;
    comment?: string;
    reviewedAt: string;
}

export interface Review {
    postId: number;
    status: ReviewStatus;
    comment?: string;
    reviewedAt: string;
}
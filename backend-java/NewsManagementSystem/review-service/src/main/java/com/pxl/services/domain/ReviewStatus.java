package com.pxl.services.domain;

import java.io.Serializable;

public enum ReviewStatus implements Serializable {
    DRAFT,
    PUBLISHED,
    PENDING,
    REJECTED,
    APPROVED
}
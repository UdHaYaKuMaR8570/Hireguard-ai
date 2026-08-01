package com.hireguard.constants;

/**
 * Centralized constants for trust scoring to avoid magic numbers.
 */
public final class TrustScoreConstants {
    private TrustScoreConstants() {}

    public static final int MAX_TRUST_SCORE = 100;
    public static final int MIN_TRUST_SCORE = 0;
    
    public static final int THRESHOLD_HIGH_RISK = 30;
    public static final int THRESHOLD_MEDIUM_RISK = 70;
}

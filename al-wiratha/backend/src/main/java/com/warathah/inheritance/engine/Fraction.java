package com.warathah.inheritance.engine;

import java.util.Objects;

/**
 * Immutable exact-arithmetic fraction. No floating-point until toDouble().
 */
public final class Fraction implements Comparable<Fraction> {

    public static final Fraction ZERO = new Fraction(0, 1);
    public static final Fraction ONE  = new Fraction(1, 1);

    private final long numerator;
    private final long denominator;

    private Fraction(long numerator, long denominator) {
        if (denominator == 0) throw new ArithmeticException("Denominator cannot be zero");
        // Normalise sign: keep denominator positive
        long sign = denominator < 0 ? -1 : 1;
        long n = numerator * sign;
        long d = denominator * sign;
        long g = gcd(Math.abs(n), Math.abs(d));
        this.numerator   = n / g;
        this.denominator = d / g;
    }

    public static Fraction of(long numerator, long denominator) {
        return new Fraction(numerator, denominator);
    }

    public static Fraction of(long whole) {
        return new Fraction(whole, 1);
    }

    private static long gcd(long a, long b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    public long getNumerator()   { return numerator; }
    public long getDenominator() { return denominator; }

    public Fraction add(Fraction other) {
        return new Fraction(
            this.numerator * other.denominator + other.numerator * this.denominator,
            this.denominator * other.denominator
        );
    }

    public Fraction subtract(Fraction other) {
        return new Fraction(
            this.numerator * other.denominator - other.numerator * this.denominator,
            this.denominator * other.denominator
        );
    }

    public Fraction multiply(Fraction other) {
        return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
    }

    public Fraction divide(Fraction other) {
        return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
    }

    public boolean isZero() {
        return numerator == 0;
    }

    public boolean isGreaterThan(Fraction other) {
        return compareTo(other) > 0;
    }

    public boolean isLessThan(Fraction other) {
        return compareTo(other) < 0;
    }

    public double toDouble() {
        return (double) numerator / denominator;
    }

    @Override
    public int compareTo(Fraction other) {
        long lhs = this.numerator * other.denominator;
        long rhs = other.numerator * this.denominator;
        return Long.compare(lhs, rhs);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Fraction f)) return false;
        return numerator == f.numerator && denominator == f.denominator;
    }

    @Override
    public int hashCode() {
        return Objects.hash(numerator, denominator);
    }

    /** Returns "n/d" or just "n" when denominator is 1. */
    @Override
    public String toString() {
        return denominator == 1 ? String.valueOf(numerator) : numerator + "/" + denominator;
    }

    /**
     * Returns Arabic-numeral fraction string, e.g. "١/٢".
     */
    public String toDisplayString() {
        if (denominator == 1) return toArabicDigits(numerator);
        return toArabicDigits(numerator) + "/" + toArabicDigits(denominator);
    }

    private static String toArabicDigits(long n) {
        String s = String.valueOf(n);
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c >= '0' && c <= '9') {
                sb.append((char) ('٠' + (c - '0')));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}

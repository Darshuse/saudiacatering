package com.warathah.inheritance.engine;

import java.math.BigDecimal;

public class HeirResult {

    private HeirType heirType;
    private String arabicName;
    private int count;
    private HeirClassification classification;
    private Fraction sharePerHeir;
    private Fraction totalGroupShare;
    private double percentage;
    private BigDecimal monetaryAmount;
    private String fiqhExplanation;
    private String fiqhRule;
    private String blockedBy;

    public HeirResult() {}

    public HeirType getHeirType()                        { return heirType; }
    public void setHeirType(HeirType v)                  { this.heirType = v; }

    public String getArabicName()                        { return arabicName; }
    public void setArabicName(String v)                  { this.arabicName = v; }

    public int getCount()                                { return count; }
    public void setCount(int v)                          { this.count = v; }

    public HeirClassification getClassification()        { return classification; }
    public void setClassification(HeirClassification v)  { this.classification = v; }

    public Fraction getSharePerHeir()                    { return sharePerHeir; }
    public void setSharePerHeir(Fraction v)              { this.sharePerHeir = v; }

    public Fraction getTotalGroupShare()                 { return totalGroupShare; }
    public void setTotalGroupShare(Fraction v)           { this.totalGroupShare = v; }

    public double getPercentage()                        { return percentage; }
    public void setPercentage(double v)                  { this.percentage = v; }

    public BigDecimal getMonetaryAmount()                { return monetaryAmount; }
    public void setMonetaryAmount(BigDecimal v)          { this.monetaryAmount = v; }

    public String getFiqhExplanation()                   { return fiqhExplanation; }
    public void setFiqhExplanation(String v)             { this.fiqhExplanation = v; }

    public String getFiqhRule()                          { return fiqhRule; }
    public void setFiqhRule(String v)                    { this.fiqhRule = v; }

    public String getBlockedBy()                         { return blockedBy; }
    public void setBlockedBy(String v)                   { this.blockedBy = v; }

    // Builder

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private final HeirResult r = new HeirResult();

        public Builder heirType(HeirType v)                    { r.heirType = v;         return this; }
        public Builder arabicName(String v)                    { r.arabicName = v;       return this; }
        public Builder count(int v)                            { r.count = v;            return this; }
        public Builder classification(HeirClassification v)    { r.classification = v;   return this; }
        public Builder sharePerHeir(Fraction v)                { r.sharePerHeir = v;     return this; }
        public Builder totalGroupShare(Fraction v)             { r.totalGroupShare = v;  return this; }
        public Builder percentage(double v)                    { r.percentage = v;       return this; }
        public Builder monetaryAmount(BigDecimal v)            { r.monetaryAmount = v;   return this; }
        public Builder fiqhExplanation(String v)               { r.fiqhExplanation = v;  return this; }
        public Builder fiqhRule(String v)                      { r.fiqhRule = v;         return this; }
        public Builder blockedBy(String v)                     { r.blockedBy = v;        return this; }

        public HeirResult build() { return r; }
    }
}

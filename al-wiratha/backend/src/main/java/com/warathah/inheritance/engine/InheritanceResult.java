package com.warathah.inheritance.engine;

import java.math.BigDecimal;
import java.util.List;

public class InheritanceResult {

    private Madhhab madhhab;
    private BigDecimal netEstate;
    private long aslAlMasala;
    private boolean awlApplied;
    private Fraction awlFactor;
    private boolean raddApplied;
    private List<HeirResult> heirs;
    private List<HeirResult> blockedHeirs;
    private String specialCaseNote;
    private String disclaimer;

    public Madhhab getMadhhab()                    { return madhhab; }
    public void setMadhhab(Madhhab v)              { this.madhhab = v; }

    public BigDecimal getNetEstate()               { return netEstate; }
    public void setNetEstate(BigDecimal v)         { this.netEstate = v; }

    public long getAslAlMasala()                   { return aslAlMasala; }
    public void setAslAlMasala(long v)             { this.aslAlMasala = v; }

    public boolean isAwlApplied()                  { return awlApplied; }
    public void setAwlApplied(boolean v)           { this.awlApplied = v; }

    public Fraction getAwlFactor()                 { return awlFactor; }
    public void setAwlFactor(Fraction v)           { this.awlFactor = v; }

    public boolean isRaddApplied()                 { return raddApplied; }
    public void setRaddApplied(boolean v)          { this.raddApplied = v; }

    public List<HeirResult> getHeirs()             { return heirs; }
    public void setHeirs(List<HeirResult> v)       { this.heirs = v; }

    public List<HeirResult> getBlockedHeirs()      { return blockedHeirs; }
    public void setBlockedHeirs(List<HeirResult> v){ this.blockedHeirs = v; }

    public String getSpecialCaseNote()             { return specialCaseNote; }
    public void setSpecialCaseNote(String v)       { this.specialCaseNote = v; }

    public String getDisclaimer()                  { return disclaimer; }
    public void setDisclaimer(String v)            { this.disclaimer = v; }
}

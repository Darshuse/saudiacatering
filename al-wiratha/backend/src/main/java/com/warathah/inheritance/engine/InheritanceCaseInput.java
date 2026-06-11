package com.warathah.inheritance.engine;

import java.math.BigDecimal;

public class InheritanceCaseInput {

    private Madhhab madhhab = Madhhab.HANBALI;
    private boolean deceasedIsMale = true;
    private BigDecimal grossEstate = BigDecimal.ZERO;
    private BigDecimal debts       = BigDecimal.ZERO;
    private BigDecimal wasiyya     = BigDecimal.ZERO;
    private BigDecimal funeralCosts = BigDecimal.ZERO;

    // Heirs
    private int husbands          = 0;
    private int wives              = 0;
    private int sons               = 0;
    private int daughters          = 0;
    private int sonsOfSon          = 0;
    private int daughtersOfSon     = 0;
    private boolean fatherAlive    = false;
    private boolean motherAlive    = false;
    private boolean paternalGrandfatherAlive = false;
    private int paternalGrandmothers = 0;
    private int maternalGrandmothers = 0;
    private int fullBrothers       = 0;
    private int fullSisters        = 0;
    private int paternalBrothers   = 0;
    private int paternalSisters    = 0;
    private int maternalBrothers   = 0;
    private int maternalSisters    = 0;
    private int fullPaternalUncles = 0;
    private int sonsOfFullPaternalUncle    = 0;
    private int paternalPaternalUncles     = 0;
    private int sonsOfPaternalPaternalUncle = 0;

    // Toggles
    private boolean applyRaddToSpouse  = false;
    private boolean applyDhawiArham    = false;

    // Getters and setters
    public Madhhab getMadhhab()                          { return madhhab; }
    public void setMadhhab(Madhhab madhhab)              { this.madhhab = madhhab; }

    public boolean isDeceasedIsMale()                    { return deceasedIsMale; }
    public void setDeceasedIsMale(boolean v)             { this.deceasedIsMale = v; }

    public BigDecimal getGrossEstate()                   { return grossEstate; }
    public void setGrossEstate(BigDecimal v)             { this.grossEstate = v; }

    public BigDecimal getDebts()                         { return debts; }
    public void setDebts(BigDecimal v)                   { this.debts = v; }

    public BigDecimal getWasiyya()                       { return wasiyya; }
    public void setWasiyya(BigDecimal v)                 { this.wasiyya = v; }

    public BigDecimal getFuneralCosts()                  { return funeralCosts; }
    public void setFuneralCosts(BigDecimal v)            { this.funeralCosts = v; }

    public int getHusbands()                             { return husbands; }
    public void setHusbands(int v)                       { this.husbands = v; }

    public int getWives()                                { return wives; }
    public void setWives(int v)                          { this.wives = v; }

    public int getSons()                                 { return sons; }
    public void setSons(int v)                           { this.sons = v; }

    public int getDaughters()                            { return daughters; }
    public void setDaughters(int v)                      { this.daughters = v; }

    public int getSonsOfSon()                            { return sonsOfSon; }
    public void setSonsOfSon(int v)                      { this.sonsOfSon = v; }

    public int getDaughtersOfSon()                       { return daughtersOfSon; }
    public void setDaughtersOfSon(int v)                 { this.daughtersOfSon = v; }

    public boolean isFatherAlive()                       { return fatherAlive; }
    public void setFatherAlive(boolean v)                { this.fatherAlive = v; }

    public boolean isMotherAlive()                       { return motherAlive; }
    public void setMotherAlive(boolean v)                { this.motherAlive = v; }

    public boolean isPaternalGrandfatherAlive()          { return paternalGrandfatherAlive; }
    public void setPaternalGrandfatherAlive(boolean v)   { this.paternalGrandfatherAlive = v; }

    public int getPaternalGrandmothers()                 { return paternalGrandmothers; }
    public void setPaternalGrandmothers(int v)           { this.paternalGrandmothers = v; }

    public int getMaternalGrandmothers()                 { return maternalGrandmothers; }
    public void setMaternalGrandmothers(int v)           { this.maternalGrandmothers = v; }

    public int getFullBrothers()                         { return fullBrothers; }
    public void setFullBrothers(int v)                   { this.fullBrothers = v; }

    public int getFullSisters()                          { return fullSisters; }
    public void setFullSisters(int v)                    { this.fullSisters = v; }

    public int getPaternalBrothers()                     { return paternalBrothers; }
    public void setPaternalBrothers(int v)               { this.paternalBrothers = v; }

    public int getPaternalSisters()                      { return paternalSisters; }
    public void setPaternalSisters(int v)                { this.paternalSisters = v; }

    public int getMaternalBrothers()                     { return maternalBrothers; }
    public void setMaternalBrothers(int v)               { this.maternalBrothers = v; }

    public int getMaternalSisters()                      { return maternalSisters; }
    public void setMaternalSisters(int v)                { this.maternalSisters = v; }

    public int getFullPaternalUncles()                   { return fullPaternalUncles; }
    public void setFullPaternalUncles(int v)             { this.fullPaternalUncles = v; }

    public int getSonsOfFullPaternalUncle()              { return sonsOfFullPaternalUncle; }
    public void setSonsOfFullPaternalUncle(int v)        { this.sonsOfFullPaternalUncle = v; }

    public int getPaternalPaternalUncles()               { return paternalPaternalUncles; }
    public void setPaternalPaternalUncles(int v)         { this.paternalPaternalUncles = v; }

    public int getSonsOfPaternalPaternalUncle()          { return sonsOfPaternalPaternalUncle; }
    public void setSonsOfPaternalPaternalUncle(int v)    { this.sonsOfPaternalPaternalUncle = v; }

    public boolean isApplyRaddToSpouse()                 { return applyRaddToSpouse; }
    public void setApplyRaddToSpouse(boolean v)          { this.applyRaddToSpouse = v; }

    public boolean isApplyDhawiArham()                   { return applyDhawiArham; }
    public void setApplyDhawiArham(boolean v)            { this.applyDhawiArham = v; }
}

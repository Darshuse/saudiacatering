package com.warathah.inheritance.engine;

public enum Madhhab {
    HANAFI("الحنفي", "Saudi courts generally follow Hanbali; Egyptian inheritance law is mainly Hanafi"),
    MALIKI("المالكي", "Predominant in North and West Africa"),
    SHAFII("الشافعي", "Predominant in Southeast Asia and East Africa"),
    HANBALI("الحنبلي", "Official madhhab of Saudi courts");

    private final String arabicName;
    private final String courtNote;

    Madhhab(String arabicName, String courtNote) {
        this.arabicName = arabicName;
        this.courtNote  = courtNote;
    }

    public String getArabicName() { return arabicName; }
    public String getCourtNote()  { return courtNote;  }
}

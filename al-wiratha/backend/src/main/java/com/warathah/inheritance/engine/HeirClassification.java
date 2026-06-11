package com.warathah.inheritance.engine;

public enum HeirClassification {
    SAHIB_FARD("صاحب فرض", "Fixed share holder"),
    ASABA("عاصب", "Residuary heir"),
    SAHIB_FARD_AND_ASABA("صاحب فرض وعاصب", "Fixed share and residuary"),
    MAHJUB("محجوب", "Blocked from inheritance"),
    DHAWI_ARHAM("ذوو الأرحام", "Extended relatives");

    private final String arabicName;
    private final String description;

    HeirClassification(String arabicName, String description) {
        this.arabicName  = arabicName;
        this.description = description;
    }

    public String getArabicName()  { return arabicName;  }
    public String getDescription() { return description; }
}

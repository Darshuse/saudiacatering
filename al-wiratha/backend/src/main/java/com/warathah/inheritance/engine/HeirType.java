package com.warathah.inheritance.engine;

public enum HeirType {
    // Spouses
    HUSBAND, WIFE,
    // Direct descendants
    SON, DAUGHTER,
    SON_OF_SON, DAUGHTER_OF_SON,
    // Parents
    FATHER, MOTHER,
    // Grandparents
    PATERNAL_GRANDFATHER, PATERNAL_GRANDMOTHER, MATERNAL_GRANDMOTHER,
    // Full siblings (same father and mother)
    FULL_BROTHER, FULL_SISTER,
    // Paternal siblings (same father, different mother)
    PATERNAL_BROTHER, PATERNAL_SISTER,
    // Maternal siblings (same mother, different father)
    MATERNAL_BROTHER, MATERNAL_SISTER,
    // Paternal uncles & their sons (ta'seeb)
    FULL_PATERNAL_UNCLE, SON_OF_FULL_PATERNAL_UNCLE,
    PATERNAL_PATERNAL_UNCLE, SON_OF_PATERNAL_PATERNAL_UNCLE
}

package com.warathah.inheritance.engine.rules;

import com.warathah.inheritance.engine.InheritanceCaseInput;

/**
 * Shafi'i madhhab rule set.
 *
 * Key differences:
 * 1. Grandfather with siblings: same as Maliki (muqasama or 1/3, better for grandfather).
 *    — per al-Nawawi, Minhaj al-Talibin; al-Shirazi, al-Muhadhdhab.
 * 2. Radd: classically surplus goes to bayt al-mal.
 *    — per al-Nawawi, al-Rawda; contemporary practice toggle applies.
 * 3. Dhawu al-arham: classically do NOT inherit (surplus to bayt al-mal).
 *    — per al-Umm of al-Shafi'i.
 * 4. Al-mushtaraka: Shafi'i APPLIES tashrik.
 */
public class ShafiRuleSet extends BaseRuleSet {

    @Override
    public boolean applyRaddToSpouse(InheritanceCaseInput input) {
        return input.isApplyRaddToSpouse();
    }

    @Override
    public boolean dhawuArhamInherit(InheritanceCaseInput input) {
        // Classical Shafi'i: no. Contemporary practice toggle.
        return input.isApplyDhawiArham();
    }
}

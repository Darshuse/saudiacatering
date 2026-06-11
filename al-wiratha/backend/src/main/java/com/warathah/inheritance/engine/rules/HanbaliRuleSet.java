package com.warathah.inheritance.engine.rules;

import com.warathah.inheritance.engine.InheritanceCaseInput;

/**
 * Hanbali madhhab rule set (official madhhab of Saudi Arabian courts).
 *
 * Key differences:
 * 1. Grandfather with siblings: muqasama or 1/3 (same as Maliki/Shafi'i).
 *    — per Ibn Qudama, al-Mughni; Ibn Taymiyya, Majmu' al-Fatawa.
 * 2. Radd: applied to furud heirs excluding spouse (same as Hanafi classical).
 * 3. Dhawu al-arham: DO inherit (same as Hanafi).
 *    — per Ibn Qudama, al-Mughni vol. 6.
 * 4. Al-mushtaraka: NOT applied (same as Hanafi).
 */
public class HanbaliRuleSet extends BaseRuleSet {

    @Override
    public boolean applyRaddToSpouse(InheritanceCaseInput input) {
        return input.isApplyRaddToSpouse();
    }

    @Override
    public boolean dhawuArhamInherit(InheritanceCaseInput input) {
        // Hanbali: dhawu al-arham DO inherit
        return true;
    }
}

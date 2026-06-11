package com.warathah.inheritance.engine.rules;

import com.warathah.inheritance.engine.InheritanceCaseInput;

/**
 * Maliki madhhab rule set.
 *
 * Key differences:
 * 1. Grandfather with siblings: muqasama or 1/3 of estate, whichever is better for grandfather.
 *    — per al-Mudawwana al-Kubra of Ibn al-Qasim.
 * 2. Radd: classically to bayt al-mal (not to furud heirs); modern practice returns it.
 * 3. Dhawu al-arham: classically do NOT inherit; modern practice may apply.
 * 4. Al-mushtaraka (المسألة المشتركة): Maliki APPLIES tashrik.
 */
public class MalikiRuleSet extends BaseRuleSet {

    @Override
    public boolean applyRaddToSpouse(InheritanceCaseInput input) {
        return input.isApplyRaddToSpouse();
    }

    @Override
    public boolean dhawuArhamInherit(InheritanceCaseInput input) {
        // Classical Maliki: no; modern practice toggle
        return input.isApplyDhawiArham();
    }
}

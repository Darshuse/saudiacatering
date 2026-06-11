package com.warathah.inheritance.engine.rules;

import com.warathah.inheritance.engine.HeirType;
import com.warathah.inheritance.engine.InheritanceCaseInput;

import java.util.Map;

/**
 * Hanafi madhhab rule set.
 *
 * Key differences from other madhhabs:
 * 1. Grandfather BLOCKS all siblings (full, paternal, maternal).
 *    — Abu Hanifa's position per Ibn 'Abidin, Radd al-Muhtar 'ala al-Durr al-Mukhtar.
 * 2. Radd: applied to furud heirs excluding spouse (classical position).
 * 3. Dhawu al-arham: INHERIT under Hanafi (ahl al-tanzil method).
 * 4. Al-mushtaraka (المسألة المشتركة): NOT applied.
 */
public class HanafiRuleSet extends BaseRuleSet {

    @Override
    protected void applyMadhhabSpecificBlocking(InheritanceCaseInput in,
                                                  Map<HeirType, BlockingResult> result) {
        // الجد يحجب الإخوة — Hanafi: grandfather blocks ALL siblings
        // Source: Abu Hanifa's position; al-Sarakhsi, al-Mabsut, vol. 30
        if (in.isPaternalGrandfatherAlive() && !isBlocked(HeirType.PATERNAL_GRANDFATHER, result)) {
            result.putIfAbsent(HeirType.FULL_BROTHER,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER,
                    "الجد يحجب الإخوة عند الأحناف (قول أبي حنيفة)"));
            result.putIfAbsent(HeirType.FULL_SISTER,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER,
                    "الجد يحجب الإخوة عند الأحناف"));
            result.putIfAbsent(HeirType.PATERNAL_BROTHER,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER,
                    "الجد يحجب الإخوة عند الأحناف"));
            result.putIfAbsent(HeirType.PATERNAL_SISTER,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER,
                    "الجد يحجب الإخوة عند الأحناف"));
            result.putIfAbsent(HeirType.MATERNAL_BROTHER,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER,
                    "الجد يحجب الإخوة عند الأحناف"));
            result.putIfAbsent(HeirType.MATERNAL_SISTER,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER,
                    "الجد يحجب الإخوة عند الأحناف"));
        }
    }

    @Override
    public boolean applyRaddToSpouse(InheritanceCaseInput input) {
        // Classical Hanafi: radd does NOT go to spouse
        // Contemporary practice toggle allows it
        return input.isApplyRaddToSpouse();
    }

    @Override
    public boolean dhawuArhamInherit(InheritanceCaseInput input) {
        // Hanafi: dhawu al-arham DO inherit (ahl al-tanzil method)
        // Source: al-Marghinani, al-Hidaya
        return true;
    }
}

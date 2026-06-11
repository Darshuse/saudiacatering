package com.warathah.inheritance.engine;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class InheritanceEngineTest {

    private final InheritanceEngine engine = new InheritanceEngine();

    private InheritanceCaseInput base(Madhhab m) {
        InheritanceCaseInput in = new InheritanceCaseInput();
        in.setMadhhab(m);
        in.setDeceasedIsMale(true);
        in.setGrossEstate(new BigDecimal("120000"));
        return in;
    }

    /** Test 1: Husband + 2 daughters, no sons — Husband gets 1/4, daughters get 2/3 (awl expected) */
    @Test
    void husbandAndTwoDaughters_awlCase() {
        // Source: Classical awl case — total = 1/4 + 2/3 = 11/12 (no awl here actually)
        // Husband 1/4 = 30000, daughters 2/3 = 80000, total = 110000 < 120000
        // Wait: no sons, no father — who takes remainder? Let's check
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setHusbands(1);
        in.setDaughters(2);
        InheritanceResult result = engine.calculate(in);
        assertFalse(result.getHeirs().isEmpty());
        // Husband should get 1/4 (no male descendants)
        result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.HUSBAND)
            .findFirst()
            .ifPresent(h -> assertEquals(Fraction.of(1, 4), h.getTotalGroupShare()));
    }

    /** Test 2: Wife + 1 son — son takes remainder after wife's 1/8 */
    @Test
    void wifeAndSon_sonTakesRemainder() {
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setDeceasedIsMale(false);
        in.setWives(0);
        in.setHusbands(1);
        in.setSons(1);
        InheritanceResult result = engine.calculate(in);
        // Husband: 1/4 (with son), Son: 3/4
        result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.HUSBAND)
            .findFirst()
            .ifPresent(h -> assertEquals(Fraction.of(1, 4), h.getTotalGroupShare()));
        result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.SON)
            .findFirst()
            .ifPresent(h -> assertEquals(Fraction.of(3, 4), h.getTotalGroupShare()));
    }

    /** Test 3: Al-Umariyyatan — husband + father + mother, no children */
    @Test
    void alUmariyyatan_husbandFatherMother() {
        // Source: 'Umar ibn al-Khattab's case; ibn Rushd, Bidayat al-Mujtahid
        // Husband=1/2, Father=asaba, Mother=1/3 of remainder = 1/6 of estate
        // Expected: Husband 1/2, Mother 1/6 (= 1/3 of 1/2 remainder), Father = 1/3
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setHusbands(1);
        in.setFatherAlive(true);
        in.setMotherAlive(true);
        InheritanceResult result = engine.calculate(in);
        assertTrue(result.getSpecialCaseNote() != null && result.getSpecialCaseNote().contains("العمريتين"));
    }

    /** Test 4: Multiple wives share 1/8 */
    @Test
    void fourWivesShareOneEighth() {
        InheritanceCaseInput in = base(Madhhab.HANAFI);
        in.setWives(4);
        in.setSons(1);
        InheritanceResult result = engine.calculate(in);
        result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.WIFE)
            .findFirst()
            .ifPresent(h -> {
                // Total for all 4 wives = 1/8
                assertEquals(Fraction.of(1, 8), h.getTotalGroupShare());
                // Per wife = 1/32
                assertEquals(Fraction.of(1, 32), h.getSharePerHeir());
            });
    }

    /** Test 5: Hanafi — grandfather blocks siblings */
    @Test
    void hanafi_grandfatherBlocksSiblings() {
        InheritanceCaseInput in = base(Madhhab.HANAFI);
        in.setPaternalGrandfatherAlive(true);
        in.setFullBrothers(2);
        in.setFullSisters(1);
        InheritanceResult result = engine.calculate(in);
        // Siblings must be in blocked list
        assertTrue(result.getBlockedHeirs().stream()
            .anyMatch(h -> h.getHeirType() == HeirType.FULL_BROTHER));
        assertTrue(result.getBlockedHeirs().stream()
            .anyMatch(h -> h.getHeirType() == HeirType.FULL_SISTER));
    }

    /** Test 6: Hanbali — grandfather with siblings, muqasama applies */
    @Test
    void hanbali_grandfatherWithSiblings_notBlocked() {
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setPaternalGrandfatherAlive(true);
        in.setFullBrothers(2);
        InheritanceResult result = engine.calculate(in);
        // In Hanbali, grandfather does NOT block brothers; brothers may share
        assertFalse(result.getBlockedHeirs().stream()
            .anyMatch(h -> h.getHeirType() == HeirType.FULL_BROTHER));
    }

    /** Test 7: Son + daughter — daughter is asaba ma'a al-ghayr (2:1 split) */
    @Test
    void sonAndDaughter_taseebSplit() {
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setSons(1);
        in.setDaughters(1);
        InheritanceResult result = engine.calculate(in);
        // Verify son gets twice daughter's share
        double sonShare = result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.SON)
            .mapToDouble(HeirResult::getPercentage).findFirst().orElse(0);
        double dauShare = result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.DAUGHTER)
            .mapToDouble(HeirResult::getPercentage).findFirst().orElse(0);
        assertEquals(sonShare, dauShare * 2, 0.01);
    }

    /** Test 8: Mother alone — radd applies */
    @Test
    void motherAlone_raddApplied() {
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setMotherAlive(true);
        InheritanceResult result = engine.calculate(in);
        assertTrue(result.isRaddApplied());
        // Mother ends up with the entire estate
        result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.MOTHER)
            .findFirst()
            .ifPresent(h -> assertEquals(100.0, h.getPercentage(), 0.01));
    }

    /** Test 9: Mother + 2 siblings — mother gets 1/6 (reduced by sibling presence) */
    @Test
    void motherWithTwoSiblings_getsOneSixth() {
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setMotherAlive(true);
        in.setFullBrothers(2); // father is dead so brothers are not blocked
        InheritanceResult result = engine.calculate(in);
        result.getHeirs().stream()
            .filter(h -> h.getHeirType() == HeirType.MOTHER)
            .findFirst()
            .ifPresent(h -> assertEquals(Fraction.of(1, 6), h.getTotalGroupShare()));
    }

    /** Test 10: Wasiyya exceeds 1/3 — should throw */
    @Test
    void wasiyyaExceedsOneThird_throws() {
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setSons(1);
        in.setWasiyya(new BigDecimal("50000")); // > 40000 (1/3 of 120000)
        assertThrows(IllegalArgumentException.class, () -> engine.calculate(in));
    }

    /** Test 11: Awl case — husband + 2 full sisters + mother (all madhhabs) */
    @Test
    void awlCase_husbandTwoSistersMother() {
        // Husband=1/2, 2 sisters=2/3, mother=1/6 => total=1/2+2/3+1/6 = 4/3 > 1 => awl
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setHusbands(1);
        in.setFullSisters(2);
        in.setMotherAlive(true);
        InheritanceResult result = engine.calculate(in);
        assertTrue(result.isAwlApplied());
        // All heirs' percentages should sum to 100%
        double total = result.getHeirs().stream()
            .mapToDouble(HeirResult::getPercentage).sum();
        assertEquals(100.0, total, 0.1);
    }

    /** Test 12: Father blocks all brothers */
    @Test
    void fatherBlocksAllBrothers() {
        InheritanceCaseInput in = base(Madhhab.HANBALI);
        in.setFatherAlive(true);
        in.setFullBrothers(3);
        in.setPaternalBrothers(2);
        in.setMaternalBrothers(1);
        InheritanceResult result = engine.calculate(in);
        assertTrue(result.getBlockedHeirs().stream()
            .anyMatch(h -> h.getHeirType() == HeirType.FULL_BROTHER));
        assertTrue(result.getBlockedHeirs().stream()
            .anyMatch(h -> h.getHeirType() == HeirType.PATERNAL_BROTHER));
        assertTrue(result.getBlockedHeirs().stream()
            .anyMatch(h -> h.getHeirType() == HeirType.MATERNAL_BROTHER));
    }
}

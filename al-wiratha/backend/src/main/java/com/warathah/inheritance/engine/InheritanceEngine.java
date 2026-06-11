package com.warathah.inheritance.engine;

import com.warathah.inheritance.engine.rules.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Core Islamic inheritance calculation engine (علم الفرائض).
 *
 * Algorithm:
 * 1. Validate wasiyya ≤ 1/3 of remainder.
 * 2. Calculate net estate (gross - debts - funeral - wasiyya).
 * 3. Apply blocking (hajb حجب) rules per madhhab.
 * 4. Calculate fixed shares (furud أصحاب الفروض).
 * 5. Determine residuary heirs (asaba عصبة).
 * 6. Check for awl (عول) — total furud > 1, proportionally reduce.
 * 7. Distribute remainder to asaba; if none, apply radd (رد).
 * 8. Build result with monetary amounts and fiqh explanations.
 */
@Component
public class InheritanceEngine {

    private final Map<Madhhab, RuleSet> ruleSets = Map.of(
        Madhhab.HANAFI,  new HanafiRuleSet(),
        Madhhab.MALIKI,  new MalikiRuleSet(),
        Madhhab.SHAFII,  new ShafiRuleSet(),
        Madhhab.HANBALI, new HanbaliRuleSet()
    );

    public InheritanceResult calculate(InheritanceCaseInput input) {
        validateWasiyya(input);

        BigDecimal netEstate = calculateNetEstate(input);
        RuleSet rules = ruleSets.get(input.getMadhhab());

        // Step 1: Blocking
        Map<HeirType, RuleSet.BlockingResult> blocking = rules.applyBlocking(input);

        // Step 2: Fixed shares
        Map<HeirType, Fraction> furudShares = rules.calculateFurud(input, blocking);

        // Step 3: Asaba order
        List<HeirType> asabaOrder = rules.getAsabaOrder(input, blocking);

        // Step 4: Sum furud
        Fraction totalFurud = furudShares.values().stream()
            .reduce(Fraction.ZERO, Fraction::add);

        // Step 5: Awl (عول)
        boolean awlApplied = false;
        Fraction awlFactor = Fraction.ONE;
        if (totalFurud.isGreaterThan(Fraction.ONE)) {
            awlApplied = true;
            final Fraction factor = Fraction.ONE.divide(totalFurud);
            awlFactor = factor;
            Map<HeirType, Fraction> awled = new LinkedHashMap<>();
            furudShares.forEach((k, v) -> awled.put(k, v.multiply(factor)));
            furudShares = awled;
            totalFurud = Fraction.ONE;
        }

        // Step 6: Assign asaba
        // final copy after potential awl reassignment — safe for lambda capture
        final Map<HeirType, Fraction> finalFurud = furudShares;
        Map<HeirType, Fraction> allShares = new LinkedHashMap<>(finalFurud);
        boolean raddApplied = false;
        Fraction remainder = Fraction.ONE.subtract(totalFurud);

        if (!remainder.isZero()) {
            if (!asabaOrder.isEmpty()) {
                // First eligible asaba group takes remainder
                // Handle ta'seeb: sons + daughters share remainder 2:1
                HeirType firstAsaba = asabaOrder.get(0);
                if (firstAsaba == HeirType.SON && input.getDaughters() > 0) {
                    // Sons and daughters share remainder: 2 parts for son, 1 for daughter
                    int maleParts  = input.getSons() * 2;
                    int femaleParts = input.getDaughters();
                    int totalParts = maleParts + femaleParts;
                    allShares.put(HeirType.SON,
                        remainder.multiply(Fraction.of(maleParts, totalParts)));
                    allShares.put(HeirType.DAUGHTER,
                        remainder.multiply(Fraction.of(femaleParts, totalParts)));
                } else if (firstAsaba == HeirType.FULL_BROTHER && input.getFullSisters() > 0
                        && !isBlocked(HeirType.FULL_SISTER, blocking)) {
                    // Ta'seeb bil-ghayr: full brothers + full sisters share 2:1
                    int mp = input.getFullBrothers() * 2;
                    int fp = input.getFullSisters();
                    int tp = mp + fp;
                    allShares.put(HeirType.FULL_BROTHER,
                        remainder.multiply(Fraction.of(mp, tp)));
                    allShares.put(HeirType.FULL_SISTER,
                        remainder.multiply(Fraction.of(fp, tp)));
                } else if (firstAsaba == HeirType.FATHER && input.getDaughters() > 0) {
                    // Father with daughters: father already has 1/6 fixed; asaba = remainder
                    Fraction existing = allShares.getOrDefault(HeirType.FATHER, Fraction.ZERO);
                    allShares.put(HeirType.FATHER, existing.add(remainder));
                } else if (firstAsaba == HeirType.PATERNAL_GRANDFATHER
                        && input.getDaughters() > 0) {
                    Fraction existing = allShares.getOrDefault(
                        HeirType.PATERNAL_GRANDFATHER, Fraction.ZERO);
                    allShares.put(HeirType.PATERNAL_GRANDFATHER, existing.add(remainder));
                } else {
                    // Asaba ma'a al-ghayr: full/paternal sisters with daughters
                    if ((firstAsaba == HeirType.FULL_SISTER || firstAsaba == HeirType.PATERNAL_SISTER)
                            && (input.getDaughters() > 0 || input.getDaughtersOfSon() > 0)) {
                        allShares.put(firstAsaba, remainder);
                    } else {
                        allShares.put(firstAsaba, remainder);
                    }
                }
            } else {
                // No asaba: Radd (الرد)
                raddApplied = true;
                Map<HeirType, Fraction> raddBase = new LinkedHashMap<>();
                finalFurud.forEach((ht, sh) -> {
                    boolean isSpouse = ht == HeirType.HUSBAND || ht == HeirType.WIFE;
                    if (!isSpouse || rules.applyRaddToSpouse(input)) {
                        raddBase.put(ht, sh);
                    }
                });
                Fraction raddTotal = raddBase.values().stream()
                    .reduce(Fraction.ZERO, Fraction::add);
                if (!raddTotal.isZero()) {
                    raddBase.forEach((ht, sh) -> {
                        Fraction raddAdd = remainder.multiply(sh.divide(raddTotal));
                        allShares.put(ht, finalFurud.get(ht).add(raddAdd));
                    });
                }
            }
        }

        // Step 7: Build result
        long aslAlMasala = computeAsl(allShares);
        List<HeirResult> heirResults = buildResults(input, allShares, blocking, rules, netEstate);
        List<HeirResult> blockedResults = buildBlockedResults(input, blocking);
        String specialNote = detectSpecialCase(input, awlApplied, raddApplied);

        InheritanceResult result = new InheritanceResult();
        result.setMadhhab(input.getMadhhab());
        result.setNetEstate(netEstate);
        result.setAslAlMasala(aslAlMasala);
        result.setAwlApplied(awlApplied);
        result.setAwlFactor(awlFactor);
        result.setRaddApplied(raddApplied);
        result.setHeirs(heirResults);
        result.setBlockedHeirs(blockedResults);
        result.setSpecialCaseNote(specialNote);
        result.setDisclaimer(
            "هذه الحسبة استرشادية ولا تغني عن حكم المحكمة المختصة أو فتوى أهل العلم");
        return result;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void validateWasiyya(InheritanceCaseInput in) {
        BigDecimal wasiyya = nvl(in.getWasiyya());
        if (wasiyya.compareTo(BigDecimal.ZERO) <= 0) return;
        BigDecimal base = nvl(in.getGrossEstate())
            .subtract(nvl(in.getDebts()))
            .subtract(nvl(in.getFuneralCosts()));
        BigDecimal maxWasiyya = base.divide(new BigDecimal("3"), 10, RoundingMode.HALF_UP);
        if (wasiyya.compareTo(maxWasiyya) > 0) {
            throw new IllegalArgumentException(
                String.format("الوصية (%.2f) تتجاوز ثلث التركة (%.2f)", wasiyya, maxWasiyya));
        }
    }

    private BigDecimal calculateNetEstate(InheritanceCaseInput in) {
        return nvl(in.getGrossEstate())
            .subtract(nvl(in.getDebts()))
            .subtract(nvl(in.getFuneralCosts()))
            .subtract(nvl(in.getWasiyya()));
    }

    private BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private long computeAsl(Map<HeirType, Fraction> shares) {
        long lcm = 1;
        for (Fraction f : shares.values()) {
            if (!f.isZero()) lcm = lcm(lcm, f.getDenominator());
        }
        return lcm;
    }

    private long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
    private long lcm(long a, long b) { return a / gcd(a, b) * b; }

    private boolean isBlocked(HeirType ht, Map<HeirType, RuleSet.BlockingResult> blocking) {
        RuleSet.BlockingResult br = blocking.get(ht);
        return br != null && br.blocked();
    }

    private List<HeirResult> buildResults(
            InheritanceCaseInput in,
            Map<HeirType, Fraction> shares,
            Map<HeirType, RuleSet.BlockingResult> blocking,
            RuleSet rules,
            BigDecimal netEstate) {
        List<HeirResult> list = new ArrayList<>();
        for (Map.Entry<HeirType, Fraction> e : shares.entrySet()) {
            HeirType ht = e.getKey();
            Fraction group = e.getValue();
            int count = countOf(in, ht);
            if (count == 0 || group.isZero()) continue;

            Fraction perHeir = count > 1 ? group.divide(Fraction.of(count)) : group;
            BigDecimal amount = netEstate
                .multiply(BigDecimal.valueOf(group.toDouble()))
                .setScale(2, RoundingMode.HALF_UP);

            HeirResult hr = new HeirResult();
            hr.setHeirType(ht);
            hr.setArabicName(arabicName(ht, count));
            hr.setCount(count);
            hr.setClassification(classify(ht));
            hr.setSharePerHeir(perHeir);
            hr.setTotalGroupShare(group);
            hr.setPercentage(group.toDouble() * 100.0);
            hr.setMonetaryAmount(amount);
            hr.setFiqhExplanation(rules.getFiqhExplanation(ht, group, in));
            list.add(hr);
        }
        return list;
    }

    private List<HeirResult> buildBlockedResults(
            InheritanceCaseInput in,
            Map<HeirType, RuleSet.BlockingResult> blocking) {
        List<HeirResult> list = new ArrayList<>();
        blocking.forEach((ht, br) -> {
            if (!br.blocked()) return;
            int count = countOf(in, ht);
            if (count == 0) return;
            HeirResult hr = new HeirResult();
            hr.setHeirType(ht);
            hr.setArabicName(arabicName(ht, count));
            hr.setCount(count);
            hr.setClassification(HeirClassification.MAHJUB);
            hr.setTotalGroupShare(Fraction.ZERO);
            hr.setSharePerHeir(Fraction.ZERO);
            hr.setBlockedBy(br.reason());
            hr.setFiqhExplanation("محجوب: " + br.reason());
            list.add(hr);
        });
        return list;
    }

    private HeirClassification classify(HeirType ht) {
        return switch (ht) {
            case HUSBAND, WIFE, MOTHER, PATERNAL_GRANDMOTHER, MATERNAL_GRANDMOTHER,
                 MATERNAL_BROTHER, MATERNAL_SISTER -> HeirClassification.SAHIB_FARD;
            case FATHER, PATERNAL_GRANDFATHER -> HeirClassification.SAHIB_FARD_AND_ASABA;
            case SON, SON_OF_SON, FULL_BROTHER, PATERNAL_BROTHER,
                 FULL_PATERNAL_UNCLE, SON_OF_FULL_PATERNAL_UNCLE,
                 PATERNAL_PATERNAL_UNCLE, SON_OF_PATERNAL_PATERNAL_UNCLE ->
                HeirClassification.ASABA;
            case DAUGHTER, DAUGHTER_OF_SON, FULL_SISTER, PATERNAL_SISTER ->
                HeirClassification.SAHIB_FARD; // can become asaba — simplified
            default -> HeirClassification.SAHIB_FARD;
        };
    }

    private int countOf(InheritanceCaseInput in, HeirType ht) {
        return switch (ht) {
            case HUSBAND    -> in.getHusbands();
            case WIFE       -> in.getWives();
            case SON        -> in.getSons();
            case DAUGHTER   -> in.getDaughters();
            case SON_OF_SON -> in.getSonsOfSon();
            case DAUGHTER_OF_SON -> in.getDaughtersOfSon();
            case FATHER     -> in.isFatherAlive() ? 1 : 0;
            case MOTHER     -> in.isMotherAlive() ? 1 : 0;
            case PATERNAL_GRANDFATHER -> in.isPaternalGrandfatherAlive() ? 1 : 0;
            case PATERNAL_GRANDMOTHER -> in.getPaternalGrandmothers();
            case MATERNAL_GRANDMOTHER -> in.getMaternalGrandmothers();
            case FULL_BROTHER   -> in.getFullBrothers();
            case FULL_SISTER    -> in.getFullSisters();
            case PATERNAL_BROTHER -> in.getPaternalBrothers();
            case PATERNAL_SISTER  -> in.getPaternalSisters();
            case MATERNAL_BROTHER -> in.getMaternalBrothers();
            case MATERNAL_SISTER  -> in.getMaternalSisters();
            case FULL_PATERNAL_UNCLE -> in.getFullPaternalUncles();
            case SON_OF_FULL_PATERNAL_UNCLE -> in.getSonsOfFullPaternalUncle();
            default -> 0;
        };
    }

    private String arabicName(HeirType ht, int n) {
        return switch (ht) {
            case HUSBAND    -> "الزوج";
            case WIFE       -> n > 1 ? "الزوجات (" + n + ")" : "الزوجة";
            case SON        -> n > 1 ? "الأبناء (" + n + ")" : "الابن";
            case DAUGHTER   -> n > 1 ? "البنات (" + n + ")" : "البنت";
            case SON_OF_SON -> n > 1 ? "أبناء الابن (" + n + ")" : "ابن الابن";
            case DAUGHTER_OF_SON -> n > 1 ? "بنات الابن (" + n + ")" : "بنت الابن";
            case FATHER     -> "الأب";
            case MOTHER     -> "الأم";
            case PATERNAL_GRANDFATHER -> "الجد لأب";
            case PATERNAL_GRANDMOTHER -> "الجدة لأب";
            case MATERNAL_GRANDMOTHER -> "الجدة لأم";
            case FULL_BROTHER   -> n > 1 ? "الإخوة الأشقاء (" + n + ")" : "الأخ الشقيق";
            case FULL_SISTER    -> n > 1 ? "الأخوات الشقيقات (" + n + ")" : "الأخت الشقيقة";
            case PATERNAL_BROTHER -> n > 1 ? "الإخوة لأب (" + n + ")" : "الأخ لأب";
            case PATERNAL_SISTER  -> n > 1 ? "الأخوات لأب (" + n + ")" : "الأخت لأب";
            case MATERNAL_BROTHER -> n > 1 ? "الإخوة لأم (" + n + ")" : "الأخ لأم";
            case MATERNAL_SISTER  -> n > 1 ? "الأخوات لأم (" + n + ")" : "الأخت لأم";
            case FULL_PATERNAL_UNCLE -> n > 1 ? "الأعمام الأشقاء (" + n + ")" : "العم الشقيق";
            case SON_OF_FULL_PATERNAL_UNCLE -> n > 1
                ? "أبناء العم الشقيق (" + n + ")" : "ابن العم الشقيق";
            default -> ht.name();
        };
    }

    private String detectSpecialCase(InheritanceCaseInput in, boolean awl, boolean radd) {
        StringBuilder sb = new StringBuilder();
        boolean hasSpouse = in.getHusbands() > 0 || in.getWives() > 0;
        boolean noDescendant = in.getSons() == 0 && in.getDaughters() == 0
            && in.getSonsOfSon() == 0 && in.getDaughtersOfSon() == 0;
        // Al-umariyyatan
        if (hasSpouse && in.isFatherAlive() && in.isMotherAlive() && noDescendant) {
            sb.append("مسألة العمريتين: الأم تأخذ ثلث الباقي لا ثلث كامل التركة. ");
        }
        if (awl)  sb.append("العول: تجاوزت الفروض مجموع التركة فخُفِّضت نسبياً. ");
        if (radd) sb.append("الرد: رُدَّ الفاضل على أصحاب الفروض. ");
        return sb.toString().trim();
    }
}

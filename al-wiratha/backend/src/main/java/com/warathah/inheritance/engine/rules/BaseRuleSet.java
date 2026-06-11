package com.warathah.inheritance.engine.rules;

import com.warathah.inheritance.engine.Fraction;
import com.warathah.inheritance.engine.HeirType;
import com.warathah.inheritance.engine.InheritanceCaseInput;

import java.util.*;

/**
 * Common Islamic inheritance rules shared across all four Sunni madhhabs (~80% identical).
 * Each madhhab subclass overrides specific differences.
 */
public abstract class BaseRuleSet implements RuleSet {

    @Override
    public Map<HeirType, BlockingResult> applyBlocking(InheritanceCaseInput in) {
        Map<HeirType, BlockingResult> result = new HashMap<>();

        boolean hasSon             = in.getSons() > 0;
        boolean hasSonOfSon        = in.getSonsOfSon() > 0;
        boolean hasMaleDescendant  = hasSon || hasSonOfSon;
        boolean hasDescendant      = hasMaleDescendant || in.getDaughters() > 0 || in.getDaughtersOfSon() > 0;
        boolean hasFather          = in.isFatherAlive();
        boolean hasFullBrother     = in.getFullBrothers() > 0;

        // Son blocks son-of-son
        if (hasSon) {
            result.put(HeirType.SON_OF_SON,
                new BlockingResult(true, HeirType.SON, "الابن يحجب ابن الابن حجب حرمان"));
            result.put(HeirType.DAUGHTER_OF_SON,
                new BlockingResult(true, HeirType.SON, "الابن يحجب بنت الابن حجب حرمان"));
        }

        // Father blocks grandfather and all siblings
        if (hasFather) {
            block(result, HeirType.PATERNAL_GRANDFATHER, HeirType.FATHER, "الأب يحجب الجد");
            block(result, HeirType.FULL_BROTHER,         HeirType.FATHER, "الأب يحجب الأخ الشقيق");
            block(result, HeirType.FULL_SISTER,          HeirType.FATHER, "الأب يحجب الأخت الشقيقة");
            block(result, HeirType.PATERNAL_BROTHER,     HeirType.FATHER, "الأب يحجب الأخ لأب");
            block(result, HeirType.PATERNAL_SISTER,      HeirType.FATHER, "الأب يحجب الأخت لأب");
            block(result, HeirType.MATERNAL_BROTHER,     HeirType.FATHER, "الأب يحجب الأخ لأم");
            block(result, HeirType.MATERNAL_SISTER,      HeirType.FATHER, "الأب يحجب الأخت لأم");
        }

        // Male descendants block uncles
        if (hasMaleDescendant) {
            block(result, HeirType.FULL_PATERNAL_UNCLE,          HeirType.SON, "الابن يحجب العم");
            block(result, HeirType.SON_OF_FULL_PATERNAL_UNCLE,   HeirType.SON, "الابن يحجب ابن العم");
            block(result, HeirType.PATERNAL_PATERNAL_UNCLE,      HeirType.SON, "الابن يحجب العم لأب");
            block(result, HeirType.SON_OF_PATERNAL_PATERNAL_UNCLE, HeirType.SON, "الابن يحجب ابن العم لأب");
        }

        // Grandfather (if not blocked) also blocks uncles
        if (in.isPaternalGrandfatherAlive() && !isBlocked(HeirType.PATERNAL_GRANDFATHER, result)) {
            result.putIfAbsent(HeirType.FULL_PATERNAL_UNCLE,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER, "الجد يحجب العم"));
            result.putIfAbsent(HeirType.SON_OF_FULL_PATERNAL_UNCLE,
                new BlockingResult(true, HeirType.PATERNAL_GRANDFATHER, "الجد يحجب ابن العم"));
        }

        // Full brother blocks paternal brother
        if (hasFullBrother && !isBlocked(HeirType.FULL_BROTHER, result)) {
            result.putIfAbsent(HeirType.PATERNAL_BROTHER,
                new BlockingResult(true, HeirType.FULL_BROTHER, "الأخ الشقيق يحجب الأخ لأب"));
            result.putIfAbsent(HeirType.PATERNAL_SISTER,
                new BlockingResult(true, HeirType.FULL_BROTHER, "الأخ الشقيق يحجب الأخت لأب"));
        }

        // Any descendant blocks maternal siblings
        if (hasDescendant) {
            result.putIfAbsent(HeirType.MATERNAL_BROTHER,
                new BlockingResult(true, HeirType.SON, "الولد يحجب الأخ لأم"));
            result.putIfAbsent(HeirType.MATERNAL_SISTER,
                new BlockingResult(true, HeirType.SON, "الولد يحجب الأخت لأم"));
        }

        // Mother blocks grandmothers
        if (in.isMotherAlive()) {
            block(result, HeirType.PATERNAL_GRANDMOTHER, HeirType.MOTHER, "الأم تحجب الجدة لأب");
            block(result, HeirType.MATERNAL_GRANDMOTHER, HeirType.MOTHER, "الأم تحجب الجدة لأم");
        }

        // Father blocks his own mother (paternal grandmother)
        if (hasFather) {
            result.putIfAbsent(HeirType.PATERNAL_GRANDMOTHER,
                new BlockingResult(true, HeirType.FATHER, "الأب يحجب أمه الجدة لأب"));
        }

        // Allow subclasses to override (e.g. Hanafi grandfather-siblings rule)
        applyMadhhabSpecificBlocking(in, result);
        return result;
    }

    protected void applyMadhhabSpecificBlocking(InheritanceCaseInput in,
                                                  Map<HeirType, BlockingResult> result) {
        // Default: no extra blocking. Override in each madhhab.
    }

    @Override
    public Map<HeirType, Fraction> calculateFurud(InheritanceCaseInput in,
                                                    Map<HeirType, BlockingResult> blocking) {
        Map<HeirType, Fraction> shares = new LinkedHashMap<>();

        boolean hasMaleDescendant = in.getSons() > 0 || in.getSonsOfSon() > 0;
        boolean hasDescendant     = hasMaleDescendant || in.getDaughters() > 0 || in.getDaughtersOfSon() > 0;

        // ── HUSBAND ──────────────────────────────────────────────────────────
        // Quran 4:12: 1/2 without walad, 1/4 with walad
        if (in.getHusbands() > 0) {
            shares.put(HeirType.HUSBAND, hasDescendant ? Fraction.of(1, 4) : Fraction.of(1, 2));
        }

        // ── WIFE / WIVES ─────────────────────────────────────────────────────
        // Quran 4:12: 1/4 without walad, 1/8 with walad (shared equally among all wives)
        if (in.getWives() > 0) {
            shares.put(HeirType.WIFE, hasDescendant ? Fraction.of(1, 8) : Fraction.of(1, 4));
        }

        // ── DAUGHTERS ────────────────────────────────────────────────────────
        // Quran 4:11: 1/2 (one), 2/3 (two+), ta'seeb with son (handled in asaba)
        if (in.getDaughters() > 0 && in.getSons() == 0) {
            shares.put(HeirType.DAUGHTER,
                in.getDaughters() == 1 ? Fraction.of(1, 2) : Fraction.of(2, 3));
        }
        // If sons > 0, daughters are ta'seeb: handled via asaba (2:1 split)

        // ── SON'S DAUGHTER ───────────────────────────────────────────────────
        if (in.getDaughtersOfSon() > 0 && !isBlocked(HeirType.DAUGHTER_OF_SON, blocking)) {
            if (in.getSons() == 0 && in.getSonsOfSon() == 0) {
                if (in.getDaughters() == 0) {
                    // No daughters at all: same as daughter
                    shares.put(HeirType.DAUGHTER_OF_SON,
                        in.getDaughtersOfSon() == 1 ? Fraction.of(1, 2) : Fraction.of(2, 3));
                } else if (in.getDaughters() == 1) {
                    // One daughter took 1/2: bint al-ibn gets takmila 1/6
                    shares.put(HeirType.DAUGHTER_OF_SON, Fraction.of(1, 6));
                }
                // Two+ daughters: bint al-ibn blocked (2/3 already distributed)
            }
        }

        // ── FATHER ───────────────────────────────────────────────────────────
        // Quran 4:11: 1/6 if there is a walad; pure asaba if no walad; 1/6 + asaba with daughters
        if (in.isFatherAlive()) {
            if (hasMaleDescendant) {
                shares.put(HeirType.FATHER, Fraction.of(1, 6));
            } else if (hasDescendant) {
                // daughters only: father = 1/6 fixed; asaba (remainder) added later
                shares.put(HeirType.FATHER, Fraction.of(1, 6));
            }
            // else: pure asaba, no fixed share here
        }

        // ── MOTHER ───────────────────────────────────────────────────────────
        // Quran 4:11: 1/3 unless walad or 2+ siblings present (then 1/6)
        // Special: al-umariyyatan — mother gets 1/3 of remainder when spouse + father present
        if (in.isMotherAlive()) {
            int sibCount = in.getFullBrothers() + in.getFullSisters()
                + in.getPaternalBrothers() + in.getPaternalSisters()
                + in.getMaternalBrothers() + in.getMaternalSisters();
            boolean hasBlockingSiblings = sibCount >= 2;

            if (hasDescendant || hasBlockingSiblings) {
                shares.put(HeirType.MOTHER, Fraction.of(1, 6));
            } else if ((in.getHusbands() > 0 || in.getWives() > 0) && in.isFatherAlive()) {
                // مسألة العمريتين: mother = 1/3 of what remains after spouse
                // Husband case: spouse=1/2, remainder=1/2, mother gets 1/3 of 1/2 = 1/6
                // Wife case: spouse=1/4, remainder=3/4, mother gets 1/3 of 3/4 = 1/4
                // We store the fraction of the whole estate
                Fraction spouseShare = in.getHusbands() > 0 ? Fraction.of(1, 2) : Fraction.of(1, 4);
                Fraction remainderAfterSpouse = Fraction.ONE.subtract(spouseShare);
                shares.put(HeirType.MOTHER, remainderAfterSpouse.divide(Fraction.of(3)));
            } else {
                shares.put(HeirType.MOTHER, Fraction.of(1, 3));
            }
        }

        // ── PATERNAL GRANDFATHER ─────────────────────────────────────────────
        // Like father but only when father is absent; madhhab differences with siblings
        if (in.isPaternalGrandfatherAlive() && !isBlocked(HeirType.PATERNAL_GRANDFATHER, blocking)) {
            if (hasMaleDescendant) {
                shares.put(HeirType.PATERNAL_GRANDFATHER, Fraction.of(1, 6));
            } else if (hasDescendant) {
                shares.put(HeirType.PATERNAL_GRANDFATHER, Fraction.of(1, 6));
            }
            // else: pure asaba
        }

        // ── GRANDMOTHERS ─────────────────────────────────────────────────────
        // 1/6 shared between all eligible grandmothers
        boolean pgmEligible = in.getPaternalGrandmothers() > 0
            && !isBlocked(HeirType.PATERNAL_GRANDMOTHER, blocking);
        boolean mgmEligible = in.getMaternalGrandmothers() > 0
            && !isBlocked(HeirType.MATERNAL_GRANDMOTHER, blocking);
        int gmLines = (pgmEligible ? 1 : 0) + (mgmEligible ? 1 : 0);
        if (gmLines > 0) {
            Fraction totalGm = Fraction.of(1, 6);
            Fraction perLine = gmLines == 2 ? Fraction.of(1, 12) : totalGm;
            if (pgmEligible) shares.put(HeirType.PATERNAL_GRANDMOTHER, perLine);
            if (mgmEligible) shares.put(HeirType.MATERNAL_GRANDMOTHER, perLine);
        }

        // ── FULL SISTERS (as ashab furud) ────────────────────────────────────
        boolean fullBroNotBlocked = in.getFullBrothers() > 0
            && !isBlocked(HeirType.FULL_BROTHER, blocking);
        boolean fullSisNotBlocked = in.getFullSisters() > 0
            && !isBlocked(HeirType.FULL_SISTER, blocking);

        if (fullSisNotBlocked && !fullBroNotBlocked && !hasMaleDescendant && !in.isFatherAlive()
                && !in.isPaternalGrandfatherAlive()) {
            if (hasDescendant) {
                // Asaba ma'a al-ghayr with daughters — handled in asaba
            } else {
                shares.put(HeirType.FULL_SISTER,
                    in.getFullSisters() == 1 ? Fraction.of(1, 2) : Fraction.of(2, 3));
            }
        }

        // ── PATERNAL SISTERS (as ashab furud) ────────────────────────────────
        boolean patBroNotBlocked = in.getPaternalBrothers() > 0
            && !isBlocked(HeirType.PATERNAL_BROTHER, blocking);
        boolean patSisNotBlocked = in.getPaternalSisters() > 0
            && !isBlocked(HeirType.PATERNAL_SISTER, blocking);

        if (patSisNotBlocked && !patBroNotBlocked && !fullBroNotBlocked
                && !hasMaleDescendant && !in.isFatherAlive()
                && !in.isPaternalGrandfatherAlive()) {
            if (hasDescendant) {
                // Asaba ma'a al-ghayr — handled in asaba
            } else if (in.getDaughters() == 1 && !fullSisNotBlocked) {
                // Takmila: one daughter took 1/2, paternal sisters get 1/6 to reach 2/3
                shares.put(HeirType.PATERNAL_SISTER, Fraction.of(1, 6));
            } else if (in.getDaughters() == 0) {
                shares.put(HeirType.PATERNAL_SISTER,
                    in.getPaternalSisters() == 1 ? Fraction.of(1, 2) : Fraction.of(2, 3));
            }
        }

        // ── MATERNAL SIBLINGS ─────────────────────────────────────────────────
        // Quran 4:12: 1/6 (one), 1/3 (two+), shared equally male=female
        if (!isBlocked(HeirType.MATERNAL_BROTHER, blocking)
                || !isBlocked(HeirType.MATERNAL_SISTER, blocking)) {
            int matCount =
                (isBlocked(HeirType.MATERNAL_BROTHER, blocking) ? 0 : in.getMaternalBrothers()) +
                (isBlocked(HeirType.MATERNAL_SISTER,  blocking) ? 0 : in.getMaternalSisters());
            if (matCount > 0) {
                Fraction matTotal = matCount == 1 ? Fraction.of(1, 6) : Fraction.of(1, 3);
                int mb = isBlocked(HeirType.MATERNAL_BROTHER, blocking) ? 0 : in.getMaternalBrothers();
                int ms = isBlocked(HeirType.MATERNAL_SISTER,  blocking) ? 0 : in.getMaternalSisters();
                if (mb > 0)
                    shares.put(HeirType.MATERNAL_BROTHER,
                        matTotal.multiply(Fraction.of(mb, matCount)));
                if (ms > 0)
                    shares.put(HeirType.MATERNAL_SISTER,
                        matTotal.multiply(Fraction.of(ms, matCount)));
            }
        }

        return shares;
    }

    @Override
    public List<HeirType> getAsabaOrder(InheritanceCaseInput in,
                                         Map<HeirType, BlockingResult> blocking) {
        List<HeirType> asaba = new ArrayList<>();

        // Sons (daughters are ta'seeb with sons)
        if (in.getSons() > 0) asaba.add(HeirType.SON);
        // Son's son (if no son)
        if (in.getSons() == 0 && in.getSonsOfSon() > 0
                && !isBlocked(HeirType.SON_OF_SON, blocking))
            asaba.add(HeirType.SON_OF_SON);
        // Father as pure asaba (no descendants)
        boolean hasDescendant = in.getSons() > 0 || in.getDaughters() > 0
            || in.getSonsOfSon() > 0 || in.getDaughtersOfSon() > 0;
        if (in.isFatherAlive() && !hasDescendant) asaba.add(HeirType.FATHER);
        // Grandfather as pure asaba (no father, no descendants)
        if (in.isPaternalGrandfatherAlive()
                && !isBlocked(HeirType.PATERNAL_GRANDFATHER, blocking)
                && !in.isFatherAlive() && !hasDescendant)
            asaba.add(HeirType.PATERNAL_GRANDFATHER);
        // Full brothers (+ ta'seeb for full sisters)
        if (in.getFullBrothers() > 0 && !isBlocked(HeirType.FULL_BROTHER, blocking))
            asaba.add(HeirType.FULL_BROTHER);
        // Paternal brothers
        if (in.getPaternalBrothers() > 0 && !isBlocked(HeirType.PATERNAL_BROTHER, blocking))
            asaba.add(HeirType.PATERNAL_BROTHER);
        // Full paternal uncles
        if (in.getFullPaternalUncles() > 0 && !isBlocked(HeirType.FULL_PATERNAL_UNCLE, blocking))
            asaba.add(HeirType.FULL_PATERNAL_UNCLE);
        // Sons of full paternal uncles
        if (in.getSonsOfFullPaternalUncle() > 0
                && !isBlocked(HeirType.SON_OF_FULL_PATERNAL_UNCLE, blocking))
            asaba.add(HeirType.SON_OF_FULL_PATERNAL_UNCLE);

        return asaba;
    }

    @Override
    public String getFiqhExplanation(HeirType ht, Fraction share, InheritanceCaseInput in) {
        return switch (ht) {
            case HUSBAND -> share.equals(Fraction.of(1, 2))
                ? "الزوج: فرضه النصف عند عدم الفرع الوارث — ﴿وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ﴾"
                : "الزوج: فرضه الربع لوجود الفرع الوارث — ﴿فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ﴾";
            case WIFE -> share.equals(Fraction.of(1, 4))
                ? "الزوجة: فرضها الربع عند عدم الفرع الوارث — ﴿وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌ﴾"
                : "الزوجة: فرضها الثمن لوجود الفرع الوارث — ﴿فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم﴾";
            case SON -> "الابن: عاصب بالنفس، يأخذ الباقي بعد أصحاب الفروض، وللذكر مثل حظ الأنثيين مع البنت";
            case DAUGHTER -> in.getSons() > 0
                ? "البنت: عاصبة مع الغير مع الابن — ﴿لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ﴾"
                : (in.getDaughters() == 1
                    ? "البنت الواحدة: فرضها النصف — ﴿وَإِن كَانَت وَاحِدَةً فَلَهَا النِّصْفُ﴾"
                    : "البنات الأكثر من واحدة: فرضهن الثلثان — ﴿فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ﴾");
            case FATHER -> "الأب: يأخذ السدس فرضاً مع الفرع الوارث، والسدس فرضاً والباقي تعصيباً مع الفرع المؤنث، أو الكل تعصيباً — ﴿وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ﴾";
            case MOTHER -> "الأم: الثلث مع عدم الفرع الوارث وعدم جمع الإخوة، والسدس مع وجود أحدهما";
            case PATERNAL_GRANDFATHER -> "الجد الصحيح: يقوم مقام الأب عند عدمه في أخذ الميراث";
            case PATERNAL_GRANDMOTHER, MATERNAL_GRANDMOTHER -> "الجدة: فرضها السدس مع عدم الأم";
            case FULL_BROTHER -> "الأخ الشقيق: عاصب بالنفس عند عدم الابن والأب";
            case FULL_SISTER -> in.getDaughters() > 0
                ? "الأخت الشقيقة: عاصبة مع الغير مع البنت — تأخذ ما بقي بعد أصحاب الفروض"
                : (in.getFullSisters() == 1 ? "الأخت الشقيقة الواحدة: فرضها النصف" : "الأخوات الشقيقات: فرضهن الثلثان");
            case PATERNAL_BROTHER -> "الأخ لأب: عاصب بالنفس عند عدم الأخ الشقيق والأب والابن";
            case PATERNAL_SISTER -> "الأخت لأب: تأخذ السدس تكملةً للثلثين مع بنت واحدة، أو النصف/الثلثين في غيابهم";
            case MATERNAL_BROTHER, MATERNAL_SISTER -> "أخوة الأم: السدس للواحد، والثلث لما زاد، يشتركون بالتساوي — ﴿وَإِن كَانَ رَجُلٌ يُورَثُ كَلَالَةً﴾";
            case FULL_PATERNAL_UNCLE -> "العم الشقيق: عاصب بالنفس في الدرجة الخامسة من العصبة";
            case SON_OF_FULL_PATERNAL_UNCLE -> "ابن العم الشقيق: عاصب بالنفس في الدرجة السادسة";
            default -> "يرث وفق أحكام الفريضة الشرعية في المذهب المختار";
        };
    }

    protected boolean isBlocked(HeirType ht, Map<HeirType, BlockingResult> blocking) {
        BlockingResult br = blocking.get(ht);
        return br != null && br.blocked();
    }

    private void block(Map<HeirType, BlockingResult> result, HeirType blocked,
                       HeirType blocker, String reason) {
        result.put(blocked, new BlockingResult(true, blocker, reason));
    }
}

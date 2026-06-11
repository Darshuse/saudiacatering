package com.warathah.inheritance.engine.rules;

import com.warathah.inheritance.engine.Fraction;
import com.warathah.inheritance.engine.HeirType;
import com.warathah.inheritance.engine.InheritanceCaseInput;

import java.util.List;
import java.util.Map;

public interface RuleSet {

    record BlockingResult(boolean blocked, HeirType blockedBy, String reason) {}

    Map<HeirType, BlockingResult> applyBlocking(InheritanceCaseInput input);

    Map<HeirType, Fraction> calculateFurud(InheritanceCaseInput input,
                                            Map<HeirType, BlockingResult> blocking);

    List<HeirType> getAsabaOrder(InheritanceCaseInput input,
                                  Map<HeirType, BlockingResult> blocking);

    boolean applyRaddToSpouse(InheritanceCaseInput input);

    boolean dhawuArhamInherit(InheritanceCaseInput input);

    String getFiqhExplanation(HeirType heirType, Fraction share, InheritanceCaseInput input);
}

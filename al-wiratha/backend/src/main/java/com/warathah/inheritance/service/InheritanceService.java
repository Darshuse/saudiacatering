package com.warathah.inheritance.service;

import com.warathah.inheritance.engine.InheritanceCaseInput;
import com.warathah.inheritance.engine.InheritanceEngine;
import com.warathah.inheritance.engine.InheritanceResult;
import org.springframework.stereotype.Service;

@Service
public class InheritanceService {

    private final InheritanceEngine engine;

    public InheritanceService(InheritanceEngine engine) {
        this.engine = engine;
    }

    public InheritanceResult calculate(InheritanceCaseInput input) {
        return engine.calculate(input);
    }
}

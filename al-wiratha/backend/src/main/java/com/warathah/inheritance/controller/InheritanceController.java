package com.warathah.inheritance.controller;

import com.warathah.inheritance.engine.InheritanceCaseInput;
import com.warathah.inheritance.engine.InheritanceResult;
import com.warathah.inheritance.service.InheritanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inheritance")
@Tag(name = "Inheritance", description = "Islamic inheritance calculation (علم الفرائض)")
public class InheritanceController {

    private final InheritanceService service;

    public InheritanceController(InheritanceService service) {
        this.service = service;
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate inheritance shares",
               description = "Calculates Islamic inheritance according to the selected madhhab. No authentication required.")
    public ResponseEntity<InheritanceResult> calculate(
            @Valid @RequestBody InheritanceCaseInput input) {
        return ResponseEntity.ok(service.calculate(input));
    }
}

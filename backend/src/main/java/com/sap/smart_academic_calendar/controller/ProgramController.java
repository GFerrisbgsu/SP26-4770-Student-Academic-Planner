package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.ProgramDTO;
import com.sap.smart_academic_calendar.service.ProgramService;

/**
 * REST endpoints for degree program information and requirements.
 */
@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    /**
     * GET /api/programs — list all programs (summary, no nested hierarchy).
     */
    @GetMapping
    public ResponseEntity<List<ProgramDTO>> getAllPrograms() {
        return ResponseEntity.ok(programService.getAllPrograms());
    }

    /**
     * GET /api/programs/{id} — full program with categories → groups → options → courses.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProgramDTO> getProgramById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(programService.getProgramById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/programs/name/{name} — full program lookup by name.
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<ProgramDTO> getProgramByName(@PathVariable String name) {
        try {
            return ResponseEntity.ok(programService.getProgramByName(name));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

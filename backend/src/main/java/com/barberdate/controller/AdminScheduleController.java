package com.barberdate.controller;

import com.barberdate.dto.admin.AdminScheduleUpdateRequest;
import com.barberdate.dto.admin.AdminWeekScheduleResponse;
import com.barberdate.service.WeeklyScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/schedules")
public class AdminScheduleController {

    private final WeeklyScheduleService weeklyScheduleService;

    public AdminScheduleController(WeeklyScheduleService weeklyScheduleService) {
        this.weeklyScheduleService = weeklyScheduleService;
    }

    @GetMapping("/week")
    public ResponseEntity<AdminWeekScheduleResponse> getCurrentWeekSchedule() {
        return ResponseEntity.ok(weeklyScheduleService.getAdminWeekSchedule());
    }

    @PutMapping("/day")
    public ResponseEntity<AdminWeekScheduleResponse> updateDaySchedule(
        @Valid @RequestBody AdminScheduleUpdateRequest request
    ) {
        return ResponseEntity.ok(weeklyScheduleService.updateDaySchedule(request));
    }

    @PostMapping("/release")
    public ResponseEntity<AdminWeekScheduleResponse> setReleaseStatus(
        @RequestParam(defaultValue = "true") boolean released
    ) {
        return ResponseEntity.ok(weeklyScheduleService.setReleaseStatus(released));
    }
}

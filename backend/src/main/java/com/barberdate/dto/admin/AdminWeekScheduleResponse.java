package com.barberdate.dto.admin;

import java.time.LocalDate;
import java.util.List;

public record AdminWeekScheduleResponse(
    LocalDate weekStart,
    LocalDate weekEnd,
    boolean released,
    List<AdminScheduleDayResponse> days
) {
}

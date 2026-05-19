package com.barberdate.dto.admin;

import java.time.LocalDate;

public record AdminDashboardResponse(
    LocalDate weekStart,
    LocalDate weekEnd,
    boolean released,
    long totalWeekAppointments,
    long todayAppointments,
    long availableSlots
) {
}

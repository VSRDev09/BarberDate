package com.barberdate.dto.admin;

import java.time.LocalDate;
import java.util.List;

public record AdminAppointmentsByDayResponse(
    String dayOfWeek,
    LocalDate date,
    List<AdminAppointmentResponse> appointments
) {
}

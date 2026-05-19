package com.barberdate.dto.admin;

import java.time.LocalDate;
import java.time.LocalTime;

public record AdminScheduleDayResponse(
    String dayOfWeek,
    LocalDate date,
    LocalTime startHour,
    LocalTime endHour,
    boolean released,
    long totalSlots,
    long bookedSlots,
    long availableSlots
) {
}

package com.barberdate.dto.client;

import com.barberdate.dto.common.TimeSlotResponse;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ClientAgendaDayResponse(
    String dayOfWeek,
    LocalDate date,
    LocalTime startHour,
    LocalTime endHour,
    List<TimeSlotResponse> availableSlots,
    List<TimeSlotResponse> occupiedSlots
) {
}

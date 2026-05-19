package com.barberdate.dto.common;

import java.time.LocalTime;

public record TimeSlotResponse(
    Long id,
    LocalTime startTime,
    LocalTime endTime,
    String status,
    String clientName
) {
}

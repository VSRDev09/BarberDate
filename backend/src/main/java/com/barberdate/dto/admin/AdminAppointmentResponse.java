package com.barberdate.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record AdminAppointmentResponse(
    Long id,
    String clientName,
    String clientPhone,
    String serviceName,
    BigDecimal servicePrice,
    LocalDate appointmentDate,
    LocalTime appointmentTime,
    String status
) {
}

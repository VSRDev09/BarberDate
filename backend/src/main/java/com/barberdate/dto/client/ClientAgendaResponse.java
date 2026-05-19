package com.barberdate.dto.client;

import com.barberdate.dto.common.ServiceResponse;
import java.time.LocalDate;
import java.util.List;

public record ClientAgendaResponse(
    LocalDate weekStart,
    LocalDate weekEnd,
    boolean released,
    String message,
    List<ServiceResponse> services,
    List<ClientAgendaDayResponse> days
) {
}

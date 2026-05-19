package com.barberdate.dto.client;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ClientAppointmentRequest(
    @NotBlank(message = "Nome é obrigatório")
    String name,
    @NotBlank(message = "Telefone é obrigatório")
    @Pattern(regexp = "^[0-9()+\\-\\s]{8,20}$", message = "Telefone inválido")
    String phone,
    @NotNull(message = "Serviço é obrigatório")
    Long serviceId,
    @NotNull(message = "Horário é obrigatório")
    Long slotId
) {
}

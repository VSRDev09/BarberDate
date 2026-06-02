package com.barberdate.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdminScheduleUpdateRequest(

    @NotBlank(message = "Dia da semana é obrigatório")
    String dayOfWeek,

    @Pattern(
        regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
        message = "Hora inicial inválida"
    )
    String startHour,

    @Pattern(
        regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
        message = "Hora final inválida"
    )
    String endHour,

    @Pattern(
        regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
        message = "Início do almoço inválido"
    )
    String lunchStart,

    @Pattern(
        regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
        message = "Fim do almoço inválido"
    )
    String lunchEnd,

    boolean dayOff

) {
}

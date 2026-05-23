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

    boolean dayOff

) {
}
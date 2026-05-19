package com.barberdate.dto.common;

import java.math.BigDecimal;

public record ServiceResponse(
    Long id,
    String name,
    BigDecimal price,
    Integer durationMinutes
) {
}

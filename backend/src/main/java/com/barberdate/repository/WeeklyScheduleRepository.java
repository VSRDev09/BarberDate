package com.barberdate.repository;

import com.barberdate.domain.entity.WeeklySchedule;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeeklyScheduleRepository extends JpaRepository<WeeklySchedule, Long> {

    boolean existsByWeekStart(LocalDate weekStart);

    @EntityGraph(attributePaths = "slots")
    List<WeeklySchedule> findByWeekStart(LocalDate weekStart);

    @EntityGraph(attributePaths = "slots")
    Optional<WeeklySchedule> findByWeekStartAndDayOfWeek(LocalDate weekStart, DayOfWeek dayOfWeek);

    Optional<WeeklySchedule> findTopByWeekStartBeforeOrderByWeekStartDesc(LocalDate weekStart);
}

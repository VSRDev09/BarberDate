package com.barberdate.repository;

import com.barberdate.domain.entity.AvailableTimeSlot;
import com.barberdate.domain.entity.WeeklySchedule;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface AvailableTimeSlotRepository extends JpaRepository<AvailableTimeSlot, Long> {

    List<AvailableTimeSlot> findByWeeklyScheduleIn(Collection<WeeklySchedule> schedules);

    List<AvailableTimeSlot> findBySlotDateBetween(LocalDate startDate, LocalDate endDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select slot from AvailableTimeSlot slot where slot.id = :id")
    Optional<AvailableTimeSlot> findWithLockById(@Param("id") Long id);
}

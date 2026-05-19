package com.barberdate.repository;

import com.barberdate.domain.entity.Appointment;
import com.barberdate.domain.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsBySlotId(Long slotId);

    boolean existsBySlotIdAndStatus(Long slotId, AppointmentStatus status);

    List<Appointment> findByAppointmentDateAndStatusOrderByAppointmentTimeAsc(LocalDate appointmentDate, AppointmentStatus status);

    List<Appointment> findByAppointmentDateBetweenAndStatusOrderByAppointmentDateAscAppointmentTimeAsc(
        LocalDate startDate,
        LocalDate endDate,
        AppointmentStatus status
    );

    List<Appointment> findByClientNameIgnoreCaseAndClientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(
        String clientName,
        String clientPhone
    );
}

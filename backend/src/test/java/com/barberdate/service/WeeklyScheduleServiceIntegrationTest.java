package com.barberdate.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.barberdate.domain.entity.Appointment;
import com.barberdate.domain.entity.ServiceEntity;
import com.barberdate.dto.admin.AdminScheduleUpdateRequest;
import com.barberdate.domain.entity.WeeklySchedule;
import com.barberdate.domain.enums.AppointmentStatus;
import com.barberdate.repository.AppointmentRepository;
import com.barberdate.repository.WeeklyScheduleRepository;
import com.barberdate.repository.ServiceEntityRepository;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class WeeklyScheduleServiceIntegrationTest {

    @Autowired
    private WeeklyScheduleService weeklyScheduleService;

    @Autowired
    private WeeklyScheduleRepository weeklyScheduleRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ServiceEntityRepository serviceEntityRepository;

    @Test
    void shouldGenerateFortyFiveMinuteSlotsWithoutCrossingLunchBreak() {
        weeklyScheduleService.updateDaySchedule(
                new AdminScheduleUpdateRequest(
                        "MONDAY",
                        "08:00",
                        "18:00",
                        "12:00",
                        "13:00",
                        false));

        WeeklySchedule monday = weeklyScheduleRepository
                .findByWeekStartAndDayOfWeek(
                        weeklyScheduleService.getCurrentWeekStart(),
                        DayOfWeek.MONDAY)
                .orElseThrow();

        List<LocalTime> startTimes = monday.getSlots().stream()
                .map(slot -> slot.getStartTime())
                .toList();

        assertThat(startTimes).containsExactly(
                LocalTime.of(8, 0),
                LocalTime.of(8, 45),
                LocalTime.of(9, 30),
                LocalTime.of(10, 15),
                LocalTime.of(11, 0),
                LocalTime.of(13, 0),
                LocalTime.of(13, 45),
                LocalTime.of(14, 30),
                LocalTime.of(15, 15),
                LocalTime.of(16, 0),
                LocalTime.of(16, 45));

        assertThat(monday.getSlots())
                .allSatisfy(slot ->
                        assertThat(java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes())
                                .isEqualTo(45));
    }

    @Test
    void shouldAcceptScheduleWithoutLunchBreak() {
        weeklyScheduleService.updateDaySchedule(
                new AdminScheduleUpdateRequest(
                        "TUESDAY",
                        "09:00",
                        "18:00",
                        null,
                        null,
                        false));

        WeeklySchedule tuesday = weeklyScheduleRepository
                .findByWeekStartAndDayOfWeek(
                        weeklyScheduleService.getCurrentWeekStart(),
                        DayOfWeek.TUESDAY)
                .orElseThrow();

        assertThat(tuesday.getLunchStart()).isNull();
        assertThat(tuesday.getLunchEnd()).isNull();
        assertThat(tuesday.getSlots()).isNotEmpty();
    }

    @Test
    void shouldRejectLunchBreakThatIntersectsActiveAppointment() {
        weeklyScheduleService.updateDaySchedule(
                new AdminScheduleUpdateRequest(
                        "WEDNESDAY",
                        "09:00",
                        "18:00",
                        null,
                        null,
                        false));

        WeeklySchedule wednesday = weeklyScheduleRepository
                .findByWeekStartAndDayOfWeek(
                        weeklyScheduleService.getCurrentWeekStart(),
                        DayOfWeek.WEDNESDAY)
                .orElseThrow();

        var bookedSlot = wednesday.getSlots().stream()
                .filter(slot -> slot.getStartTime().equals(LocalTime.of(12, 0)))
                .findFirst()
                .orElseThrow();

        ServiceEntity service = serviceEntityRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc()
                .getFirst();

        appointmentRepository.save(
                Appointment.builder()
                        .slot(bookedSlot)
                        .service(service)
                        .clientName("Cliente Teste")
                        .clientPhone("11999999999")
                        .appointmentDate(bookedSlot.getSlotDate())
                        .appointmentTime(bookedSlot.getStartTime())
                        .status(AppointmentStatus.SCHEDULED)
                        .build());

        assertThatThrownBy(() -> weeklyScheduleService.updateDaySchedule(
                new AdminScheduleUpdateRequest(
                        "WEDNESDAY",
                        "09:00",
                        "18:00",
                        "12:00",
                        "13:00",
                        false)))
                .isInstanceOf(com.barberdate.exception.BusinessException.class)
                .hasMessageContaining("intervalo do almoço");

        WeeklySchedule reloaded = weeklyScheduleRepository
                .findByWeekStartAndDayOfWeek(
                        weeklyScheduleService.getCurrentWeekStart(),
                        DayOfWeek.WEDNESDAY)
                .orElseThrow();

        assertThat(reloaded.getLunchStart()).isNull();
        assertThat(reloaded.getLunchEnd()).isNull();
        assertThat(appointmentRepository.findAll()).hasSize(1);
    }
}

package com.barberdate.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.barberdate.domain.entity.Appointment;
import com.barberdate.domain.entity.AvailableTimeSlot;
import com.barberdate.domain.entity.ServiceEntity;
import com.barberdate.domain.entity.WeeklySchedule;
import com.barberdate.domain.enums.AppointmentStatus;
import com.barberdate.dto.admin.AdminScheduleUpdateRequest;
import com.barberdate.dto.common.AppointmentCreatedResponse;
import com.barberdate.dto.client.ClientAppointmentRequest;
import com.barberdate.repository.AppointmentRepository;
import com.barberdate.repository.AvailableTimeSlotRepository;
import com.barberdate.repository.ServiceEntityRepository;
import com.barberdate.repository.WeeklyScheduleRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class AppointmentServiceAdminCancellationIntegrationTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private WeeklyScheduleService weeklyScheduleService;

    @Autowired
    private WeeklyScheduleRepository weeklyScheduleRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AvailableTimeSlotRepository availableTimeSlotRepository;

    @Autowired
    private ServiceEntityRepository serviceEntityRepository;

    @Test
    void shouldCancelAppointmentByAdminAndFreeSlotImmediately() {
        weeklyScheduleService.updateDaySchedule(
                new AdminScheduleUpdateRequest(
                        "THURSDAY",
                        "09:00",
                        "18:00",
                        null,
                        null,
                        false));
        weeklyScheduleService.setReleaseStatus(true);

        WeeklySchedule thursday = weeklyScheduleRepository
                .findByWeekStartAndDayOfWeek(
                        weeklyScheduleService.getCurrentWeekStart(),
                        DayOfWeek.THURSDAY)
                .orElseThrow();

        AvailableTimeSlot bookedSlot = thursday.getSlots().stream()
                .filter(slot -> slot.getStartTime().equals(LocalTime.of(12, 45)))
                .findFirst()
                .orElseThrow();

        ServiceEntity service = serviceEntityRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().getFirst();

        AppointmentCreatedResponse createdAppointment = appointmentService.createAppointment(
                new ClientAppointmentRequest(
                        "Cliente Teste",
                        "(11) 99999-9999",
                        service.getId(),
                        bookedSlot.getId()));

        assertThat(createdAppointment.appointmentId()).isNotNull();
        assertThat(availableTimeSlotRepository.findById(bookedSlot.getId()).orElseThrow().getAvailable()).isFalse();

        appointmentService.cancelAppointmentByAdmin(createdAppointment.appointmentId());

        Appointment cancelledAppointment = appointmentRepository.findById(createdAppointment.appointmentId()).orElseThrow();
        AvailableTimeSlot reloadedSlot = availableTimeSlotRepository.findById(bookedSlot.getId()).orElseThrow();
        List<Appointment> scheduledAppointments = appointmentRepository
                .findByAppointmentDateAndStatusOrderByAppointmentTimeAsc(
                        cancelledAppointment.getAppointmentDate(),
                        AppointmentStatus.SCHEDULED);

        assertThat(cancelledAppointment.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
        assertThat(cancelledAppointment.getCancelledAt()).isNotNull();
        assertThat(reloadedSlot.getAvailable()).isTrue();
        assertThat(scheduledAppointments).isEmpty();
    }

    @Test
    void shouldRemoveCancelledAppointmentFromWeeklyAdminList() {
        weeklyScheduleService.updateDaySchedule(
                new AdminScheduleUpdateRequest(
                        "FRIDAY",
                        "09:00",
                        "18:00",
                        null,
                        null,
                        false));
        weeklyScheduleService.setReleaseStatus(true);

        WeeklySchedule friday = weeklyScheduleRepository
                .findByWeekStartAndDayOfWeek(
                        weeklyScheduleService.getCurrentWeekStart(),
                        DayOfWeek.FRIDAY)
                .orElseThrow();

        AvailableTimeSlot bookedSlot = friday.getSlots().stream()
                .filter(slot -> slot.getStartTime().equals(LocalTime.of(9, 0)))
                .findFirst()
                .orElseThrow();

        ServiceEntity service = serviceEntityRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().getFirst();

        AppointmentCreatedResponse createdAppointment = appointmentService.createAppointment(
                new ClientAppointmentRequest(
                        "Cliente Painel",
                        "(11) 98888-8888",
                        service.getId(),
                        bookedSlot.getId()));

        assertThat(appointmentService.getCurrentWeekAppointmentsForAdmin())
                .flatExtracting(day -> day.appointments())
                .anyMatch(appointment -> appointment.id().equals(createdAppointment.appointmentId()));

        appointmentService.cancelAppointmentByAdmin(createdAppointment.appointmentId());

        assertThat(appointmentService.getCurrentWeekAppointmentsForAdmin())
                .flatExtracting(day -> day.appointments())
                .noneMatch(appointment -> appointment.id().equals(createdAppointment.appointmentId()));
    }
}

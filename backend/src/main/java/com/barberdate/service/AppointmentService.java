package com.barberdate.service;

import com.barberdate.domain.entity.Appointment;
import com.barberdate.domain.entity.AvailableTimeSlot;
import com.barberdate.domain.entity.ServiceEntity;
import com.barberdate.domain.entity.WeeklySchedule;
import com.barberdate.domain.enums.AppointmentStatus;
import com.barberdate.dto.admin.AdminAppointmentResponse;
import com.barberdate.dto.admin.AdminAppointmentsByDayResponse;
import com.barberdate.dto.admin.AdminDashboardResponse;
import com.barberdate.dto.client.CancelAppointmentRequest;
import com.barberdate.dto.client.ClientAppointmentRequest;
import com.barberdate.dto.client.ClientAppointmentResponse;
import com.barberdate.dto.common.AppointmentCreatedResponse;
import com.barberdate.exception.BusinessException;
import com.barberdate.exception.ResourceNotFoundException;
import com.barberdate.exception.UnauthorizedActionException;
import com.barberdate.repository.AppointmentRepository;
import com.barberdate.repository.AvailableTimeSlotRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AvailableTimeSlotRepository availableTimeSlotRepository;
    private final ServiceCatalogService serviceCatalogService;
    private final WeeklyScheduleService weeklyScheduleService;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        AvailableTimeSlotRepository availableTimeSlotRepository,
        ServiceCatalogService serviceCatalogService,
        WeeklyScheduleService weeklyScheduleService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.availableTimeSlotRepository = availableTimeSlotRepository;
        this.serviceCatalogService = serviceCatalogService;
        this.weeklyScheduleService = weeklyScheduleService;
    }

    @Transactional
    public AppointmentCreatedResponse createAppointment(ClientAppointmentRequest request) {
        weeklyScheduleService.ensureCurrentWeekSchedules();

        if (!weeklyScheduleService.isCurrentWeekReleased()) {
            throw new BusinessException("Lista de agendamento não disponibilizada pelo barbeiro");
        }

        ServiceEntity service = serviceCatalogService.getActiveServiceById(request.serviceId());
        AvailableTimeSlot slot = availableTimeSlotRepository.findWithLockById(request.slotId())
            .orElseThrow(() -> new ResourceNotFoundException("Horário não encontrado"));

        validateBookableSlot(slot);

        Appointment appointment = Appointment.builder()
            .slot(slot)
            .service(service)
            .clientName(normalizeName(request.name()))
            .clientPhone(normalizePhone(request.phone()))
            .appointmentDate(slot.getSlotDate())
            .appointmentTime(slot.getStartTime())
            .status(AppointmentStatus.SCHEDULED)
            .build();

        slot.setAvailable(false);
        availableTimeSlotRepository.save(slot);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new AppointmentCreatedResponse(savedAppointment.getId(), "Agendamento confirmado com sucesso");
    }

    @Transactional(readOnly = true)
    public List<ClientAppointmentResponse> getClientAppointments(String name, String phone) {
        return appointmentRepository.findByClientNameIgnoreCaseAndClientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(
                normalizeName(name),
                normalizePhone(phone)
            )
            .stream()
            .map(this::toClientResponse)
            .toList();
    }

    @Transactional
    public void cancelAppointment(Long appointmentId, CancelAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BusinessException("Este agendamento já foi cancelado");
        }

        if (!appointment.getClientPhone().equals(normalizePhone(request.phone()))
            || !appointment.getClientName().equalsIgnoreCase(normalizeName(request.name()))) {
            throw new UnauthorizedActionException("Você só pode cancelar seus próprios agendamentos");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.getSlot().setAvailable(true);

        appointmentRepository.save(appointment);
        availableTimeSlotRepository.save(appointment.getSlot());
    }

    @Transactional
    public List<AdminAppointmentsByDayResponse> getCurrentWeekAppointmentsForAdmin() {
        List<WeeklySchedule> schedules = weeklyScheduleService.ensureCurrentWeekSchedules();
        LocalDate weekStart = weeklyScheduleService.getCurrentWeekStart();
        LocalDate weekEnd = weeklyScheduleService.getWeekEnd(weekStart);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateBetweenAndStatusOrderByAppointmentDateAscAppointmentTimeAsc(
            weekStart,
            weekEnd,
            AppointmentStatus.SCHEDULED
        );

        Map<LocalDate, List<Appointment>> appointmentsByDate = appointments.stream()
            .collect(Collectors.groupingBy(Appointment::getAppointmentDate));

        return schedules.stream()
            .map(schedule -> {
                LocalDate date = schedule.getWeekStart().plusDays(schedule.getDayOfWeek().getValue() - 1L);
                List<AdminAppointmentResponse> dayAppointments = appointmentsByDate.getOrDefault(date, List.of())
                    .stream()
                    .map(this::toAdminResponse)
                    .toList();
                return new AdminAppointmentsByDayResponse(schedule.getDayOfWeek().name(), date, dayAppointments);
            })
            .toList();
    }

    @Transactional
    public AdminDashboardResponse getAdminDashboard() {
        List<WeeklySchedule> schedules = weeklyScheduleService.ensureCurrentWeekSchedules();
        LocalDate weekStart = weeklyScheduleService.getCurrentWeekStart();
        LocalDate weekEnd = weeklyScheduleService.getWeekEnd(weekStart);

        List<Appointment> weekAppointments = appointmentRepository.findByAppointmentDateBetweenAndStatusOrderByAppointmentDateAscAppointmentTimeAsc(
            weekStart,
            weekEnd,
            AppointmentStatus.SCHEDULED
        );

        long todayAppointments = weekAppointments.stream()
            .filter(appointment -> appointment.getAppointmentDate().equals(LocalDate.now()))
            .count();

        long availableSlots = schedules.stream()
            .flatMap(schedule -> schedule.getSlots().stream())
            .filter(slot -> Boolean.TRUE.equals(slot.getAvailable()))
            .filter(slot -> !weeklyScheduleService.isPastSlot(slot.getSlotDate(), slot.getStartTime()))
            .filter(slot -> !slot.getStartTime().isBefore(slot.getWeeklySchedule().getStartHour()))
            .filter(slot -> slot.getStartTime().isBefore(slot.getWeeklySchedule().getEndHour()))
            .count();

        return new AdminDashboardResponse(
            weekStart,
            weekEnd,
            weeklyScheduleService.isWeekReleased(schedules),
            weekAppointments.size(),
            todayAppointments,
            availableSlots
        );
    }

    @Transactional(readOnly = true)
    public List<AdminAppointmentResponse> getAppointmentsForDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDateAndStatusOrderByAppointmentTimeAsc(date, AppointmentStatus.SCHEDULED)
            .stream()
            .map(this::toAdminResponse)
            .toList();
    }

    private void validateBookableSlot(AvailableTimeSlot slot) {
        if (slot.getWeeklySchedule() == null || !Boolean.TRUE.equals(slot.getWeeklySchedule().getReleased())) {
            throw new BusinessException("A agenda desta semana ainda não foi liberada");
        }

        if (!slot.getWeeklySchedule().getWeekStart().equals(weeklyScheduleService.getCurrentWeekStart())) {
            throw new BusinessException("Só é possível agendar horários da semana atual");
        }

        if (weeklyScheduleService.isPastSlot(slot.getSlotDate(), slot.getStartTime())) {
            throw new BusinessException("Não é possível agendar horários passados");
        }

        if (!Boolean.TRUE.equals(slot.getAvailable()) || appointmentRepository.existsBySlotIdAndStatus(slot.getId(), AppointmentStatus.SCHEDULED)) {
            throw new BusinessException("Este horário não está mais disponível");
        }
    }

    private ClientAppointmentResponse toClientResponse(Appointment appointment) {
        return new ClientAppointmentResponse(
            appointment.getId(),
            appointment.getClientName(),
            appointment.getClientPhone(),
            appointment.getService().getName(),
            appointment.getService().getPrice(),
            appointment.getAppointmentDate(),
            appointment.getAppointmentTime(),
            appointment.getStatus().name()
        );
    }

    private AdminAppointmentResponse toAdminResponse(Appointment appointment) {
        return new AdminAppointmentResponse(
            appointment.getId(),
            appointment.getClientName(),
            appointment.getClientPhone(),
            appointment.getService().getName(),
            appointment.getService().getPrice(),
            appointment.getAppointmentDate(),
            appointment.getAppointmentTime(),
            appointment.getStatus().name()
        );
    }

    private String normalizePhone(String phone) {
        String digitsOnly = phone.replaceAll("\\D", "");
        if (digitsOnly.length() < 8) {
            throw new BusinessException("Telefone inválido");
        }
        return digitsOnly;
    }

    private String normalizeName(String name) {
        String normalized = name.trim().replaceAll("\\s{2,}", " ");
        if (normalized.length() < 2) {
            throw new BusinessException("Nome inválido");
        }
        return normalized.substring(0, 1).toUpperCase(Locale.forLanguageTag("pt-BR"))
            + normalized.substring(1);
    }
}

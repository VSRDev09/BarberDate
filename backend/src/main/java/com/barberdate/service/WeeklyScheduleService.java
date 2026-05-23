package com.barberdate.service;

import com.barberdate.domain.entity.Appointment;
import com.barberdate.domain.entity.AvailableTimeSlot;
import com.barberdate.domain.entity.WeeklySchedule;
import com.barberdate.domain.enums.AppointmentStatus;
import com.barberdate.dto.admin.AdminScheduleDayResponse;
import com.barberdate.dto.admin.AdminScheduleUpdateRequest;
import com.barberdate.dto.admin.AdminWeekScheduleResponse;
import com.barberdate.dto.client.ClientAgendaDayResponse;
import com.barberdate.dto.client.ClientAgendaResponse;
import com.barberdate.dto.common.ServiceResponse;
import com.barberdate.dto.common.TimeSlotResponse;
import com.barberdate.exception.BusinessException;
import com.barberdate.repository.AppointmentRepository;
import com.barberdate.repository.WeeklyScheduleRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WeeklyScheduleService {

    private static final Comparator<WeeklySchedule> WEEKDAY_COMPARATOR = Comparator
            .comparingInt(schedule -> schedule.getDayOfWeek().getValue());

    private final WeeklyScheduleRepository weeklyScheduleRepository;
    private final AppointmentRepository appointmentRepository;

    public WeeklyScheduleService(
            WeeklyScheduleRepository weeklyScheduleRepository,
            AppointmentRepository appointmentRepository) {
        this.weeklyScheduleRepository = weeklyScheduleRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public List<WeeklySchedule> ensureCurrentWeekSchedules() {
        LocalDate weekStart = getCurrentWeekStart();
        List<WeeklySchedule> existing = sortSchedules(weeklyScheduleRepository.findByWeekStart(weekStart));
        if (!existing.isEmpty()) {
            return existing;
        }

        List<WeeklySchedule> templates = loadPreviousWeekTemplates(weekStart);
        List<WeeklySchedule> baseSchedules = templates.isEmpty()
                ? buildDefaultSchedules(weekStart)
                : cloneSchedules(templates, weekStart);

        List<WeeklySchedule> savedSchedules = sortSchedules(weeklyScheduleRepository.saveAll(baseSchedules));
        savedSchedules.forEach(schedule -> regenerateSlots(schedule, Map.of()));
        return sortSchedules(weeklyScheduleRepository.saveAll(savedSchedules));
    }

    @Scheduled(cron = "0 1 0 * * MON")
    @Transactional
    public void prepareWeeklyReset() {
        ensureCurrentWeekSchedules();
    }

    @Transactional(readOnly = true)
    public LocalDate getCurrentWeekStart() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    @Transactional(readOnly = true)
    public LocalDate getWeekEnd(LocalDate weekStart) {
        return weekStart.plusDays(6);
    }

    @Transactional(readOnly = true)
    public boolean isCurrentWeekReleased() {
        return isWeekReleased(weeklyScheduleRepository.findByWeekStart(getCurrentWeekStart()));
    }

    @Transactional(readOnly = true)
    public boolean isWeekReleased(Collection<WeeklySchedule> schedules) {
        return !schedules.isEmpty()
                && schedules.stream().allMatch(schedule -> Boolean.TRUE.equals(schedule.getReleased()));
    }

    @Transactional
    public AdminWeekScheduleResponse getAdminWeekSchedule() {
        List<WeeklySchedule> schedules = ensureCurrentWeekSchedules();
        return buildAdminWeekScheduleResponse(schedules);
    }

    @Transactional
    public AdminWeekScheduleResponse updateDaySchedule(AdminScheduleUpdateRequest request) {

        List<WeeklySchedule> currentSchedules = ensureCurrentWeekSchedules();

        LocalDate weekStart = getCurrentWeekStart();

        DayOfWeek dayOfWeek = parseDayOfWeek(request.dayOfWeek());

        boolean isDayOff = request.dayOff();

        LocalTime startHour = null;
        LocalTime endHour = null;

        if (!isDayOff) {

            if (request.startHour() == null || request.startHour().isBlank()) {
                throw new BusinessException("Hora inicial é obrigatória");
            }

            if (request.endHour() == null || request.endHour().isBlank()) {
                throw new BusinessException("Hora final é obrigatória");
            }

            startHour = LocalTime.parse(request.startHour());
            endHour = LocalTime.parse(request.endHour());

            validateHourlyRange(startHour, endHour);

        } else {

            if (request.startHour() != null || request.endHour() != null) {
                throw new BusinessException(
                        "Dias de folga não devem possuir horários");
            }
        }

        final LocalTime finalStartHour = startHour;
        final LocalTime finalEndHour = endHour;

        WeeklySchedule schedule = weeklyScheduleRepository
                .findByWeekStartAndDayOfWeek(weekStart, dayOfWeek)
                .orElseGet(() -> weeklyScheduleRepository.save(
                        WeeklySchedule.builder()
                                .weekStart(weekStart)
                                .dayOfWeek(dayOfWeek)
                                .startHour(finalStartHour)
                                .endHour(finalEndHour)
                                .released(isWeekReleased(currentSchedules))
                                .dayOff(isDayOff)
                                .slots(new ArrayList<>())
                                .build()));

        LocalDate dayDate = weekStart.plusDays(dayOfWeek.getValue() - 1L);

        List<Appointment> activeAppointments = appointmentRepository
                .findByAppointmentDateAndStatusOrderByAppointmentTimeAsc(
                        dayDate,
                        AppointmentStatus.SCHEDULED);

        Map<LocalTime, Appointment> appointmentsByTime = activeAppointments.stream()
                .collect(
                        java.util.stream.Collectors.toMap(
                                Appointment::getAppointmentTime,
                                appointment -> appointment,
                                (left, right) -> left));

        if (isDayOff) {

            if (!activeAppointments.isEmpty()) {
                throw new BusinessException(
                        "Existem agendamentos ativos nesse dia");
            }

            schedule.setDayOff(true);

            schedule.setStartHour(LocalTime.MIN);
            schedule.setEndHour(LocalTime.MIN);

            schedule.getSlots().clear();

            weeklyScheduleRepository.save(schedule);

            return buildAdminWeekScheduleResponse(
                    ensureCurrentWeekSchedules());
        }

        for (LocalTime time : appointmentsByTime.keySet()) {

            if (time.isBefore(finalStartHour) || !time.isBefore(finalEndHour)) {
                throw new BusinessException(
                        "Existem agendamentos ativos fora do novo intervalo informado");
            }
        }

        schedule.setDayOff(false);
        schedule.setStartHour(finalStartHour);
        schedule.setEndHour(finalEndHour);

        regenerateSlots(schedule, appointmentsByTime);

        weeklyScheduleRepository.save(schedule);

        return buildAdminWeekScheduleResponse(
                ensureCurrentWeekSchedules());
    }

    @Transactional
    public AdminWeekScheduleResponse setReleaseStatus(boolean released) {
        List<WeeklySchedule> schedules = ensureCurrentWeekSchedules();
        schedules.forEach(schedule -> schedule.setReleased(released));
        return buildAdminWeekScheduleResponse(weeklyScheduleRepository.saveAll(schedules));
    }

    @Transactional
    public ClientAgendaResponse getClientAgenda(List<ServiceResponse> services) {
        List<WeeklySchedule> schedules = ensureCurrentWeekSchedules();
        LocalDate weekStart = getCurrentWeekStart();
        LocalDate weekEnd = getWeekEnd(weekStart);
        boolean released = isWeekReleased(schedules);

        if (!released) {
            return new ClientAgendaResponse(
                    weekStart,
                    weekEnd,
                    false,
                    "Lista de agendamento não disponibilizada pelo barbeiro",
                    services,
                    List.of());
        }

        List<Appointment> activeAppointments = appointmentRepository
                .findByAppointmentDateBetweenAndStatusOrderByAppointmentDateAscAppointmentTimeAsc(
                        weekStart,
                        weekEnd,
                        AppointmentStatus.SCHEDULED);
        Map<Long, Appointment> appointmentBySlotId = activeAppointments.stream()
                .collect(
                        java.util.stream.Collectors.toMap(
                                appointment -> appointment.getSlot().getId(),
                                appointment -> appointment,
                                (left, right) -> left));

        List<ClientAgendaDayResponse> dayResponses = schedules.stream()
                .map(schedule -> buildClientDayResponse(schedule, appointmentBySlotId))
                .toList();

        return new ClientAgendaResponse(weekStart, weekEnd, true, null, services, dayResponses);
    }

    @Transactional(readOnly = true)
    public boolean isPastSlot(LocalDate date, LocalTime startTime) {
        return !LocalDateTime.of(date, startTime).isAfter(LocalDateTime.now());
    }

    private ClientAgendaDayResponse buildClientDayResponse(
            WeeklySchedule schedule,
            Map<Long, Appointment> appointmentBySlotId) {
        List<TimeSlotResponse> availableSlots = new ArrayList<>();
        List<TimeSlotResponse> occupiedSlots = new ArrayList<>();

        getVisibleSlots(schedule).forEach(slot -> {
            Appointment appointment = appointmentBySlotId.get(slot.getId());
            if (appointment != null) {
                occupiedSlots.add(new TimeSlotResponse(
                        slot.getId(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        "BOOKED",
                        appointment.getClientName()));
                return;
            }

            if (Boolean.TRUE.equals(slot.getAvailable()) && !isPastSlot(slot.getSlotDate(), slot.getStartTime())) {
                availableSlots.add(new TimeSlotResponse(
                        slot.getId(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        "AVAILABLE",
                        null));
            }
        });

        return new ClientAgendaDayResponse(
                schedule.getDayOfWeek().name(),
                resolveDayDate(schedule),
                schedule.getStartHour(),
                schedule.getEndHour(),
                Boolean.TRUE.equals(schedule.getDayOff()),
                availableSlots,
                occupiedSlots);
    }

    private AdminWeekScheduleResponse buildAdminWeekScheduleResponse(List<WeeklySchedule> schedules) {
        LocalDate weekStart = getCurrentWeekStart();
        LocalDate weekEnd = getWeekEnd(weekStart);
        List<Appointment> activeAppointments = appointmentRepository
                .findByAppointmentDateBetweenAndStatusOrderByAppointmentDateAscAppointmentTimeAsc(
                        weekStart,
                        weekEnd,
                        AppointmentStatus.SCHEDULED);
        Map<Long, Appointment> appointmentBySlotId = activeAppointments.stream()
                .collect(
                        java.util.stream.Collectors.toMap(
                                appointment -> appointment.getSlot().getId(),
                                appointment -> appointment,
                                (left, right) -> left));

        List<AdminScheduleDayResponse> days = schedules.stream()
                .map(schedule -> {
                    List<AvailableTimeSlot> visibleSlots = getVisibleSlots(schedule);
                    long bookedSlots = visibleSlots.stream()
                            .filter(slot -> appointmentBySlotId.containsKey(slot.getId())).count();
                    long availableSlots = visibleSlots.stream()
                            .filter(slot -> Boolean.TRUE.equals(slot.getAvailable()))
                            .filter(slot -> !isPastSlot(slot.getSlotDate(), slot.getStartTime()))
                            .count();
                    return new AdminScheduleDayResponse(
                            schedule.getDayOfWeek().name(),
                            resolveDayDate(schedule),
                            schedule.getStartHour(),
                            schedule.getEndHour(),
                            Boolean.TRUE.equals(schedule.getReleased()),
                            Boolean.TRUE.equals(schedule.getDayOff()),
                            visibleSlots.size(),
                            bookedSlots,
                            availableSlots);
                })
                .toList();

        return new AdminWeekScheduleResponse(weekStart, weekEnd, isWeekReleased(schedules), days);
    }

    private void regenerateSlots(WeeklySchedule schedule, Map<LocalTime, Appointment> bookedAppointmentsByTime) {
        LocalDate slotDate = resolveDayDate(schedule);
        Set<LocalTime> desiredTimes = new LinkedHashSet<>();
        for (LocalTime time = schedule.getStartHour(); time.isBefore(schedule.getEndHour()); time = time.plusHours(1)) {
            desiredTimes.add(time);
        }

        if (schedule.getSlots() == null) {
            schedule.setSlots(new ArrayList<>());
        }

        Set<LocalTime> preservedTimes = new LinkedHashSet<>();
        Iterator<AvailableTimeSlot> iterator = schedule.getSlots().iterator();
        while (iterator.hasNext()) {
            AvailableTimeSlot slot = iterator.next();
            slot.setSlotDate(slotDate);
            slot.setEndTime(slot.getStartTime().plusHours(1));

            if (bookedAppointmentsByTime.containsKey(slot.getStartTime())) {
                if (!desiredTimes.contains(slot.getStartTime())) {
                    throw new BusinessException("Existe um agendamento ativo que impediria a remoção desse horário");
                }
                slot.setAvailable(false);
                preservedTimes.add(slot.getStartTime());
                continue;
            }

            if (desiredTimes.contains(slot.getStartTime())) {
                slot.setAvailable(true);
                preservedTimes.add(slot.getStartTime());
                continue;
            }

            if (slot.getId() != null && appointmentRepository.existsBySlotId(slot.getId())) {
                slot.setAvailable(false);
                continue;
            }

            iterator.remove();
        }

        desiredTimes.stream()
                .filter(time -> !preservedTimes.contains(time))
                .forEach(time -> schedule.getSlots().add(
                        AvailableTimeSlot.builder()
                                .weeklySchedule(schedule)
                                .slotDate(slotDate)
                                .startTime(time)
                                .endTime(time.plusHours(1))
                                .available(true)
                                .build()));

        schedule.getSlots().sort(Comparator.comparing(AvailableTimeSlot::getStartTime));
    }

    private List<WeeklySchedule> loadPreviousWeekTemplates(LocalDate weekStart) {
        Optional<WeeklySchedule> previousWeekReference = weeklyScheduleRepository
                .findTopByWeekStartBeforeOrderByWeekStartDesc(weekStart);
        return previousWeekReference
                .map(reference -> weeklyScheduleRepository.findByWeekStart(reference.getWeekStart()))
                .map(this::sortSchedules)
                .orElseGet(List::of);
    }

    private List<WeeklySchedule> buildDefaultSchedules(LocalDate weekStart) {
        Map<DayOfWeek, LocalTime[]> defaults = new EnumMap<>(DayOfWeek.class);
        defaults.put(DayOfWeek.MONDAY, new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(18, 0) });
        defaults.put(DayOfWeek.TUESDAY, new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(18, 0) });
        defaults.put(DayOfWeek.WEDNESDAY, new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(18, 0) });
        defaults.put(DayOfWeek.THURSDAY, new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(18, 0) });
        defaults.put(DayOfWeek.FRIDAY, new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(18, 0) });
        defaults.put(DayOfWeek.SATURDAY, new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(14, 0) });
        defaults.put(DayOfWeek.SUNDAY, new LocalTime[] { LocalTime.of(10, 0), LocalTime.of(13, 0) });

        return defaults.entrySet().stream()
                .map(entry -> WeeklySchedule.builder()
                        .weekStart(weekStart)
                        .dayOfWeek(entry.getKey())
                        .startHour(entry.getValue()[0])
                        .endHour(entry.getValue()[1])
                        .released(false)
                        .slots(new ArrayList<>())
                        .build())
                .sorted(WEEKDAY_COMPARATOR)
                .toList();
    }

    private List<WeeklySchedule> cloneSchedules(List<WeeklySchedule> templates, LocalDate weekStart) {
        return templates.stream()
                .map(template -> WeeklySchedule.builder()
                        .weekStart(weekStart)
                        .dayOfWeek(template.getDayOfWeek())
                        .startHour(template.getStartHour())
                        .endHour(template.getEndHour())
                        .released(false)
                        .dayOff(template.getDayOff())
                        .slots(new ArrayList<>())
                        .build())
                .sorted(WEEKDAY_COMPARATOR)
                .toList();
    }

    private List<WeeklySchedule> sortSchedules(List<WeeklySchedule> schedules) {
        return schedules.stream().sorted(WEEKDAY_COMPARATOR).toList();
    }

    private List<AvailableTimeSlot> getVisibleSlots(WeeklySchedule schedule) {

        if (Boolean.TRUE.equals(schedule.getDayOff())) {
            return List.of();
        }

        return schedule.getSlots().stream()
                .filter(slot -> !slot.getStartTime().isBefore(schedule.getStartHour()))
                .filter(slot -> slot.getStartTime().isBefore(schedule.getEndHour()))
                .sorted(Comparator.comparing(AvailableTimeSlot::getStartTime))
                .toList();
    }

    private LocalDate resolveDayDate(WeeklySchedule schedule) {
        return schedule.getWeekStart().plusDays(schedule.getDayOfWeek().getValue() - 1L);
    }

    private DayOfWeek parseDayOfWeek(String dayOfWeek) {
        try {
            return DayOfWeek.valueOf(dayOfWeek.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BusinessException("Dia da semana inválido");
        }
    }

    private void validateHourlyRange(LocalTime startHour, LocalTime endHour) {
        if (startHour.getMinute() != 0 || endHour.getMinute() != 0) {
            throw new BusinessException("Os horários devem ser configurados em horas cheias");
        }

        if (!endHour.isAfter(startHour)) {
            throw new BusinessException("A hora final deve ser maior que a hora inicial");
        }

        if (java.time.Duration.between(startHour, endHour).toHours() < 1) {
            throw new BusinessException("O intervalo mínimo é de 1 hora");
        }
    }
}

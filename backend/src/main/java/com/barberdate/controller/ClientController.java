package com.barberdate.controller;

import com.barberdate.dto.client.CancelAppointmentRequest;
import com.barberdate.dto.client.ClientAgendaResponse;
import com.barberdate.dto.client.ClientAppointmentRequest;
import com.barberdate.dto.client.ClientAppointmentResponse;
import com.barberdate.dto.common.AppointmentCreatedResponse;
import com.barberdate.service.AppointmentService;
import com.barberdate.service.ServiceCatalogService;
import com.barberdate.service.WeeklyScheduleService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/client")
public class ClientController {

    private final WeeklyScheduleService weeklyScheduleService;
    private final ServiceCatalogService serviceCatalogService;
    private final AppointmentService appointmentService;

    public ClientController(
        WeeklyScheduleService weeklyScheduleService,
        ServiceCatalogService serviceCatalogService,
        AppointmentService appointmentService
    ) {
        this.weeklyScheduleService = weeklyScheduleService;
        this.serviceCatalogService = serviceCatalogService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/agenda")
    public ResponseEntity<ClientAgendaResponse> getAgenda() {
        return ResponseEntity.ok(weeklyScheduleService.getClientAgenda(serviceCatalogService.getActiveServices()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<ClientAppointmentResponse>> getClientAppointments(
        @RequestParam @NotBlank(message = "Nome é obrigatório") String name,
        @RequestParam @NotBlank(message = "Telefone é obrigatório") String phone
    ) {
        return ResponseEntity.ok(appointmentService.getClientAppointments(name, phone));
    }

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentCreatedResponse> createAppointment(
        @Valid @RequestBody ClientAppointmentRequest request
    ) {
        return ResponseEntity.ok(appointmentService.createAppointment(request));
    }

    @PostMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<Void> cancelAppointment(
        @PathVariable Long appointmentId,
        @Valid @RequestBody CancelAppointmentRequest request
    ) {
        appointmentService.cancelAppointment(appointmentId, request);
        return ResponseEntity.noContent().build();
    }
}

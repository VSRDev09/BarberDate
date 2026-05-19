package com.barberdate.controller;

import com.barberdate.dto.admin.AdminAppointmentsByDayResponse;
import com.barberdate.dto.admin.AdminDashboardResponse;
import com.barberdate.service.AppointmentService;
import com.barberdate.service.PdfExportService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminAppointmentController {

    private final AppointmentService appointmentService;
    private final PdfExportService pdfExportService;

    public AdminAppointmentController(
        AppointmentService appointmentService,
        PdfExportService pdfExportService
    ) {
        this.appointmentService = appointmentService;
        this.pdfExportService = pdfExportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(appointmentService.getAdminDashboard());
    }

    @GetMapping("/appointments/week")
    public ResponseEntity<List<AdminAppointmentsByDayResponse>> getWeeklyAppointments() {
        return ResponseEntity.ok(appointmentService.getCurrentWeekAppointmentsForAdmin());
    }

    @GetMapping("/appointments/day/{date}/pdf")
    public ResponseEntity<ByteArrayResource> downloadDailyPdf(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        byte[] pdf = pdfExportService.generateDailyAppointmentsPdf(date);
        ByteArrayResource resource = new ByteArrayResource(pdf);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=agenda-" + date + ".pdf")
            .contentLength(pdf.length)
            .body(resource);
    }
}

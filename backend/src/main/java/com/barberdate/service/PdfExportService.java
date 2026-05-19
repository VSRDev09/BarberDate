package com.barberdate.service;

import com.barberdate.dto.admin.AdminAppointmentResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PdfExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final AppointmentService appointmentService;

    public PdfExportService(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    public byte[] generateDailyAppointmentsPdf(LocalDate date) {
        List<AdminAppointmentResponse> appointments = appointmentService.getAppointmentsForDate(date);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Barber Date - Agenda do Dia", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Data: " + date.format(DATE_FORMATTER), subtitleFont);
            subtitle.setSpacingAfter(18f);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(new float[]{4f, 4f, 2.5f});
            table.setWidthPercentage(100);
            table.setSpacingBefore(6f);

            addHeaderCell(table, "Nome", headerFont);
            addHeaderCell(table, "Serviço", headerFont);
            addHeaderCell(table, "Horário", headerFont);

            if (appointments.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("Nenhum agendamento para esta data.", bodyFont));
                emptyCell.setColspan(3);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(12f);
                table.addCell(emptyCell);
            } else {
                appointments.forEach(appointment -> {
                    table.addCell(new Phrase(appointment.clientName(), bodyFont));
                    table.addCell(new Phrase(appointment.serviceName(), bodyFont));
                    table.addCell(new Phrase(appointment.appointmentTime().format(TIME_FORMATTER), bodyFont));
                });
            }

            document.add(table);
            document.close();
            return outputStream.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("Não foi possível gerar o PDF", exception);
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell headerCell = new PdfPCell(new Phrase(text, font));
        headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerCell.setPadding(8f);
        table.addCell(headerCell);
    }
}

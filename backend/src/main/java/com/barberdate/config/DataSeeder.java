package com.barberdate.config;

import com.barberdate.domain.entity.Admin;
import com.barberdate.domain.entity.ServiceEntity;
import com.barberdate.domain.enums.AdminRole;
import com.barberdate.repository.AdminRepository;
import com.barberdate.repository.ServiceEntityRepository;
import com.barberdate.service.WeeklyScheduleService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements ApplicationRunner {

    private final AdminRepository adminRepository;
    private final ServiceEntityRepository serviceEntityRepository;
    private final PasswordEncoder passwordEncoder;
    private final SeedProperties seedProperties;
    private final WeeklyScheduleService weeklyScheduleService;

    public DataSeeder(
        AdminRepository adminRepository,
        ServiceEntityRepository serviceEntityRepository,
        PasswordEncoder passwordEncoder,
        SeedProperties seedProperties,
        WeeklyScheduleService weeklyScheduleService
    ) {
        this.adminRepository = adminRepository;
        this.serviceEntityRepository = serviceEntityRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedProperties = seedProperties;
        this.weeklyScheduleService = weeklyScheduleService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdmin();
        seedServices();
        weeklyScheduleService.ensureCurrentWeekSchedules();
    }

    private void seedAdmin() {
        adminRepository.findByUsername(seedProperties.adminUsername()).ifPresentOrElse(
            admin -> {
            },
            () -> adminRepository.save(
                Admin.builder()
                    .name(seedProperties.adminName())
                    .username(seedProperties.adminUsername())
                    .passwordHash(passwordEncoder.encode(seedProperties.adminPassword()))
                    .role(AdminRole.ADMIN)
                    .build()
            )
        );
    }

    private void seedServices() {
        if (serviceEntityRepository.count() > 0) {
            return;
        }

        serviceEntityRepository.saveAll(List.of(
            buildService(1, "Corte", "25.00"),
            buildService(2, "Barba", "15.00"),
            buildService(3, "Corte + Barba", "35.00"),
            buildService(4, "Pe de cabelo", "15.00"),
            buildService(5, "Corte + Pigmentacao", "35.00"),
            buildService(6, "Corte + Sobrancelha", "30.00")
        ));
    }

    private ServiceEntity buildService(int displayOrder, String name, String price) {
        return ServiceEntity.builder()
            .displayOrder(displayOrder)
            .name(name)
            .price(new BigDecimal(price))
            .durationMinutes(60)
            .active(true)
            .build();
    }
}

package com.barberdate.service;

import com.barberdate.domain.entity.ServiceEntity;
import com.barberdate.dto.common.ServiceResponse;
import com.barberdate.exception.ResourceNotFoundException;
import com.barberdate.repository.ServiceEntityRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServiceCatalogService {

    private final ServiceEntityRepository serviceEntityRepository;

    public ServiceCatalogService(ServiceEntityRepository serviceEntityRepository) {
        this.serviceEntityRepository = serviceEntityRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getActiveServices() {
        return serviceEntityRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ServiceEntity getActiveServiceById(Long serviceId) {
        return serviceEntityRepository.findById(serviceId)
            .filter(ServiceEntity::getActive)
            .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
    }

    private ServiceResponse toResponse(ServiceEntity service) {
        return new ServiceResponse(
            service.getId(),
            service.getName(),
            service.getPrice(),
            service.getDurationMinutes()
        );
    }
}

package com.barberdate.repository;

import com.barberdate.domain.entity.ServiceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceEntityRepository extends JpaRepository<ServiceEntity, Long> {

    List<ServiceEntity> findByActiveTrueOrderByDisplayOrderAscNameAsc();
}

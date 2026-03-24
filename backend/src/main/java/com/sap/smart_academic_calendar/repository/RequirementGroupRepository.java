package com.sap.smart_academic_calendar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.RequirementGroup;

@Repository
public interface RequirementGroupRepository extends JpaRepository<RequirementGroup, Long> {
}

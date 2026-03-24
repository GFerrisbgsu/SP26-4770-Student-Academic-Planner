package com.sap.smart_academic_calendar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.UserRequirementFulfillment;

@Repository
public interface UserRequirementFulfillmentRepository extends JpaRepository<UserRequirementFulfillment, Long> {

    List<UserRequirementFulfillment> findByEnrollmentId(Long enrollmentId);

    List<UserRequirementFulfillment> findByEnrollmentUserId(Long userId);

    Optional<UserRequirementFulfillment> findByEnrollmentIdAndRequirementGroupId(
            Long enrollmentId, Long requirementGroupId);

    boolean existsByEnrollmentIdAndRequirementGroupId(Long enrollmentId, Long requirementGroupId);

    List<UserRequirementFulfillment> findByRequirementGroupIdAndEnrollmentUserId(
            Long requirementGroupId, Long userId);

    void deleteAllByEnrollmentUserId(Long userId);
}

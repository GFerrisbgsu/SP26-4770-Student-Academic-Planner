package com.sap.smart_academic_calendar.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.UserSemester;

@Repository
public interface UserSemesterRepository extends JpaRepository<UserSemester, Long> {

    Optional<UserSemester> findByUserId(Long userId);
}

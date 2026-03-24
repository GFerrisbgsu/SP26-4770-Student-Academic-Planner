package com.sap.smart_academic_calendar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.UserCourseEnrollment;

@Repository
public interface UserCourseEnrollmentRepository extends JpaRepository<UserCourseEnrollment, Long> {

    List<UserCourseEnrollment> findByUserId(Long userId);

    List<UserCourseEnrollment> findByUserIdAndSemesterId(Long userId, Long semesterId);

    Optional<UserCourseEnrollment> findByUserIdAndCourseId(Long userId, String courseId);

    boolean existsByUserIdAndCourseId(Long userId, String courseId);

    @Query("SELECT COALESCE(SUM(e.course.credits), 0) FROM UserCourseEnrollment e " +
           "WHERE e.user.id = :userId AND e.semester.id = :semesterId")
    int sumCreditsByUserIdAndSemesterId(@Param("userId") Long userId,
                                        @Param("semesterId") Long semesterId);

    List<UserCourseEnrollment> findByUserIdAndSemesterSortOrderGreaterThan(Long userId, Integer sortOrder);

    void deleteByUserIdAndSemesterSortOrderGreaterThan(Long userId, Integer sortOrder);

    void deleteAllByUserId(Long userId);
}

package com.sap.smart_academic_calendar.dto;

/**
 * DTO representing the user's current semester position.
 */
public class UserSemesterDTO {

    private Long id;
    private Long userId;
    private SemesterDTO currentSemester;
    private Long programId;
    private String programName;

    public UserSemesterDTO() {}

    public UserSemesterDTO(Long id, Long userId, SemesterDTO currentSemester,
                           Long programId, String programName) {
        this.id = id;
        this.userId = userId;
        this.currentSemester = currentSemester;
        this.programId = programId;
        this.programName = programName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public SemesterDTO getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(SemesterDTO currentSemester) { this.currentSemester = currentSemester; }

    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }
}

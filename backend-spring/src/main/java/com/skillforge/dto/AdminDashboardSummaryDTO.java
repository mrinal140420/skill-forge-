package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Admin Dashboard Summary DTO
 * Contains high-level statistics for super admin dashboard
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminDashboardSummaryDTO {
    
    private long totalUsers;
    private long totalStudents;
    private long totalCourseAdmins;
    private long totalSuperAdmins;
    private long totalCourses;
    private long publishedCourses;
    private long draftCourses;
    private long archivedCourses;
    private long totalEnrollments;
    private long activeLearnersToday;
    private long unresolvedDoubts;
    private long totalDoubts;
    
    // Constructors
    public AdminDashboardSummaryDTO() {
    }
    
    public AdminDashboardSummaryDTO(long totalUsers, long totalStudents, long totalCourseAdmins,
                                    long totalSuperAdmins, long totalCourses, long publishedCourses,
                                    long draftCourses, long archivedCourses, long totalEnrollments,
                                    long activeLearnersToday, long unresolvedDoubts, long totalDoubts) {
        this.totalUsers = totalUsers;
        this.totalStudents = totalStudents;
        this.totalCourseAdmins = totalCourseAdmins;
        this.totalSuperAdmins = totalSuperAdmins;
        this.totalCourses = totalCourses;
        this.publishedCourses = publishedCourses;
        this.draftCourses = draftCourses;
        this.archivedCourses = archivedCourses;
        this.totalEnrollments = totalEnrollments;
        this.activeLearnersToday = activeLearnersToday;
        this.unresolvedDoubts = unresolvedDoubts;
        this.totalDoubts = totalDoubts;
    }
    
    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalCourseAdmins() {
        return totalCourseAdmins;
    }

    public void setTotalCourseAdmins(long totalCourseAdmins) {
        this.totalCourseAdmins = totalCourseAdmins;
    }

    public long getTotalSuperAdmins() {
        return totalSuperAdmins;
    }

    public void setTotalSuperAdmins(long totalSuperAdmins) {
        this.totalSuperAdmins = totalSuperAdmins;
    }

    public long getTotalCourses() {
        return totalCourses;
    }

    public void setTotalCourses(long totalCourses) {
        this.totalCourses = totalCourses;
    }

    public long getPublishedCourses() {
        return publishedCourses;
    }

    public void setPublishedCourses(long publishedCourses) {
        this.publishedCourses = publishedCourses;
    }

    public long getDraftCourses() {
        return draftCourses;
    }

    public void setDraftCourses(long draftCourses) {
        this.draftCourses = draftCourses;
    }

    public long getArchivedCourses() {
        return archivedCourses;
    }

    public void setArchivedCourses(long archivedCourses) {
        this.archivedCourses = archivedCourses;
    }

    public long getTotalEnrollments() {
        return totalEnrollments;
    }

    public void setTotalEnrollments(long totalEnrollments) {
        this.totalEnrollments = totalEnrollments;
    }

    public long getActiveLearnersToday() {
        return activeLearnersToday;
    }

    public void setActiveLearnersToday(long activeLearnersToday) {
        this.activeLearnersToday = activeLearnersToday;
    }

    public long getUnresolvedDoubts() {
        return unresolvedDoubts;
    }

    public void setUnresolvedDoubts(long unresolvedDoubts) {
        this.unresolvedDoubts = unresolvedDoubts;
    }

    public long getTotalDoubts() {
        return totalDoubts;
    }

    public void setTotalDoubts(long totalDoubts) {
        this.totalDoubts = totalDoubts;
    }
}

package com.skillforge.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Lightweight runtime schema patch for dev H2 compatibility.
 * Ensures newly added non-null columns exist in older local databases.
 */
@Component
public class SchemaMigrationConfig {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigrationConfig.class);

    private final JdbcTemplate jdbcTemplate;

    public SchemaMigrationConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureCourseStatusColumn() {
        try {
            Integer statusColumnCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'COURSES' AND COLUMN_NAME = 'STATUS'",
                    Integer.class
            );

            if (statusColumnCount == null || statusColumnCount == 0) {
                jdbcTemplate.execute("ALTER TABLE COURSES ADD COLUMN STATUS VARCHAR(20) DEFAULT 'DRAFT' NOT NULL");
                log.info("Schema migration applied: added COURSES.STATUS column with default DRAFT");
            } else {
                jdbcTemplate.update("UPDATE COURSES SET STATUS = 'DRAFT' WHERE STATUS IS NULL");
                log.info("Schema migration verified: COURSES.STATUS exists and nulls backfilled");
            }
        } catch (Exception e) {
            log.warn("Schema migration skipped or already applied: {}", e.getMessage());
        }
    }
}

package com.sap.smart_academic_calendar.scheduled;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.sap.smart_academic_calendar.service.RecurringIncomeService;

/**
 * Scheduled tasks for recurring income operations.
 * Automatically applies due recurring incomes on a schedule.
 */
@Component
public class ScheduledIncomeTask {
    private static final Logger log = LoggerFactory.getLogger(ScheduledIncomeTask.class);

    private final RecurringIncomeService recurringIncomeService;

    public ScheduledIncomeTask(RecurringIncomeService recurringIncomeService) {
        this.recurringIncomeService = recurringIncomeService;
    }

    /**
     * Apply due recurring incomes daily at 2:00 AM.
     * Prevents multiple executions on the same day.
     * 
     * Cron expression: 0 0 2 * * * = 2:00 AM every day
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void applyDueRecurringIncomesDaily() {
        log.info("Starting scheduled recurring income task");
        try {
            recurringIncomeService.applyDueRecurringIncomes();
            log.info("Completed scheduled recurring income task successfully");
        } catch (Exception e) {
            log.error("Error in scheduled recurring income task", e);
            // Don't throw - let scheduler recover on next execution
        }
    }

    /**
     * Alternative: Apply due recurring incomes hourly (for testing/development).
     * Uncomment to use instead of daily task.
     * 
     * Cron expression: 0 0 * * * * = Every hour at :00 minutes
     */
    // @Scheduled(cron = "0 0 * * * *")
    // public void applyDueRecurringIncomesHourly() {
    //     log.info("Starting hourly scheduled recurring income task (dev)");
    //     try {
    //         recurringIncomeService.applyDueRecurringIncomes();
    //         log.info("Completed hourly scheduled recurring income task successfully");
    //     } catch (Exception e) {
    //         log.error("Error in hourly scheduled recurring income task", e);
    //     }
    // }

    /**
     * Alternative: Apply due recurring incomes every 5 minutes (for rapid testing).
     * Uncomment to use instead of daily task.
     * 
     * Fixed rate: 300000 milliseconds = 5 minutes
     */
    // @Scheduled(fixedRate = 300000)
    // public void applyDueRecurringIncomesEvery5Minutes() {
    //     log.info("Starting 5-minute scheduled recurring income task (dev)");
    //     try {
    //         recurringIncomeService.applyDueRecurringIncomes();
    //         log.info("Completed 5-minute scheduled recurring income task successfully");
    //     } catch (Exception e) {
    //         log.error("Error in 5-minute scheduled recurring income task", e);
    //     }
    // }
}

package com.sap.smart_academic_calendar.service.seeding;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.smart_academic_calendar.model.BudgetCategory;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.BudgetCategoryRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Seeder that creates default budget categories for new users.
 * Called when a user logs in for the first time to populate their account
 * with standard spending categories that they can customize.
 */
@Component
public class CategorySeeder {

    private static final Logger log = LoggerFactory.getLogger(CategorySeeder.class);

    private final BudgetCategoryRepository budgetCategoryRepository;
    private final UserRepository userRepository;

    /**
     * Predefined default categories for new users
     */
    private static final List<String[]> DEFAULT_CATEGORIES = List.of(
        new String[]{"Housing & Utilities", "#8b5cf6"},      // Purple
        new String[]{"Groceries", "#10b981"},                 // Green
        new String[]{"Dining Out", "#f97316"},                // Orange
        new String[]{"Fun & Entertainment", "#ec4899"},       // Pink
        new String[]{"College & Books", "#06b6d4"},           // Cyan
        new String[]{"Transportation", "#f59e0b"},            // Amber
        new String[]{"Healthcare", "#ef4444"},                // Red
        new String[]{"Personal Care", "#6366f1"},             // Indigo
        new String[]{"Other", "#6b7280"}                      // Gray
    );

    public CategorySeeder(BudgetCategoryRepository budgetCategoryRepository, UserRepository userRepository) {
        this.budgetCategoryRepository = budgetCategoryRepository;
        this.userRepository = userRepository;
    }

    /**
     * Seed default categories for a specific user if they don't already exist
     */
    public void seedCategoriesForUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has categories
        List<BudgetCategory> existingCategories = budgetCategoryRepository.findByUserIdAndIsDeletedFalse(userId);
        if (!existingCategories.isEmpty()) {
            log.debug("User {} already has {} categories, skipping default seeding", userId, existingCategories.size());
            return;
        }

        log.info("Seeding default categories for user {}", userId);
        int createdCount = 0;

        for (String[] categoryData : DEFAULT_CATEGORIES) {
            String name = categoryData[0];
            String color = categoryData[1];

            BudgetCategory category = new BudgetCategory(user, name, color, true);
            budgetCategoryRepository.save(category);
            createdCount++;
        }

        log.info("Seeded {} default categories for user {}", createdCount, userId);
    }

    /**
     * Seed default categories for all users (useful for initial database setup)
     */
    public void seedCategoriesForAllUsers() {
        log.info("Starting to seed default categories for all users");

        List<User> users = userRepository.findAll();
        int usersUpdated = 0;

        for (User user : users) {
            List<BudgetCategory> existingCategories = budgetCategoryRepository.findByUserIdAndIsDeletedFalse(user.getId());
            if (existingCategories.isEmpty()) {
                seedCategoriesForUser(user.getId());
                usersUpdated++;
            }
        }

        log.info("Completed seeding default categories: {} users updated", usersUpdated);
    }
}

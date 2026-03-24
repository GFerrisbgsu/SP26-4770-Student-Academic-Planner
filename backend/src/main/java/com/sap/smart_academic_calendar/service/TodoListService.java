package com.sap.smart_academic_calendar.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.CreateTodoListRequest;
import com.sap.smart_academic_calendar.dto.TodoListDTO;
import com.sap.smart_academic_calendar.model.TodoList;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.EventRepository;
import com.sap.smart_academic_calendar.repository.TodoListRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service layer for TodoList operations.
 * Contains business logic for to-do list management.
 */
@Service
public class TodoListService {

    private final TodoListRepository todoListRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    // Constructor injection
    public TodoListService(TodoListRepository todoListRepository, 
                          UserRepository userRepository,
                          EventRepository eventRepository) {
        this.todoListRepository = todoListRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Create a new to-do list for a user.
     * @param userId the user ID
     * @param request the list creation request
     * @return the created list DTO
     */
    @Transactional
    public TodoListDTO createTodoList(Long userId, CreateTodoListRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        TodoList todoList = new TodoList(
            user,
            request.getName(),
            request.getDescription(),
            request.getColor() != null ? request.getColor() : "#3b82f6",
            request.getIsDefault() != null ? request.getIsDefault() : false,
            request.getListOrder() != null ? request.getListOrder() : getNextListOrder(userId)
        );

        TodoList savedList = todoListRepository.save(todoList);
        return convertToDTO(savedList, 0); // New list has 0 tasks
    }

    /**
     * Get all to-do lists for a user.
     * @param userId the user ID
     * @return list of to-do list DTOs
     */
    public List<TodoListDTO> getUserTodoLists(Long userId) {
        List<TodoList> todoLists = todoListRepository.findByUserIdOrderByListOrderAsc(userId);
        return todoLists.stream()
            .map(list -> convertToDTO(list, getTaskCount(list.getId())))
            .collect(Collectors.toList());
    }

    /**
     * Get a specific to-do list by ID.
     * @param listId the list ID
     * @return the list DTO
     */
    public TodoListDTO getTodoListById(Long listId) {
        TodoList todoList = todoListRepository.findById(listId)
            .orElseThrow(() -> new RuntimeException("TodoList not found"));
        return convertToDTO(todoList, getTaskCount(listId));
    }

    /**
     * Update a to-do list.
     * @param userId the user ID
     * @param listId the list ID
     * @param request the update request
     * @return the updated list DTO
     */
    @Transactional
    public TodoListDTO updateTodoList(Long userId, Long listId, CreateTodoListRequest request) {
        TodoList todoList = todoListRepository.findByUserIdAndId(userId, listId)
            .orElseThrow(() -> new RuntimeException("TodoList not found"));

        if (request.getName() != null) {
            todoList.setName(request.getName());
        }
        if (request.getDescription() != null) {
            todoList.setDescription(request.getDescription());
        }
        if (request.getColor() != null) {
            todoList.setColor(request.getColor());
        }
        if (request.getIsDefault() != null) {
            todoList.setIsDefault(request.getIsDefault());
        }
        if (request.getListOrder() != null) {
            todoList.setListOrder(request.getListOrder());
        }

        TodoList updatedList = todoListRepository.save(todoList);
        return convertToDTO(updatedList, getTaskCount(listId));
    }

    /**
     * Delete a to-do list.
     * Note: Events in this list will have their todo_list_id set to NULL (handled by FK constraint)
     * @param userId the user ID
     * @param listId the list ID
     */
    @Transactional
    public void deleteTodoList(Long userId, Long listId) {
        TodoList todoList = todoListRepository.findByUserIdAndId(userId, listId)
            .orElseThrow(() -> new RuntimeException("TodoList not found"));

        todoListRepository.delete(todoList);
    }

    /**
     * Create default to-do lists for a new user.
     * Creates "Class" and "Personal" lists.
     * @param userId the user ID
     */
    @Transactional
    public void createDefaultLists(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has lists
        if (todoListRepository.existsByUserId(userId)) {
            return;
        }

        // Create "Class" list
        TodoList classList = new TodoList(user, "Class", "School-related tasks", "#3b82f6", true, 0);
        todoListRepository.save(classList);

        // Create "Personal" list
        TodoList personalList = new TodoList(user, "Personal", "Personal tasks", "#10b981", true, 1);
        todoListRepository.save(personalList);
    }

    /**
     * Get the next list order number for a user.
     * @param userId the user ID
     * @return the next order number
     */
    private int getNextListOrder(Long userId) {
        List<TodoList> lists = todoListRepository.findByUserIdOrderByListOrderAsc(userId);
        if (lists.isEmpty()) {
            return 0;
        }
        return lists.get(lists.size() - 1).getListOrder() + 1;
    }

    /**
     * Get count of tasks in a to-do list.
     * @param listId the list ID
     * @return number of events/tasks
     */
    private int getTaskCount(Long listId) {
        return eventRepository.countByTodoListId(listId);
    }

    /**
     * Convert TodoList entity to DTO.
     * @param todoList the entity
     * @param taskCount the number of tasks
     * @return the DTO
     */
    private TodoListDTO convertToDTO(TodoList todoList, int taskCount) {
        return new TodoListDTO(
            todoList.getId(),
            todoList.getUser().getId(),
            todoList.getName(),
            todoList.getDescription(),
            todoList.getColor(),
            todoList.getIsDefault(),
            todoList.getListOrder(),
            taskCount,
            todoList.getCreatedAt(),
            todoList.getUpdatedAt()
        );
    }
}

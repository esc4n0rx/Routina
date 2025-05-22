import { authService, User, LoginCredentials, RegisterData, AuthResponse } from './auth-service';
import { taskService, categoryService, tagService, Task, Category, Tag, CreateTaskData, UpdateTaskData, AdiarTaskData, ApiResponse } from './task-service';

export {
    authService,
    taskService,
    categoryService,
    tagService
};

export type {
    // Auth types
    User,
    LoginCredentials,
    RegisterData,
    AuthResponse,
    
    // Task types
    Task,
    Category,
    Tag,
    CreateTaskData,
    UpdateTaskData,
    AdiarTaskData,
    ApiResponse
};
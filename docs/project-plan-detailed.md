# Project Name: Student Life - Smart Academic Calendar
# Detailed Project Plan with Tasks

# Team members:
- Grant Ferris
- Megan Brown
- Cassidy Kibby
- Shivani Pallerla

# Table of Contents
* [Changes](#changes)
* [User Stories with Tasks](#user-stories-with-tasks)
  * [Infrastructure & Authentication](#infrastructure--authentication)
  * [Calendar & Events](#calendar--events)
  * [Course Management](#course-management)
  * [Personal Tools](#personal-tools)
  * [Study Tools](#study-tools)
* [Project Plan](#project-plan)

# Changes
* 1/27/2026 - Initial detailed plan created with tasks for each user story
* 1/28/2026 - Merged teammate's user stories, added US-40 through US-46
	* Added: Monthly calendar view, custom categories, to-do list organization, task reordering, study resources, course assignments view

---

# User Stories with Tasks

## Infrastructure & Authentication

---

### US-31: User Account Registration
|**Field**|**Value**|
|---|---|
|**Description**|As a new user, I want to create an account with my email and password so I can have a personalized experience and save my data.|
|**Estimate**|3 days|
|**Priority**|5|
|**Acceptance Criteria**|User can register with email/password; Email validation; Password strength requirements; Duplicate email prevention; Confirmation message shown|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-31.1 | Create registration form UI component with email, password, confirm password fields | 4 | |
| T-31.2 | Implement client-side form validation (email format, password match, strength) | 3 | |
| T-31.3 | Create user registration API endpoint | 4 | |
| T-31.4 | Implement password hashing with bcrypt | 2 | |
| T-31.5 | Create user table/collection in database schema | 2 | |
| T-31.6 | Add duplicate email check before registration | 2 | |
| T-31.7 | Implement email verification flow (send verification email) | 4 | |
| T-31.8 | Write unit tests for registration logic | 3 | |

---

### US-32: User Login/Authentication
|**Field**|**Value**|
|---|---|
|**Description**|As a registered user, I want to log in with my credentials so I can access my personal calendar, courses, and settings.|
|**Estimate**|2 days|
|**Priority**|5|
|**Acceptance Criteria**|User can log in with email/password; Invalid credentials show error; Successful login redirects to dashboard; JWT or session token issued|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-32.1 | Create login form UI component | 3 | |
| T-32.2 | Create login API endpoint with credential verification | 4 | |
| T-32.3 | Implement JWT token generation and signing | 3 | |
| T-32.4 | Create authentication middleware for protected routes | 3 | |
| T-32.5 | Implement auth context/provider in React for global auth state | 3 | |
| T-32.6 | Add protected route wrapper component | 2 | |
| T-32.7 | Write unit tests for authentication logic | 2 | |

---

### US-33: Session Management
|**Field**|**Value**|
|---|---|
|**Description**|As a user, I want to stay logged in across browser sessions and be automatically logged out after inactivity so my account stays secure.|
|**Estimate**|2 days|
|**Priority**|5|
|**Acceptance Criteria**|Session persists on browser refresh; Auto-logout after 30 min inactivity; "Remember me" option; Logout button works|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-33.1 | Implement token storage in localStorage/cookies | 2 | |
| T-33.2 | Create token refresh mechanism for expiring tokens | 4 | |
| T-33.3 | Implement activity tracker for inactivity timeout | 3 | |
| T-33.4 | Add "Remember me" checkbox and logic | 2 | |
| T-33.5 | Create logout functionality (clear tokens, redirect) | 2 | |
| T-33.6 | Handle token expiration gracefully in UI | 2 | |
| T-33.7 | Write tests for session management | 2 | |

---

### US-34: Password Reset
|**Field**|**Value**|
|---|---|
|**Description**|As a user, I want to reset my password via email if I forget it so I can regain access to my account.|
|**Estimate**|2 days|
|**Priority**|15|
|**Acceptance Criteria**|"Forgot password" link on login page; Email sent with reset link; Reset link expires after 1 hour; New password can be set|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-34.1 | Create "Forgot Password" form UI | 2 | |
| T-34.2 | Create password reset request API endpoint | 3 | |
| T-34.3 | Generate and store password reset tokens with expiration | 3 | |
| T-34.4 | Integrate email service for sending reset emails | 3 | |
| T-34.5 | Create password reset page UI (enter new password) | 2 | |
| T-34.6 | Create reset password API endpoint with token validation | 3 | |
| T-34.7 | Write tests for password reset flow | 2 | |

---

### US-35: Database Setup & Connection
|**Field**|**Value**|
|---|---|
|**Description**|As a developer, I need to set up a database and connection layer so user data can be stored and retrieved persistently.|
|**Estimate**|3 days|
|**Priority**|5|
|**Acceptance Criteria**|Database provisioned; Connection pooling configured; Basic CRUD operations work; Environment-based config|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-35.1 | Choose and provision database (PostgreSQL/MongoDB/Supabase) | 3 | |
| T-35.2 | Create database connection configuration with environment variables | 2 | |
| T-35.3 | Set up ORM/query builder (Prisma, Drizzle, or similar) | 4 | |
| T-35.4 | Create initial database schema/migrations | 4 | |
| T-35.5 | Implement connection pooling for production | 2 | |
| T-35.6 | Create database seeding infrastructure and templates for future models | 3 | |
| T-35.7 | Set up database backup strategy documentation | 2 | |
| T-35.8 | Write integration tests for database operations | 4 | |

---

### US-36: Data Persistence Layer
|**Field**|**Value**|
|---|---|
|**Description**|As a user, I want my calendar events, courses, and settings to be saved automatically so I don't lose my data when I close the app.|
|**Estimate**|1.5 days|
|**Priority**|5|
|**Acceptance Criteria**|Events persist after page reload; User settings saved; Data syncs on changes; Offline changes queued|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-36.1 | Implement auto-save on data changes (debounced) | 3 | |
| T-36.2 | Implement basic offline support with localStorage queue | 4 | |
| T-36.3 | Create data sync mechanism on reconnection | 3 | |
| T-36.4 | Write tests for persistence infrastructure | 2 | |

**Note:** Apply optimistic UI updates with rollback on failure pattern to all data mutation tasks (event creation, updates, deletions, etc.)

---

### US-37: Time Zone Handling
|**Field**|**Value**|
|---|---|
|**Description**|As a user, I want the app to correctly handle my time zone so events and deadlines display at the correct local time.|
|**Estimate**|2 days|
|**Priority**|10|
|**Acceptance Criteria**|Auto-detect user time zone; Events display in local time; Time zone can be manually set; Database stores UTC|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-37.1 | Install and configure date-fns-tz or similar library | 2 | |
| T-37.2 | Auto-detect user's time zone on first visit | 2 | |
| T-37.3 | Store all dates in UTC in database | 2 | |
| T-37.4 | Convert UTC to local time on display | 3 | |
| T-37.5 | Add time zone selector in user settings | 3 | |
| T-37.6 | Handle daylight saving time transitions | 2 | |
| T-37.7 | Write tests for time zone conversions | 2 | |

---

### US-38: Scheduled Reminders/Notifications
|**Field**|**Value**|
|---|---|
|**Description**|As a user, I want to receive reminders before events and deadlines so I don't miss important activities.|
|**Estimate**|3 days|
|**Priority**|35|
|**Acceptance Criteria**|Set reminder time per event; Browser push notifications; In-app notification center; Email reminders optional|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-38.1 | Request and handle browser notification permissions | 3 | |
| T-38.2 | Create notification scheduling service | 4 | |
| T-38.3 | Implement in-app notification component and bell icon | 3 | |
| T-38.4 | Create notification preferences UI | 2 | |
| T-38.5 | Add reminder time selector to event creation/edit | 2 | |
| T-38.6 | Implement service worker for background notifications | 4 | |
| T-38.7 | Optional: Integrate email notification service | 4 | |
| T-38.8 | Write tests for notification scheduling | 2 | |

---

## Calendar & Events

---

### US-01: View Calendar with To-Do List
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to see my calendar and to-do list side-by-side so I can view my schedule and tasks at a glance.|
|**Estimate**|3 days|
|**Priority**|10|
|**Acceptance Criteria**|Calendar displays current week by default; To-do sidebar shows tasks; Responsive layout; Events color-coded|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-01.1 | Create main calendar grid component with week view | 6 | |
| T-01.2 | Implement month navigation (prev/next) | 2 | |
| T-01.3 | Create To-Do sidebar component | 4 | |
| T-01.4 | Display events on calendar grid with colors | 4 | |
| T-01.5 | Implement responsive layout (stack on mobile) | 3 | |
| T-01.6 | Add "today" indicator and navigation | 2 | |
| T-01.7 | Connect to events data from context/API | 3 | |

---

### US-02: Tag-Based Event System
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to tag events as Personal, School, Work, Meeting, or Fun so I can categorize and filter my activities by life category instead of just by course.|
|**Estimate**|2 days|
|**Priority**|10|
|**Acceptance Criteria**|5 default tags with colors; Tag selector in event form; Tags display on events; Custom tags can be created|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-02.1 | Define tag types and color scheme | 2 | |
| T-02.2 | Create tag selector dropdown component | 3 | |
| T-02.3 | Add tag field to event data model | 2 | |
| T-02.4 | Display tag badges on calendar events | 3 | |
| T-02.5 | Implement custom tag creation | 3 | |
| T-02.6 | Store tags in database with user association | 2 | |

---

### US-03: Create Calendar Events
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to create new calendar events with a title, date, time, location, and tag so I can add activities to my schedule.|
|**Estimate**|3 days|
|**Priority**|10|
|**Acceptance Criteria**|Modal form for new events; Required: title, date, time; Optional: location, description, tag; Events save to database|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-03.1 | Create AddEventModal component with form fields | 4 | |
| T-03.2 | Implement date and time pickers | 3 | |
| T-03.3 | Add form validation | 2 | |
| T-03.4 | Design event data model | 2 | |
| T-03.5 | Create event API endpoints (POST/GET) | 4 | |
| T-03.6 | Add floating action button to trigger modal | 2 | |
| T-03.7 | Update calendar display after event creation | 2 | |

---

### US-04: Filter Events by Tag
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to filter my calendar and to-do list by tag so I can focus on specific types of activities.|
|**Estimate**|1 day|
|**Priority**|20|
|**Acceptance Criteria**|Filter dropdown in calendar header; Multiple tags can be selected; Filters apply to both calendar and to-do|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-04.1 | Create tag filter dropdown component | 3 | |
| T-04.2 | Implement filter state management | 2 | |
| T-04.3 | Filter calendar events based on selection | 2 | |
| T-04.4 | Filter to-do items based on selection | 2 | |

---

### US-05: Navigation Menu
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want a navigation menu to access all app features (Calendar, Course Map, Personal, Study, Courses) so I can easily move between different tools.|
|**Estimate**|1 day|
|**Priority**|10|
|**Acceptance Criteria**|Sidebar navigation; Links to all main sections; Active state indicator; Collapsible on mobile|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-05.1 | Create Sidebar navigation component | 3 | |
| T-05.2 | Add navigation links with icons | 2 | |
| T-05.3 | Implement active route highlighting | 1 | |
| T-05.4 | Add mobile hamburger menu toggle | 2 | |

---

### US-06: View Day Timeline
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to click on a day and see a detailed timeline view of all events so I can see my full daily schedule.|
|**Estimate**|2 days|
|**Priority**|20|
|**Acceptance Criteria**|Click day to expand; Hourly timeline 6am-midnight; Events positioned by time; Navigate between days|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-06.1 | Create day timeline view component | 5 | |
| T-06.2 | Position events on timeline based on time | 4 | |
| T-06.3 | Add day navigation (prev/next) | 2 | |
| T-06.4 | Handle overlapping events display | 3 | |
| T-06.5 | Add click event to open event details | 2 | |

---

### US-23: Event Detail Page
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to view and edit event details including adding descriptions so I can manage my events.|
|**Estimate**|3 days|
|**Priority**|30|
|**Acceptance Criteria**|View all event fields; Edit mode toggle; Delete option; Save changes persists|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-23.1 | Create EventDetailPage component | 4 | |
| T-23.2 | Display all event information | 2 | |
| T-23.3 | Implement edit mode with form | 3 | |
| T-23.4 | Create update event API endpoint (PUT) | 2 | |
| T-23.5 | Create delete event API endpoint (DELETE) | 2 | |
| T-23.6 | Add delete functionality with confirmation | 2 | |
| T-23.7 | Navigate back to calendar after changes | 1 | |

---

### US-28: Calendar Event Conflict Detection
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to see warnings when events overlap so I can avoid scheduling conflicts.|
|**Estimate**|1 day|
|**Priority**|30|
|**Acceptance Criteria**|Warning shown when creating overlapping event; Conflicts highlighted on calendar; Can proceed anyway|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-28.1 | Implement time overlap detection algorithm | 3 | |
| T-28.2 | Show warning in event creation modal | 2 | |
| T-28.3 | Highlight conflicting events on calendar | 2 | |
| T-28.4 | Write tests for conflict detection | 2 | |

---

### US-29: To-Do List Task Management
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to mark tasks as complete and remove them from my to-do list so I can track my progress.|
|**Estimate**|1 day|
|**Priority**|20|
|**Acceptance Criteria**|Checkbox to mark complete; Completed tasks visually distinct; Option to delete; Completed count shown|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-29.1 | Add checkbox to to-do items | 2 | |
| T-29.2 | Style completed items (strikethrough, fade) | 1 | |
| T-29.3 | Persist completion status to database | 2 | |
| T-29.4 | Add delete button with confirmation | 2 | |
| T-29.5 | Show completion progress indicator | 1 | |

---

### US-40: Monthly Calendar View
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to view my calendar in a monthly view so I can understand the big-picture view of my schedule.|
|**Estimate**|2 days|
|**Priority**|25|
|**Acceptance Criteria**|Full month grid displayed; Events shown as dots or abbreviated; Click day to see details; Month navigation|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-40.1 | Create monthly calendar grid component | 5 | |
| T-40.2 | Display event indicators on days (dots/badges) | 3 | |
| T-40.3 | Add month navigation (prev/next, month picker) | 2 | |
| T-40.4 | Implement click day to expand/show events | 3 | |
| T-40.5 | Add view toggle (weekly/monthly) to calendar header | 2 | |
| T-40.6 | Handle responsive layout for monthly view | 2 | |

---

### US-41: Custom Event Categories
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to create, edit, and delete custom event categories with colors so I can personalize how I organize my schedule.|
|**Estimate**|1 day|
|**Priority**|25|
|**Acceptance Criteria**|Create new categories with name and color; Edit existing categories; Delete categories (with warning if events use it); Color picker UI|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-41.1 | Create category management UI (list view) | 2 | |
| T-41.2 | Add create category modal with name and color picker | 3 | |
| T-41.3 | Implement edit category functionality | 2 | |
| T-41.4 | Add delete category with confirmation and migration option | 2 | |
| T-41.5 | Persist custom categories to database | 2 | |

---

### US-42: Multiple To-Do Lists
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to create separate to-do lists for class and personal tasks so my responsibilities feel more organized.|
|**Estimate**|2 days|
|**Priority**|25|
|**Acceptance Criteria**|Create named to-do lists; Switch between lists; Assign tasks to specific lists; Default lists for "Class" and "Personal"|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-42.1 | Update data model to support multiple to-do lists | 3 | |
| T-42.2 | Create list selector/tabs in to-do sidebar | 3 | |
| T-42.3 | Add "Create New List" functionality | 2 | |
| T-42.4 | Implement list rename and delete | 2 | |
| T-42.5 | Add list assignment when creating tasks | 2 | |
| T-42.6 | Create default "Class" and "Personal" lists for new users | 2 | |
| T-42.7 | Update API endpoints for multi-list support | 3 | |

---

### US-43: Reorder To-Do Tasks
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to drag and reorder tasks in my to-do list so I can organize and prioritize my tasks.|
|**Estimate**|1 day|
|**Priority**|30|
|**Acceptance Criteria**|Drag handle on tasks; Drag and drop to reorder; Order persists after refresh; Visual feedback during drag|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-43.1 | Install and configure drag-and-drop library (dnd-kit or similar) | 2 | |
| T-43.2 | Add drag handle UI to task items | 1 | |
| T-43.3 | Implement drag-and-drop reordering logic | 3 | |
| T-43.4 | Persist task order to database | 2 | |
| T-43.5 | Add visual feedback (placeholder, drag preview) | 1 | |

---

### US-44: Study Resources Library
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to save and organize study links and resources by course or topic so I don't have to search across platforms.|
|**Estimate**|2 days|
|**Priority**|50|
|**Acceptance Criteria**|Add resource with URL, title, description; Organize by course or custom folder; Search/filter resources; Quick access from course pages|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-44.1 | Create StudyResourcesPage component | 3 | |
| T-44.2 | Design resource card component (title, URL, description, favicon) | 2 | |
| T-44.3 | Implement "Add Resource" modal | 3 | |
| T-44.4 | Create folder/course organization system | 3 | |
| T-44.5 | Add search and filter functionality | 2 | |
| T-44.6 | Create resource CRUD API endpoints | 3 | |
| T-44.7 | Add quick-add resource from course detail page | 2 | |

---

### US-45: Course Assignments View
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to view and track assignments for each course on the course page so I know what I need to do for each class.|
|**Estimate**|2 days|
|**Priority**|35|
|**Acceptance Criteria**|Assignments tab on course page; Show due date, status, grade; Add/edit assignments; Link to calendar events|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-45.1 | Create assignments tab content for course page | 3 | |
| T-45.2 | Design assignment list item (name, due date, status, grade) | 2 | |
| T-45.3 | Implement "Add Assignment" modal | 3 | |
| T-45.4 | Add status toggle (not started, in progress, submitted, graded) | 2 | |
| T-45.5 | Create assignment CRUD API endpoints | 3 | |
| T-45.6 | Link assignments to calendar as events | 2 | |
| T-45.7 | Show upcoming assignments on course card | 2 | |

---

## Course Management

---

### US-07: SE Degree Course Map
|**Field**|**Value**|
|---|---|
|**Description**|As a SE student, I want to view an interactive course map showing all required CS/SE courses and their prerequisites so I can plan my academic path.|
|**Estimate**|4 days|
|**Priority**|30|
|**Acceptance Criteria**|Visual flowchart of SE courses; Prerequisites shown as connections; Course status indicators; Click to see details|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-07.1 | Design course map layout and data structure | 4 | |
| T-07.2 | Create course node component | 3 | |
| T-07.3 | Implement prerequisite connection lines (SVG/Canvas) | 6 | |
| T-07.4 | Add zoom and pan functionality | 4 | |
| T-07.5 | Create course detail popup on click | 3 | |
| T-07.6 | Style nodes by completion status | 2 | |
| T-07.7 | Implement semester/year grouping | 4 | |
| T-07.8 | Add legend for course types | 2 | |

---

### US-08: CS Degree Course Maps
|**Field**|**Value**|
|---|---|
|**Description**|As a CS student, I want to view course maps for Computer Science degree tracks (BS, BA, Cybersecurity, Data Science) so I can see my specific degree requirements.|
|**Estimate**|3 days|
|**Priority**|30|
|**Acceptance Criteria**|Dropdown to select degree track; Map updates for each track; Track-specific courses highlighted|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-08.1 | Create degree track data for BS CS | 4 | |
| T-08.2 | Create degree track data for BA CS | 2 | |
| T-08.3 | Create Cybersecurity specialization data | 3 | |
| T-08.4 | Create Data Science specialization data | 3 | |
| T-08.5 | Add degree track selector dropdown | 2 | |
| T-08.6 | Update map display based on selected track | 4 | |
| T-08.7 | Highlight track-specific required courses | 2 | |

---

### US-09: Course Prerequisite Visualization
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to see prerequisite chains highlighted when I select a course so I understand what I need to take first.|
|**Estimate**|2 days|
|**Priority**|30|
|**Acceptance Criteria**|Click course to highlight prerequisites; Show full prerequisite chain; Distinguish direct vs indirect prereqs|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-09.1 | Build prerequisite chain traversal algorithm | 4 | |
| T-09.2 | Highlight direct prerequisites on course selection | 3 | |
| T-09.3 | Highlight indirect prerequisites (prereqs of prereqs) | 3 | |
| T-09.4 | Show "leads to" courses (courses this unlocks) | 3 | |
| T-09.5 | Add animation for highlighting | 2 | |

---

### US-10: Degree Progress Tracking
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to see which courses I've completed, am currently taking, and still need so I can track my progress toward graduation.|
|**Estimate**|2 days|
|**Priority**|30|
|**Acceptance Criteria**|Progress bar showing overall completion; Courses marked as complete/current/needed; Credit hour totals|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-10.1 | Create degree progress page component | 4 | |
| T-10.2 | Calculate and display overall progress percentage | 2 | |
| T-10.3 | Group courses by category (core, electives, gen-ed) | 3 | |
| T-10.4 | Add ability to mark courses complete/in-progress | 3 | |
| T-10.5 | Calculate total credits completed/remaining | 2 | |
| T-10.6 | Sync course status with course map | 2 | |

---

### US-19: Course List View
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to see a list of all my enrolled courses with their details so I can access course information.|
|**Estimate**|2 days|
|**Priority**|20|
|**Acceptance Criteria**|List view of enrolled courses; Show course name, instructor, time; Click to view details|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-19.1 | Create CourseListPage component | 3 | |
| T-19.2 | Design course data model | 2 | |
| T-19.3 | Create course API endpoints (GET) | 2 | |
| T-19.4 | Design course card component | 2 | |
| T-19.5 | Display course information on cards | 2 | |
| T-19.6 | Link cards to course detail pages | 1 | |

---

### US-20: Course Detail Page
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to view detailed information about a course including instructor, schedule, and description.|
|**Estimate**|2 days|
|**Priority**|20|
|**Acceptance Criteria**|Full course info displayed; Syllabus section; Schedule/meeting times; Instructor contact|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-20.1 | Create CourseDetailPage component | 4 | |
| T-20.2 | Display course header with name and code | 2 | |
| T-20.3 | Show instructor information section | 2 | |
| T-20.4 | Display meeting schedule | 2 | |
| T-20.5 | Add course description section | 2 | |
| T-20.6 | Create tabs for Notes, Files, Assignments | 3 | |

---

### US-21: Course Content Management
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to create notes and upload files for each course so I can keep all my study materials organized in one place.|
|**Estimate**|4 days|
|**Priority**|40|
|**Acceptance Criteria**|Create/edit notes with rich text; Upload files (PDF, images, docs); Organize in folders; Search notes and files; Auto-save notes|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-21.1 | Create course content tabs (Notes/Files) | 2 | |
| T-21.2 | Create notes list component for course | 3 | |
| T-21.3 | Implement rich text editor (TipTap or similar) | 6 | |
| T-21.4 | Create file upload component with drag-and-drop | 4 | |
| T-21.5 | Set up file storage (cloud storage integration) | 4 | |
| T-21.6 | Create notes and files CRUD API endpoints | 4 | |
| T-21.7 | Implement auto-save for notes with debounce | 3 | |
| T-21.8 | Add search functionality for notes and files | 3 | |
| T-21.9 | Create folder organization system | 3 | |

---

### US-25: What-If Mode for Courses
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to toggle "What If" mode to see how adding or removing courses would affect my schedule and calendar.|
|**Estimate**|2 days|
|**Priority**|50|
|**Acceptance Criteria**|Toggle button activates What-If mode; Add hypothetical courses; See schedule impact; Changes not saved until confirmed|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-25.1 | Create What-If mode toggle and context | 4 | |
| T-25.2 | Style UI differently in What-If mode | 2 | |
| T-25.3 | Allow adding/removing courses temporarily | 4 | |
| T-25.4 | Show schedule preview with changes | 3 | |
| T-25.5 | Add "Apply Changes" and "Discard" buttons | 2 | |

---

### US-26: Mock Data - CS/SE Courses
|**Field**|**Value**|
|---|---|
|**Description**|As a developer, I need mock data for all CS and SE courses with prerequisites so the course map can be demonstrated.|
|**Estimate**|2 days|
|**Priority**|20|
|**Acceptance Criteria**|All CS courses with code, name, credits, prerequisites; All SE courses; Prerequisite relationships accurate|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-26.1 | Research and document all CS course offerings | 3 | |
| T-26.2 | Research and document all SE course offerings | 3 | |
| T-26.3 | Create course data structure/TypeScript types | 2 | |
| T-26.4 | Implement CS course mock data file | 4 | |
| T-26.5 | Implement SE course mock data file | 4 | |
| T-26.6 | Define prerequisite relationships | 2 | |

---

### US-27: Mock Data - Supporting Courses
|**Field**|**Value**|
|---|---|
|**Description**|As a developer, I need mock data for math, science, and gen-ed courses that support CS/SE degrees.|
|**Estimate**|1 day|
|**Priority**|20|
|**Acceptance Criteria**|Math courses (Calc, Linear Algebra, etc.); Science labs; Writing requirements; Gen-ed electives|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-27.1 | Create math course mock data | 2 | |
| T-27.2 | Create science course mock data | 2 | |
| T-27.3 | Create gen-ed course mock data | 2 | |
| T-27.4 | Link supporting courses to degree requirements | 2 | |

---

## Personal Tools

---

### US-11: Budget Planner Overview
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to see a monthly budget overview showing income, expenses, and remaining balance so I can manage my finances.|
|**Estimate**|2 days|
|**Priority**|40|
|**Acceptance Criteria**|Monthly summary card; Income vs expenses; Remaining balance; Month selector|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-11.1 | Create BudgetPlannerPage component | 4 | |
| T-11.2 | Design monthly summary card | 3 | |
| T-11.3 | Calculate and display totals | 2 | |
| T-11.4 | Add month navigation | 2 | |
| T-11.5 | Create budget data model and storage | 3 | |

---

### US-12: Add Budget Transactions
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to add income and expense transactions with categories so I can track where my money goes.|
|**Estimate**|2 days|
|**Priority**|40|
|**Acceptance Criteria**|Add transaction form; Income/expense toggle; Category selection; Transaction list|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-12.1 | Create AddTransactionModal component | 4 | |
| T-12.2 | Define expense categories (Food, Transport, etc.) | 2 | |
| T-12.3 | Implement transaction list component | 3 | |
| T-12.4 | Create transaction CRUD API endpoints | 4 | |
| T-12.5 | Add edit/delete functionality for transactions | 3 | |

---

### US-13: Budget Category Visualization
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to see pie charts and progress bars showing spending by category so I can visualize my budget.|
|**Estimate**|2 days|
|**Priority**|50|
|**Acceptance Criteria**|Pie chart of spending by category; Progress bars for budget limits; Color-coded categories|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-13.1 | Integrate charting library (Recharts) | 2 | |
| T-13.2 | Create spending pie chart component | 4 | |
| T-13.3 | Create category progress bars | 3 | |
| T-13.4 | Add budget limit setting per category | 3 | |
| T-13.5 | Show warnings when approaching/exceeding limits | 2 | |

---

### US-14: Time Blocking System
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want to create and manage time blocks for daily and weekly planning so I can organize my time effectively.|
|**Estimate**|5 days|
|**Priority**|40|
|**Acceptance Criteria**|Daily timeline view; Weekly view; Drag to create/edit blocks; Activity type assignment; Save/load presets; Color-coded blocks|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-14.1 | Create TimeBlockingPage component with daily/weekly toggle | 4 | |
| T-14.2 | Implement daily timeline grid | 4 | |
| T-14.3 | Add drag-to-create time block functionality | 6 | |
| T-14.4 | Create activity type selector | 3 | |
| T-14.5 | Implement block resize and move | 4 | |
| T-14.6 | Create weekly time block grid component | 5 | |
| T-14.7 | Implement week navigation | 2 | |
| T-14.8 | Add copy block to another day feature | 3 | |
| T-14.9 | Create preset data model and save/load functionality | 4 | |
| T-14.10 | Add "Save as Preset" and preset library UI | 4 | |
| T-14.11 | Add time block data persistence | 3 | |

---

### US-24: User Profile
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want a profile page showing my information so I can view and manage my account.|
|**Estimate**|2 days|
|**Priority**|60|
|**Acceptance Criteria**|Display name, email, avatar; Edit profile info; Change password option; Notification settings|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-24.1 | Create ProfilePage component | 3 | |
| T-24.2 | Display user information | 2 | |
| T-24.3 | Add edit profile form | 2 | |
| T-24.4 | Implement avatar upload | 2 | |
| T-24.5 | Add change password section | 2 | |
| T-24.6 | Design user settings data model | 2 | |
| T-24.7 | Create user settings CRUD API endpoints | 3 | |

---

## Study Tools

---

### US-17: Study Timer (Pomodoro & Custom)
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want a study timer with both Pomodoro intervals and custom durations so I can manage my study sessions effectively.|
|**Estimate**|2 days|
|**Priority**|50|
|**Acceptance Criteria**|Pomodoro mode (25/5/15 min cycles); Custom timer mode; Start/pause/reset controls; Audio alerts; Timer presets|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-17.1 | Create StudyTimer component with mode selector | 3 | |
| T-17.2 | Implement Pomodoro mode (25/5/15 min cycles) | 3 | |
| T-17.3 | Implement custom timer mode with time input | 2 | |
| T-17.4 | Add start/pause/reset controls | 2 | |
| T-17.5 | Play audio notification on timer complete | 1 | |
| T-17.6 | Add preset timer durations (quick select) | 2 | |
| T-17.7 | Add cycle counter and session tracking for Pomodoro | 3 | |

---

### US-18: Picker Wheel
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want a picker wheel that randomly selects from my options so I can decide what to study or do next in a more engaging way.|
|**Estimate**|2 days|
|**Priority**|60|
|**Acceptance Criteria**|Add custom options; Spin animation; Random selection; Remove/edit options|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-18.1 | Create PickerWheel component with canvas/SVG | 6 | |
| T-18.2 | Implement spin animation | 4 | |
| T-18.3 | Add random selection logic | 2 | |
| T-18.4 | Create options input form | 2 | |
| T-18.5 | Save wheel configurations | 2 | |

---

### US-30: Responsive Mobile Layout
|**Field**|**Value**|
|---|---|
|**Description**|As a student, I want the app to work on mobile devices so I can check my schedule on the go.|
|**Estimate**|3 days|
|**Priority**|70|
|**Acceptance Criteria**|All pages usable on mobile; Touch-friendly interactions; Collapsible navigation; Readable text sizes|

#### Tasks
| Task ID | Task Description | Est (hrs) | Assignee |
|---------|------------------|-----------|----------|
| T-30.1 | Audit all pages for mobile responsiveness | 4 | |
| T-30.2 | Implement mobile navigation (hamburger menu) | 4 | |
| T-30.3 | Adjust calendar layout for mobile | 4 | |
| T-30.4 | Fix touch targets and interactions | 4 | |
| T-30.5 | Test on various screen sizes | 4 | |
| T-30.6 | Optimize performance for mobile devices | 3 | |

---

# Project Plan

**Project Estimate (remaining):** 91 days  
**Days in Iteration:** 4 developers × 14 days × 0.7 velocity = 39 dev-days per iteration
**Sprints per Iteration:** 3 sprints
**Total Iterations:** 4

## Iteration 1
**Focus:** Infrastructure, Authentication & Database Foundation  
**Iteration Total:** 18 days

### Sprint 1 (6 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-35: Database Setup & Connection | 3 | 5 | All persistence features |
| US-31: User Account Registration | 3 | 5 | US-32, US-33, US-34 |

### Sprint 2 (6 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-32: User Login/Authentication | 2 | 5 | US-33, all user features |
| US-33: Session Management | 2 | 5 | - |
| US-36: Data Persistence Layer | 2 | 5 | All data features |

### Sprint 3 (6 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-05: Navigation Menu | 1 | 10 | All features |
| US-37: Time Zone Handling | 2 | 10 | Calendar, Events |
| US-26: Mock Data - CS/SE Courses | 2 | 20 | US-07, US-08 |
| US-27: Mock Data - Supporting Courses | 1 | 20 | US-07, US-10 |

---

## Iteration 2
**Focus:** Core Calendar, Events & To-Do Lists  
**Iteration Total:** 23 days

### Sprint 1 (7 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-01: View Calendar with To-Do Sidebar | 3 | 10 | US-03, US-04 |
| US-02: Tag-Based Event System | 2 | 10 | US-03, US-04 |
| US-34: Password Reset | 2 | 15 | - |

### Sprint 2 (7 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-03: Create Calendar Events | 3 | 10 | US-06, US-23 |
| US-04: Filter Events by Tag | 1 | 20 | - |
| US-19: Course List View | 2 | 20 | US-20 |
| US-29: To-Do List Task Management | 1 | 20 | - |

### Sprint 3 (8 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-06: View Day Timeline | 2 | 20 | US-28 |
| US-40: Monthly Calendar View | 2 | 25 | - |
| US-41: Custom Event Categories | 1 | 25 | - |
| US-42: Multiple To-Do Lists | 2 | 25 | - |
| US-43: Reorder To-Do Tasks | 1 | 30 | - |

---

## Iteration 3
**Focus:** Course Features, Degree Planning & Event Details  
**Iteration Total:** 26 days

### Sprint 1 (8 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-20: Course Detail Page | 2 | 20 | US-21, US-45 |
| US-28: Calendar Event Conflict Detection | 1 | 30 | - |
| US-10: Degree Progress Tracking | 2 | 30 | - |
| US-23: Event Detail Page | 3 | 30 | - |

### Sprint 2 (7 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-07: SE Degree Course Map | 4 | 30 | US-09 |
| US-08: CS Degree Course Maps | 3 | 30 | US-09 |

### Sprint 3 (10 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-09: Course Prerequisite Visualization | 2 | 30 | - |
| US-38: Scheduled Reminders/Notifications | 2 | 35 | - |
| US-45: Course Assignments View | 2 | 35 | - |
| US-21: Course Notes | 4 | 40 | - |

---

## Iteration 4
**Focus:** Personal Tools, Budget, Study Features & Polish  
**Iteration Total:** 24 days

### Sprint 1 (8 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-11: Budget Planner Overview | 2 | 40 | US-12, US-13 |
| US-12: Add Budget Transactions | 2 | 40 | US-13 |
| US-13: Budget Category Visualization | 2 | 50 | - |
| US-44: Study Resources Library | 2 | 50 | - |

### Sprint 2 (9 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-14: Time Blocking Daily View | 3 | 40 | US-15, US-16 |
| US-15: Time Blocking Weekly View | 2 | 50 | - |
| US-25: What-If Mode for Courses | 2 | 50 | - |
| US-17: Focus Timer (Pomodoro) | 2 | 50 | - |

### Sprint 3 (7 days)
| Title | Estimate | Priority | Dependency For |
|-------|----------|----------|----------------|
| US-16: Time Block Presets | 2 | 60 | - |
| US-18: Picker Wheel | 2 | 60 | - |
| US-24: User Profile | 2 | 60 | - |
| US-46: Custom Timer | 1 | 55 | - |

<!-- Note: US-22 Course Files (2 days, Priority 50) and US-30 Responsive Mobile Layout (3 days, Priority 70) deferred to future iteration -->

---

## Appendix: CS/SE Degree Maps (Mock Data Scope)

### Degree Programs to Implement:
1. **B.S. Computer Science** - Core CS curriculum
2. **B.S. Software Engineering - General Track**
3. **B.S. Software Engineering - Web Development Track**
4. **B.S. Software Engineering - Systems Track**
5. **B.S. Software Engineering - Data Science Track**

### Course Categories for Mock Data:
- **CS Core:** CS 2010, CS 2020, CS 2190, CS 3060, CS 3080, CS 3350, CS 4120, CS 4400, etc.
- **SE Core:** SE 3540, SE 4200, SE 4770, SE 4910, etc.
- **Math:** MATH 1280, MATH 1340, MATH 1350, MATH 2210, etc.
- **Science:** BIO, CHEM, PHYS lab sequences
- **Gen-Ed:** Writing, Language, Social Science requirements

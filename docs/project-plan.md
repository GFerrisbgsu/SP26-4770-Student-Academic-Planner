# Project Name: Student Life - Smart Academic Calendar
# Team members:
- Grant Ferris
- Megan Brown
- Cassidy Kibby
- Shivani Pallerla

# Table of Contents
* [Changes](#changes)
* [User Stories](#user-stories)
* [Project Plan](#project-plan)
	* [Iteration 1](#iteration-1)
	* [Iteration 2](#iteration-2)
	* [Iteration 3](#iteration-3)
	* [Iteration 4](#iteration-4)

# Changes
* Brief rationale/explanation of changes and client sign-off:
* 1/27/2026 - Initial plan created
	* Client: -
* 1/28/2026 - Merged teammate's user stories, added US-40 through US-46
	* Added: Monthly calendar view, custom categories, to-do list organization, task reordering, study resources, course assignments view
	* Client: -

# User Stories

## Infrastructure & Authentication Stories

|**Title**|US-31: User Account Registration |
|---|---|
|**Description**|As a new user, I want to create an account with my email and password so I can have a personalized experience and save my data.|
|**Estimate**|3 days|
|**Priority**|5|

|**Title**|US-32: User Login/Authentication |
|---|---|
|**Description**|As a registered user, I want to log in with my credentials so I can access my personal calendar, courses, and settings.|
|**Estimate**|2 days|
|**Priority**|5|

|**Title**|US-33: Session Management |
|---|---|
|**Description**|As a user, I want to stay logged in across browser sessions and be automatically logged out after inactivity so my account stays secure.|
|**Estimate**|2 days|
|**Priority**|5|

|**Title**|US-34: Password Reset |
|---|---|
|**Description**|As a user, I want to reset my password via email if I forget it so I can regain access to my account.|
|**Estimate**|2 days|
|**Priority**|15|

|**Title**|US-35: Database Setup & Connection |
|---|---|
|**Description**|As a developer, I need to set up a database and connection layer so user data can be stored and retrieved persistently.|
|**Estimate**|3 days|
|**Priority**|5|

|**Title**|US-36: Data Persistence Layer |
|---|---|
|**Description**|As a user, I want my calendar events, courses, and settings to be saved automatically so I don't lose my data when I close the app.|
|**Estimate**|2 days|
|**Priority**|5|

|**Title**|US-37: Time Zone Handling |
|---|---|
|**Description**|As a user, I want the app to correctly handle my time zone so events and deadlines display at the correct local time.|
|**Estimate**|2 days|
|**Priority**|10|

|**Title**|US-38: Scheduled Reminders/Notifications |
|---|---|
|**Description**|As a user, I want to receive reminders before events and deadlines so I don't miss important activities.|
|**Estimate**|2 days|
|**Priority**|35|

## Calendar & Event Stories

|**Title**|US-01: View Weekly Calendar with To-Do List |
|---|---|
|**Description**|As a student, I want to see my weekly calendar and to-do list side-by-side so I can view my schedule and tasks at a glance.|
|**Estimate**|3 days|
|**Priority**|10|

|**Title**|US-02: Tag-Based Event System |
|---|---|
|**Description**|As a student, I want to tag events as Personal, School, Work, Meeting, or Fun so I can categorize and filter my activities by life category instead of just by course.|
|**Estimate**|2 days|
|**Priority**|10|

|**Title**|US-03: Create Calendar Events |
|---|---|
|**Description**|As a student, I want to create new calendar events with a title, date, time, location, and tag so I can add activities to my schedule.|
|**Estimate**|3 days|
|**Priority**|10|

|**Title**|US-04: Filter Events by Tag |
|---|---|
|**Description**|As a student, I want to filter my calendar and to-do list by tag so I can focus on specific types of activities.|
|**Estimate**|1 day|
|**Priority**|20|

|**Title**|US-05: Navigation Menu |
|---|---|
|**Description**|As a student, I want a navigation menu to access all app features (Calendar, Course Map, Personal, Study, Courses) so I can easily move between different tools.|
|**Estimate**|1 day|
|**Priority**|10|

|**Title**|US-06: View Day Timeline |
|---|---|
|**Description**|As a student, I want to click on a day and see a 
detailed timeline view of all events so I can see my full daily 
schedule.|
|**Estimate**|2 days|
|**Priority**|20|

|**Title**|US-07: SE Degree Course Map |
|---|---|
|**Description**|As a SE student, I want to view an interactive course map showing all required CS/SE courses and their prerequisites so I can plan my academic path.|
|**Estimate**|4 days|
|**Priority**|30|

|**Title**|US-08: CS Degree Course Maps |
|---|---|
|**Description**|As an CS student, I want to view course maps for 
Computer Science degree tracks (BS, BA, Cybersecurity specialization, data science specialization) so I can see my specific degree requirements.|
|**Estimate**|3 days|
|**Priority**|30|

|**Title**|US-09: Course Prerequisite Visualization |
|---|---|
|**Description**|As a student, I want to see prerequisite chains highlighted when I select a course so I understand what I need to take 
first.|
|**Estimate**|2 days|
|**Priority**|30|

|**Title**|US-10: Degree Progress Tracking |
|---|---|
|**Description**|As a student, I want to see which courses I've 
completed, am currently taking, and still need so I can track my 
progress toward graduation.|
|**Estimate**|2 days|
|**Priority**|30|

|**Title**|US-11: Budget Planner Overview |
|---|---|
|**Description**|As a student, I want to see a monthly budget overview showing income, expenses, and remaining balance so I can manage my finances.|
|**Estimate**|2 days|
|**Priority**|40|

|**Title**|US-12: Add Budget Transactions |
|---|---|
|**Description**|As a student, I want to add income and expense transactions with categories so I can track where my money goes.|
|**Estimate**|2 days|
|**Priority**|40|

|**Title**|US-13: Budget Category Visualization |
|---|---|
|**Description**|As a student, I want to see pie charts and progress bars showing spending by category so I can visualize my budget.|
|**Estimate**|2 days|
|**Priority**|50|

|**Title**|US-14: Time Blocking System |
|---|---|
|**Description**|As a student, I want to create and manage time blocks for daily and weekly planning so I can organize my time effectively.|
|**Estimate**|5 days|
|**Priority**|40|

|**Title**|US-18: Picker Wheel |
|---|---|
|**Description**|As a student, I want a picker wheel that randomly 
selects from my options so I can decide what to study or do next in more engaging way.|
|**Estimate**|2 days|
|**Priority**|60|

|**Title**|US-19: Course List View |
|---|---|
|**Description**|As a student, I want to see a list of all my enrolled courses with their details so I can access course information.|
|**Estimate**|2 days|
|**Priority**|20|

|**Title**|US-20: Course Detail Page |
|---|---|
|**Description**|As a student, I want to view detailed information about 
a course including instructor, schedule, and description.|
|**Estimate**|2 days|
|**Priority**|20|

|**Title**|US-21: Course Content Management |
|---|---|
|**Description**|As a student, I want to create notes and upload files for each course so I can keep all my study materials organized in one place.|
|**Estimate**|4 days|
|**Priority**|40|

|**Title**|US-23: Event Detail Page |
|---|---|
|**Description**|As a student, I want to view and edit event details including adding descriptions so I can manage my events.|
|**Estimate**|3 days|
|**Priority**|30|

|**Title**|US-24: User Profile |
|---|---|
|**Description**|As a student, I want a profile page showing my information so I can view and manage my account.|
|**Estimate**|2 days|
|**Priority**|60|

|**Title**|US-25: What-If Mode for Courses |
|---|---|
|**Description**|As a student, I want to toggle "What If" mode to see how adding or removing courses would affect my schedule and calendar.|
|**Estimate**|2 days|
|**Priority**|50|

|**Title**|US-26: Mock Data - CS/SE Courses |
|---|---|
|**Description**|As a developer, I need mock data for all CS and SE courses with prerequisites so the course map can be demonstrated.|
|**Estimate**|2 days|
|**Priority**|20|

|**Title**|US-27: Mock Data - Supporting Courses |
|---|---|
|**Description**|As a developer, I need mock data for math, science, and gen-ed courses that support CS/SE degrees.|
|**Estimate**|1 day|
|**Priority**|20|

|**Title**|US-28: Calendar Event Conflict Detection |
|---|---|
|**Description**|As a student, I want to see warnings when events overlap so I can avoid scheduling conflicts.|
|**Estimate**|1 day|
|**Priority**|30|

|**Title**|US-29: To-Do List Task Management |
|---|---|
|**Description**|As a student, I want to mark tasks as complete and remove them from my to-do list so I can track my progress.|
|**Estimate**|1 day|
|**Priority**|20|

|**Title**|US-40: Monthly Calendar View |
|---|---|
|**Description**|As a student, I want to view my calendar in a monthly view so I can understand the big-picture view of my schedule.|
|**Estimate**|2 days|
|**Priority**|25|

|**Title**|US-41: Custom Event Categories |
|---|---|
|**Description**|As a student, I want to create, edit, and delete custom event categories with colors so I can personalize how I organize my schedule.|
|**Estimate**|1 day|
|**Priority**|25|

|**Title**|US-42: Multiple To-Do Lists |
|---|---|
|**Description**|As a student, I want to create separate to-do lists for class and personal tasks so my responsibilities feel more organized.|
|**Estimate**|2 days|
|**Priority**|25|

|**Title**|US-43: Reorder To-Do Tasks |
|---|---|
|**Description**|As a student, I want to drag and reorder tasks in my to-do list so I can organize and prioritize my tasks.|
|**Estimate**|1 day|
|**Priority**|30|

|**Title**|US-44: Study Resources Library |
|---|---|
|**Description**|As a student, I want to save and organize study links and resources by course or topic so I don't have to search across platforms.|
|**Estimate**|2 days|
|**Priority**|50|

|**Title**|US-45: Course Assignments View |
|---|---|
|**Description**|As a student, I want to view and track assignments for each course on the course page so I know what I need to do for each class.|
|**Estimate**|2 days|
|**Priority**|35|

# Project Plan
**Project Estimate (remaining):** 91 days<br/>
**Days in Iteration:** 4 developers × 14 days × 0.7 velocity = 39 dev-days per iteration<br/>
**Sprints per Iteration:** 3 sprints<br/>
**Total Iterations:** 4<br/>

## Iteration 1
**Focus:** Infrastructure, Authentication & Database Foundation
**Iteration Total:** 18 days

### Sprint 1
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-35: Database Setup & Connection | 3 | 5 | All persistence features |
|US-31: User Account Registration | 3 | 5 | US-32, US-33, US-34 |
| **Total Days**| 6 | | |

### Sprint 2
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-32: User Login/Authentication | 2 | 5 | US-33, all user features |
|US-33: Session Management | 2 | 5 | - |
|US-36: Data Persistence Layer | 2 | 5 | All data features |
| **Total Days**| 6 | | |

### Sprint 3
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-05: Navigation Menu | 1 | 10 | All features |
|US-37: Time Zone Handling | 2 | 10 | Calendar, Events |
|US-26: Mock Data - CS/SE Courses | 2 | 20 | US-07, US-08 |
|US-27: Mock Data - Supporting Courses | 1 | 20 | US-07, US-10 |
| **Total Days**| 6 | | |

## Iteration 2
**Focus:** Core Calendar, Events & To-Do Lists
**Iteration Total:** 23 days

### Sprint 1
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-01: View Calendar with To-Do List | 3 | 10 | US-03, US-04 |
|US-02: Tag-Based Event System | 2 | 10 | US-03, US-04 |
|US-34: Password Reset | 2 | 15 | - |
| **Total Days**| 7 | | |

### Sprint 2
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-03: Create Calendar Events | 3 | 10 | US-06, US-23 |
|US-04: Filter Events by Tag | 1 | 20 | - |
|US-19: Course List View | 2 | 20 | US-20 |
|US-29: To-Do List Task Management | 1 | 20 | - |
| **Total Days**| 7 | | |

### Sprint 3
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-06: View Day Timeline | 2 | 20 | US-28 |
|US-40: Monthly Calendar View | 2 | 25 | - |
|US-41: Custom Event Categories | 1 | 25 | - |
|US-42: Multiple To-Do Lists | 2 | 25 | - |
|US-43: Reorder To-Do Tasks | 1 | 30 | - |
| **Total Days**| 8 | | |

## Iteration 3
**Focus:** Course Features, Degree Planning & Event Details
**Iteration Total:** 26 days

### Sprint 1
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-20: Course Detail Page | 2 | 20 | US-21, US-45 |
|US-28: Calendar Event Conflict Detection | 1 | 30 | - |
|US-10: Degree Progress Tracking | 2 | 30 | - |
|US-23: Event Detail Page | 3 | 30 | - |
| **Total Days**| 8 | | |

### Sprint 2
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-07: SE Degree Course Map | 4 | 30 | US-09 |
|US-08: CS Degree Course Maps | 3 | 30 | US-09 |
| **Total Days**| 7 | | |

### Sprint 3
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-09: Course Prerequisite Visualization | 2 | 30 | - |
|US-38: Scheduled Reminders/Notifications | 2 | 35 | - |
|US-45: Course Assignments View | 2 | 35 | - |
|US-21: Course Content Management | 4 | 40 | - |
| **Total Days**| 10 | | |

## Iteration 4
**Focus:** Personal Tools, Budget, Study Features & Polish
**Iteration Total:** 24 days

### Sprint 1
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-11: Budget Planner Overview | 2 | 40 | US-12, US-13 |
|US-12: Add Budget Transactions | 2 | 40 | US-13 |
|US-13: Budget Category Visualization | 2 | 50 | - |
|US-44: Study Resources Library | 2 | 50 | - |
| **Total Days**| 8 | | |

### Sprint 2
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-14: Time Blocking System | 5 | 40 | - |
|US-25: What-If Mode for Courses | 2 | 50 | - |
|US-17: Study Timer (Pomodoro & Custom) | 2 | 50 | - |
| **Total Days**| 9 | | |

### Sprint 3
|Title| Estimate (days)|Priority|Dependency For|
|---|---:|---:|---|
|US-18: Picker Wheel | 2 | 60 | - |
|US-24: User Profile | 2 | 60 | - |
|**Buffer for polish, testing, and bug fixes** | 3 | - | - |
| **Total Days**| 7 | | |

<!-- Removed consolidated stories: US-15, US-16 (merged into US-14), US-22 (merged into US-21), US-46 (merged into US-17) -->
<!-- Note: US-30 Responsive Mobile Layout (3 days, Priority 70) deferred to future iteration -->

---

## Appendix: CS/SE Degree Maps (Mock Data Scope)

### Degree Programs to Implement:
1. **B.S. Computer Science** - Core CS curriculum
2. **B.S. Software Engineering - General Track**
3. **B.S. Software Engineering - Web Development Track**
4. **B.S. Software Engineering - Systems Track**
5. **B.S. Software Engineering - Data Science Track**

### Course Categories for Mock Data:
- **CS Core:** CS 2010, CS 2020, CS 2190, CS 3060, CS 3080, CS 3350, 
  CS 4120, CS 4400, etc.
- **SE Core:** SE 3540, SE 4200, SE 4770, SE 4910, etc.
- **Math:** MATH 1280, MATH 1340, MATH 1350, MATH 2210, etc.
- **Science:** BIO, CHEM, PHYS lab sequences
- **Gen-Ed:** Writing, Language, Social Science requirements
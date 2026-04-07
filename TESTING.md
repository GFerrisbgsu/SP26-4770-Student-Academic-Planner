# Iteration #1

## Sprint #1

| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #35.1-5 & #35.7 (testing issue) | Test files: UserControllerTest, UserServiceTest, UserRepositoryTest | Auto | [INFO] Results: [INFO] Tests run: 60, Failures: 0 Errors: 0, Skipped: 0 |
| #35.6 | Seeding occurs on startup with database having 2 new users from UserSeeder | Manual | Pass  - seeding logs show on startup in terminal and the 2 users are in the database |
| #36.1 | Auto-save functionality: Changes save automatically with 500ms debounce; localStorage persistence working; useAutoSave hook prevents rapid saves | Manual | Pass - Tested in browser console, data persists across refreshes |
| #36.2 | Offline mode detection: App detects offline state; sync indicator shows "☁️ Offline"; navigator.onLine returns false; network status listeners working | Manual | Pass - DevTools Network tab "Offline" mode triggers indicator |
| #36.3 | Queue system: Requests queued while offline; localStorage stores queue with correct format (/users not /api/users); queue size displayed in indicator; priority system working | Manual | Pass - Added items to queue, verified in Application tab |
| #36.4 | Auto-sync on reconnect: Queue automatically syncs when returning online; wasOffline detection triggers sync; GET /users succeeds (200 OK); queue clears after successful sync; sync indicator shows "Saved" | Manual | Pass - Toggled offline/online in DevTools, requests sent to backend | 

## Sprint #2

## Sprint #3

| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #03 | Can calendar events be created, and are event API endpoints set up correctly | Manual | Pass |
| #32 | Can users log in with valid credentials and access protected routes | Manual | Pass
| #32 | Are invalid login attempts properly rejected without granting access | Manual | Pass
| #32 | Does logout correctly clear the session and prevent access to protected routes | Manual | Pass
| #32 | Do protected API endpoints return 401/403 when accesses without authentication | Manual (Postman) | Pass
| #32 | Do authenticated API requests succeed when proper authorization headers are included | Manual (Postman) | Pass
| #32 | Is authentication state properly maintained between frontend and backend | Manual | Pass
| #05 | Does the navigation bar appear on the side | Manual | Pass
| #05 | Do the routes take you to the correct page | Manual | Pass
| #05 | Is the navigation bar collapsable | Manual | Pass

# Iteration #2

## Sprint #4
| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #31 | Can a user successfuly register with valid username, email, and password | Manual | Pass
| #31 | Does the system prevent registration when all fields are left blank | Manual | Pass
| #31 | Does the system validate required fields (username, email, password) | Manual | Pass
| #31 | Does the system prevent registration when passwords to not mathc or do not match minimum password length requirements | Manual | Pass
| #31 | Does the system prevent duplicate email/username registration | Manual | Pass
| #31 | Is passwword data securely hashed in the database after registration | Manual | Pass
| #31 | User registration triggers email confirmation via Resend | Manual | Pass
| #31 | Does refreshing the page during registration prevent duplicate submissions | Manual | Pass
| #33 | Can users log in successfully and receive HttpOnly cookies (accessToken, refreshToken) | Manual | Pass
| #33 | Does login fail appropriately with invalid credentials showing error message | Manual | Pass
| #33 | Are HttpOnly cookies inaccessible to JavaScript for security | Manual | Pass
| #33 | Does automatic token refresh occur at 13-minute mark with new token issued | Manual | Pass
| #33 | Does "Remember Me" extend refresh token to 30 days vs 7 days default | Manual | Pass
| #33 | Does 30-minute inactivity timeout automatically log out inactive users | Manual | Pass
| #33 | Does user activity (mouse/keyboard) reset the inactivity timer | Manual | Pass
| #33 | Does manual logout clear all cookies and redirect to login page | Manual | Pass
| #33 | Are logged out tokens blacklisted and cannot be reused for refresh | Manual | Pass
| #33 | Do protected routes redirect unauthenticated users to login page | Manual | Pass
| #33 | Are authenticated users redirected away from login page to home | Manual | Pass
| #33 | Does token cleanup scheduler remove expired tokens from blacklist | Manual | Pass
| #33 | Can users register a new passkey with browser authenticator completing end-to-end | Manual | Pass
| #33 | Does registered passkey appear in Security Settings with correct name and date | Manual | Pass
| #33 | Does passkey registration set passkey_enabled=true in database | Manual | Pass
| #33 | Can users successfully login using registered passkey without password | Manual | Pass
| #33 | Does passkey login issue JWT tokens and redirect to home page | Manual | Pass
| #33 | Can users delete registered passkeys from profile Security Settings | Manual | Pass
| #33 | Does deleting the last passkey set passkey_enabled=false in database | Manual | Pass
| #33 | Does /api/auth/passkey/register/begin return valid challenge and user data | Manual | Pass
| #33 | Does /api/auth/passkey/authenticate/begin return valid challenge for login | Manual | Pass
| #33 | Does /api/auth/passkeys endpoint list authenticated user's passkeys correctly | Manual | Pass
| #33 | Does canceling browser WebAuthn prompt display error without breaking flow | Manual | Pass
| #33 | Does attempting registration without authentication return 403 error | Manual | Pass
| #33 | Are stale passkey sessions automatically cleared when new registration begins | Manual | Pass
| #01 | Are events are successfully added to database | Manual | Pass
| #01 | Does the Todo sidebar move as expected | Manual | Pass
| #01 | Can the user toggle between month and week view | Manual | Pass
| #01 | Does the plus button successfully add an event/todo list task | Manual | Pass
| #02 | Are tag types consistent names & colors in all tag sections | Manual | Pass
| #02 | Can user select tag from dropdown menu when creating calendar event | Manual | Pass
| #02 | Can user create custom tag(s) when creating calendar event | Manual | Pass
| #02 | Can custom tags be deleted | Manual | Pass
| #02 | Do custom tag colors remain consistent in all tag sections | Manual | Pass
| #02 | Are events and to-do list items with custom tags not filtered out automatically | Manual | Pass
| #04 | Are events and to-do list items filtered out correctly based on tags | Manual | Pass
| #04 | Is filter state for calendar events independent from filter state for to-do list items | Manual | Pass

## Sprint #5
| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #34 | Can a user request password reset with a registered email | Manual | Pass
| #34 | Is a reset token generated and stored in the database with an expiration timestamp | Manual | Pass
| #34 | Is the reset email successfully sent to the user with a link to the password reset page | Manual | Pass
| #34 | Does password reset fail with an expired or invalid token | Manual | Pass
| #34 | Does login work with new password after reset | Manual | Pass
| #29 | Can tasks be marked as complete by clicking checkbox | Manual | Pass
| #29 | Can tasks and projects be deleted using the trash icon with a confirmation dialog | Manual | Pass
| #29 | Can task details be expanded by clicking info icon | Manual | Pass
| #29 | Can tasks be successfully marked as undated | Manual | Pass
| #29 | Are tasks grouped and colored correctly by tag (school, personal, etc.) | Manual | Pass
| #29 | Can projects be created using "Add Project" button | Manual | Pass
| #29 | Can project task list be collapsed/expanded to show tasks | Manual | Pass
| #29 | Does the progress bar appropriately update with completed tasks | Manual | Pass
| #02 | Are custom tags stored correctly and behaving correctly | Manual | Pass
| #27-8 Are all 232 seeded SE courses returned by GET /api/courses and visible in the course catalog | Manual | Pass
| #27-8 | Do seeded courses display correct name, code, credits, and prerequisiteText in the frontend | Manual | Pass
| #27-8 | Does the course catalog load from the backend API with no hardcoded mock data | Manual | Pass

## Sprint #6
| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #06 | Verify that the Day Timeline component loads successfully when navigating to the calendar view | Manual | Pass
| #06 | Verify that events fetched from the backend Event API appear on the timeline for the selected day | Manual | Pass
| #06 | Verify that events are positioned correctly on the timeline according to their start time | Manual | Pass
| #06 | Verify that events spanning longer durations display with the correct vertical length on the timeline | Manual | Pass
| #06 | Verify that clicking the Next/Previous Day navigation button updates the timeline to show events for the next/previous day | Manual | Pass
| #06 | Verify that clicking on an event opens the event details open the event details view | Manual | Pass
| #06 | Verify that overlapping events appear side-by-side without hiding one another | Manual | Pass
| #06 | Verify that events with a projectId display a project badge on the timeline event block | Manual | Pass
| #42 | Verify that new users receive the default "Class and "Personal" to-do lists when their account is created | Manual | Pass
| #42 | Verify that the to-do sidebar displays all available lists using a selector interface | Manual | Pass
| #42 | Verify that selecting a different list in the sidebar updates the displayed tasks to show tasks belonging to that list | Manual | Pass
| #42 | Verify that the Create New List button successfully creates a new list and is immediately able to be used | Manual | Pass
| #42 | Verify that users can rename an existing to-do list and that the updated name appears in the list selector | Manual | Pass
| #42 | Verify that deleting a list is properly handled by removing it from the sidebar and unassign the previously assigned tasks | Manual | Pass
| #42 | Verify that that a user can assign a task or project to a specific to-do list and it only shows up on that specific list | Manual | Pass
| #42 | Verify that any changes to the to-do list (creating new list/task) persists after page refresh or logout/login | Manual | Pass
| #42 | Verify that the system handles a large number of lists without breaking the sidebar layout or functionality | Manual | Pass
| #28 | Does conflict warning appear in event creation modal for course events | Manual | Pass
| #28 | Does conflict warning appear in event creation modal for custom events | Manual | Pass
| #28 | Have conflict warnings been removed correctly from published calendar events | Manual | Pass
| #40 | Events are shown clearly in monthly view | Manual | Pass
| #40 | Does month navigation (previous & next arrows) work correctly | Manual | Pass
| #40 | Does month navigation (month picker & year picker) work correctly | Manual | Pass
| #40 | Daily view is shown when a day is clicked in weekly view | Manual | Pass
| #40 | Daily view is shown when a day is clicked in monthly view | Manual | Pass
| #40 | Tags are shown for events in daily view | Manual | Pass
| #40 | Daily view shows all events, not just courses | Manual | Pass
| #40 | Custom events are saved after refresh | Manual | Pass
| #07 | Does the SE course map page load with all 40 course bubbles in a grid layout | Manual | Pass
| #07 | Are prerequisite arrows drawn correctly between dependent courses | Manual | Pass
| #07 | Does clicking a pool bubble open the requirement sheet with eligible courses | Manual | Pass
| #07 | Can a course be enrolled from the requirement sheet into the current semester | Manual | Pass
| #07 | Does the schedule modal appear when enrolling a course without a valid schedule | Manual | Pass
| #07 | Can a course be unenrolled from the course detail panel | Manual | Pass
| #07 | Does unenrolling a course clear its schedule and remove it from the calendar | Manual | Pass
| #07 | Does advancing the semester mark current enrollments as COMPLETED | Manual | Pass
| #07 | Does rolling back the semester reset COMPLETED enrollments to ENROLLED | Manual | Pass
| #07 | Can the user advance through all 11 semesters without errors | Manual | Pass
| #07 | Does advancing at the final semester stay on the last semester without crashing | Manual | Pass
| #07 | Does rolling back from the last semester correctly return to the previous state | Manual | Pass
| #07 | Do credit counters (BGP, Major, Additional) update correctly when courses are enrolled | Manual | Pass
| #07 | Do all credit counters reach their targets when the entire course map is completed | Manual | Pass
| #07 | Does the Lab Science Sequence restrict to one option after the first course is chosen | Manual | Pass
| #07 | Does the World Languages sequence lock to one language after the first course is chosen | Manual | Pass
| #07 | Are MDC pool bubbles matched to the correct semester column visually | Manual | Pass
| #07 | Does the course detail panel show course info, prerequisites, and enrollment status | Manual | Pass
| #07 | Are semester headers highlighted correctly for past, current, and future semesters | Manual | Pass
| #07 | Are enrolled courses displayed on the calendar and timeline after enrollment | Manual | Pass
| #19 | Can users search and filter courses in the course list | Manual | Pass
| #19 | Can users enroll/unenroll from courses | Manual | Pass
| #19 | Can users edit the professor and location of a class | Manual | Pass
| #20 | Does the course detail page load with correct course information | Manual | Pass
| #20 | Can users create and enroll in a custom class | Manual | Pass
| #40 | Custom events are saved across sessions (after complete log out & log in) | Manual | Pass

## Iteration 3
## Sprint #7
| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #38 | Browser notification permissions request and tracking works correctly | Manual | Pass |
| #38 | In-app notification component displays with custom title and body text | Manual | Pass |
| #38 | Notification enabled/disabled state persists in localStorage across sessions | Manual | Pass |
| #38 | Reminder time selector appears in event creation modal and allows multiple times | Manual | Pass |
| #38 | Selected reminders are scheduled and persist across sessions | Manual | Pass |
| #38 | Service worker sends browser notifications when reminders are due | Manual | Pass |
| #38 | Service worker continues checking in background when app is closed | Manual | Pass |
| #43 | Verify thast a task can be dragged and dropped to a new position wihtin the same list | Manual | Pass
| #43 | Verify that dragging a task multiple times updates its order consistently | Manual | Pass
| #43 | Verify that task order persists after page refresh or user logout/login | Manual | Pass
| #43 | Verify that smooth drag-and-drop interaction without UI glitches or lag | Manual | Pass
| #43 | Verify that editing a task updates immediatley in the UI | Manual | Pass
| #43 | Verify a user can switch a task between lists using the edit task feature | Manual | Pass
| #23 | Event page accent colors match event tag color | Manual | Pass
| #23 | Event page location field and teacher field are separate and editable | Manual | Pass
| #23 | Users are able to edit all details of an event | Manual | Pass
| #23 | User edits to an event are saved across page refresh and new sessions | Manual | Pass
| #23 | Users are only able to mark event/task complete through to-do list | Manual | Pass
| #23 | Users can delete events in event page | Manual | Pass
| #23 | Clicking on an event from weekly view navigates to event page | Manual | Pass
| #23 | Clicking on the background of weekly view navigates to daily view | Manual | Pass
| #23 | Events are ordered on weekly/monthly calendar by start date | Manual | Pass
| #US-08 | Does the CS course map page load with all course bubbles in a grid layout | Manual | Pass
| #US-08 | Are prerequisite arrows drawn correctly between dependent courses | Manual | Pass
| #US-08 | Does clicking a pool bubble open the requirement sheet with eligible courses | Manual | Pass
| #US-08 | Can a course be enrolled from the requirement sheet into the current semester | Manual | Pass
| #US-08 | Does the schedule modal appear when enrolling a course without a valid schedule | Manual | Pass
| #US-08 | Can a course be unenrolled from the course detail panel | Manual | Pass
| #US-08 | Does unenrolling a course clear its schedule and remove it from the calendar | Manual | Pass
| #US-08 | Does advancing the semester mark current enrollments as COMPLETED | Manual | Pass
| #US-08 | Does rolling back the semester reset COMPLETED enrollments to ENROLLED | Manual | Pass
| #US-08 | Can the user advance through all 11 semesters without errors | Manual | Pass
| #US-08 | Does advancing at the final semester stay on the last semester without crashing | Manual | Pass
| #US-08 | Does rolling back from the last semester correctly return to the previous state | Manual | Pass
| #US-08 | Do credit counters (BGP, Major, Additional) update correctly when courses are enrolled | Manual | Pass
| #US-08 | Do all credit counters reach their targets when the entire CS course map is completed | Manual | Pass
| #US-08 | Does the Lab Science Sequence restrict to one option after the first course is chosen | Manual | Pass
| #US-08 | Does the World Languages sequence lock to one language after the first course is chosen | Manual | Pass
| #US-08 | Are MDC pool bubbles matched to the correct semester column visually | Manual | Pass
| #US-08 | Does the course detail panel show course info, prerequisites, and enrollment status | Manual | Pass
| #US-08 | Are semester headers highlighted correctly for past, current, and future semesters | Manual | Pass
| #US-08 | Are enrolled courses displayed on the calendar and timeline after enrollment | Manual | Pass
| #US-08 | Does the CS 3000-level elective pool show only CS 3000-level courses | Manual | Pass
| #US-08 | Does the CS 4000-level elective pool show only CS 4000-level courses | Manual | Pass
| #US-08 | Are all three CS 4000-level elective bubbles independently enrollable | Manual | Pass

## Sprint #8
| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #11 | Verify that the monthly summary card displays correct total budget and updates with new transactions | Manual | Pass
| #11 | Verify that total spending is calculated correctly from transactions | Manual | Pass
| #11 | Verify that remaining balance (budget - spending) is accurate | Manual | Pass
| #11 | Verify that navigating between months updates displayed data correctly | Manual | Pass
| #11 | Verify that budget data is correctly stored and retrieved from database | Manual | Pass
| #12 | Verify that user can be added with valid inputs and will be rejected with invalid inputs | Manual | Pass
| #12 | Verify that newly added transactions appear in the transaction list with the correct details | Manual | Pass
| #12 | Verify that predefined categories are selectable, editable, and deletable | Manual | Pass
| #12 | Verify that charts and breakdowns are updated dynamically when transactions are added | Manual | Pass
| #45 | Assignments tab content is saved across refresh | Manual | Pass
| #45 | Assignments tab content is saved across sessions | Manual | Pass
| #45 | Assignments created through 'add assignment' modal are saved correctly | Manual | Pass
| #45 | Assignments are automatically added to calendar | Manual | Pass
| #45 | Assignments are automatically added to to-do list | Manual | Pass
| #45 | Assignment status (todo/in progress/completed) is editable and saved correctly | Manual | Pass
| #21 | Notes and files tab content is saved across refresh | Manual | Pass
| #21 | Notes and files tab content is saved across sessions | Manual | Pass
| #14 | Can a user drag to create a new time block on the calendar | Manual | Pass
| #14 | Does a created time block persist in localStorage after page refresh | Manual | Pass
| #14 | Can a user delete a time block with confirmation dialog | Manual | Pass
| #14 | Can a user move and resize existing time blocks | Manual | Pass
| #14 | Can a user toggle between daily and weekly view modes | Manual | Pass
| #14 | Does calendar event visibility toggle show/hide calendar events on the view | Manual | Pass
| #14 | Can a user save and load day presets for days of the week | Manual | Pass
| #14 | Can a user copy a time block to another date | Manual | Pass
| #14 | Do day navigation buttons (previous/next/today) work correctly | Manual | Pass
| #47 | Railway 3-service architecture (PostgreSQL, Backend, Frontend) deploys and starts successfully | Manual | Pass
| #47 | Backend Docker image builds with multi-stage Dockerfile and starts on Railway | Manual | Pass
| #47 | Frontend Docker image builds and serves via react-router-serve on port 3000 | Manual | Pass
| #47 | Railway PostgreSQL database is provisioned and accessible by the backend | Manual | Pass
| #47 | Backend allows cross-origin requests from the Railway frontend domain | Manual | Pass
| #47 | OPTIONS preflight requests return correct CORS headers and 200 status | Manual | Pass
| #47 | CORS allowed origins are configurable via environment variable (CORS_ALLOWED_ORIGINS) | Manual | Pass
| #47 | HttpOnly JWT cookies use SameSite=None and Secure=true in production for cross-origin | Manual | Pass
| #47 | Access token and refresh token cookies are set correctly after login on Railway | Manual | Pass
| #47 | User registration succeeds on production with auto-verified email | Manual | Pass
| #47 | User login succeeds on production and returns valid JWT tokens in cookies | Manual | Pass
| #47 | Protected API endpoints reject unauthenticated requests with 401 on production | Manual | Pass
| #47 | Stale JWT tokens (user no longer in DB) return 401 instead of 500 | Manual | Pass
| #47 | Frontend API calls use VITE_API_URL environment variable instead of hardcoded localhost | Manual | Pass
| #47 | All 16+ frontend service files correctly resolve backend URL from environment variable | Manual | Pass
| #47 | Database seeding runs on production startup and populates courses, programs, and semesters | Manual | Pass
| #47 | Test data seeders (UserSeeder, EventSeeder) do not run in production profile | Manual | Pass
| #47 | Course map page loads without 500 errors for authenticated users | Manual | Pass
| #47 | GET /api/semesters/current returns user semester data or proper error response | Manual | Pass
| #47 | GET /api/enrollments returns user enrollments or proper error response | Manual | Pass
| #47 | GET /api/programs/{id} returns full program data with requirement hierarchy | Manual | Pass
| #47 | SemesterController logs and returns JSON error body instead of raw 500 on failure | Manual | Pass
| #47 | EnrollmentController logs and returns JSON error body instead of raw 500 on failure | Manual | Pass
| #47 | Enrollment read methods use @Transactional(readOnly) to prevent lazy loading errors | Manual | Pass
| #47 | application-prod.properties correctly configures PostgreSQL, CORS, JWT, and Flyway settings | Manual | Pass
| #47 | Spring profile is set to prod via SPRING_PROFILES_ACTIVE on Railway | Manual | Pass
| #47 | Flyway baseline-on-migrate is enabled for production database initialization | Manual | Pass

##Sprint #9
| Issue # | Description | Manual/Auto Testing | Result |
|---------|-------------|-------------------|--------|
| #13 | Do the pie/bar chart render correctly with transaction data | Manual | Pass
| #13 | Does switching months update displayed transactions correctly | Manual | Pass
| #13 | Does deleting a transaction update in the correct places | Manual | Pass
| #13 | Are transactions sorted by transaction date instead of created date | Manual | Pass
| #13 | Can a user edit a transaction successfully | Manual | Pass
| #13 | Does exceeding/reaching a category budget trigger a warning | Manual | Pass
| #13 | Do category progress bars correctly display/update after transaction changes | Manual | Pass
| #16 | Can a user save current day's time blocks as a named preset | Manual | Pass
| #16 | Preset Library modal displays all saved presets and loads blocks to selected date | Manual | Pass
| #16 | User can edit a preset's name and description from the Edit Preset modal | Manual | Pass
| #16 | User can delete a preset from the library with confirmation dialog | Manual | Pass
| #16 | Preset data persists across page refreshes and new browser sessions | Manual | Pass
| #16 | Loading a preset adds blocks without removing existing blocks on the date | Manual | Pass
| #24 | BGSU theme applies dark brown sidebar with orange text and icons | Manual | Pass
| #24 | Pages do not scroll beyond viewport; sidebar stays fixed alongside content | Manual | Pass
| #24 | Course map popup shows single course code label (no duplicate) | Manual | Pass
| #24 | Course map enroll button hover uses readable light background instead of dark brown | Manual | Pass
| #24 | Avatar upload and delete work without 403 Forbidden error | Manual | Pass
| #24 | Profile page renders correctly after build (no JSX syntax errors) | Manual | Pass
| #24 | Degree progress page loads without 500 error when seeding is enabled | Manual | Pass
| #24 | Clear Profile Data button resets user settings and refreshes page | Manual | Pass
| #24 | Focus rings use brown color instead of orange across BGSU theme | Manual | Pass
| #21 | Note creation, updating, and deletion is saved across sessions | Manual | Pass
| #21 | File creation and deletion is saved across sessions | Manual | Pass
| #21 | Users have rich text editing for notes | Manual | Pass
| #21 | Users can upload files (not just metadata) | Manual | Pass
| #21 | Pdf files can be previewed | Manual | Pass
| #21 | Png and jpg files can be previewed | Manual | Pass
| #21 | Link files can be previewed | Manual | Pass
| #21 | All fields in "upload file" modal are accurate and user-friendly | Manual | Pass

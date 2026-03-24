# Current Status of Website

## Calendar Page

- Working calendar and to do list
  - **Bug:** User can complete to do list tasks but doing so does not get rid of the tasks from the calendar and "current" section of the to do list. Can reinstate a completed event at least visually
  - There is a vestigial add button on the to do list section
  - Currently has mock data for reoccurring classes and some assignments/events
- Working timeline page and event page
  - **Bug:** User cannot go back to calendar page from the timeline page and using the navbar for that, while it works, feels wrong for the user to do compared to a back button since the timeline page is a child page of the calendar page
  - The editable description for events currently does not save changes on reload
- Add event button modal finished and event added to calendar
  - **Bug:** The event does not show on the timeline page and disappears on reload (possibly a React Context issue)
- Time conflict system works
- Tag filtering system works

## Course Page

- Shows list of enrolled courses and the course pages show information
  - **Bug:** The floating Navbar for the course page when scrolling down shows blank space at the top
- Course catalog shows mock classes based on the BS Computer Science course map so some classes are named literally from it like MDC Elective and Natural Science lab currently
- Degree Progress shows UI with info with no functionality currently and shows course map for BS computer science course map with the image

## Progress Page

- This takes you directly to the Degree Progress page and likely should be removed

## Personal

- Coming soon page is funny but probably not needed
- Budget Planner has mock data for expenses and income with working responsive charts and bars when adding a transaction
  - Format of the charts likely need changing
  - No back button currently
  - Calculations seem accurate
- Time blocking works with time analysis being accurate to event times, option for showing calendar events works, weekly view works, and presets seem to work
  - I would do more testing on ensuring this all works like the presets and is intuitive
  - May change formatting of the timeline
  - No back button to personal page
  - Currently calendar events are shown on top of the time blocking event so may change that

## Study Page

- Only has UI for going to a future Picker Wheel, flashcards, and focus timer page
        

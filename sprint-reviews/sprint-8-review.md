# Sprint 8

***Team member:*** Cassidy Kibby <br/>
***Total Time:***  510 minutes    <br/>
***Completed Issue(s): US-11, US-12***  <br/>

* What were the *sprint goals*?
	* The sprint goals for me this week were to implement the budget planner feature, including creating the main page layout, displaying budget summaties, and adding functionality for managing transactions.
* What was *Done*?
	* I worked on building the BudgetPlannerPage component and designing the monthly summary card to display total spending and remaining budget. I also began implemenitng trasaction functionality and building the transaction list component.
* What was *Demo'd*?
	* None
* What was *Not Done*?
	* Some features, such as spending visualization, sorting, and editing, are still a little buggy and will need to be fully established next sprint.
* What are the *Constraints/Blockers*?
	* None
* What *Changes* will you make?'
	* I want to work on breaking tasks/remaining featues into smaller tasks to make them easier to implement and debug.

***Team member:*** Shivani Pallerla <br/>
***Total Time:***  480 minutes    <br/>
***Completed Issue(s): US-45***  <br/>

* What were the *sprint goals*?
	* To finish US-45, course assignments view.
* What was *Done*?
	* I finished US-45 and worked a little bit on US-21. I created the assignments tab, an 'add assignment' modal, and linked assignments to the calendar and to-do list as tasks. I also set up assignment CRUD API endpoints, and went ahead and created CRUD API endpoints for notes and files as well (task 6 of US-21) since it was easier to set them up in tandem since they are all part of the course pages.
* What was *Demo'd*?
	* None
* What was *Not Done*?
	* A couple things are being saved for later refactoring, such as how assignment tasks display in the daily and monthly calendar view, because we wanted to get the functionality completed and work out the details later. I also did not implement 'grading' for assignments, because we decided that it would not make sense to do that since we are not connected to Canvas.
* What are the *Constraints/Blockers*?
	* None
* What *Changes* will you make?'
	* Again, I want to be better about commiting more frequently and writing better commit messages. I tried to improve on that with this branch but I forgot.

***Team member:*** Megan Brown <br/>
***Total Time:***  390 minutes    <br/>
***Completed Issue(s): US-16 ***  <br/>

* What were the *sprint goals*?
	* For me, the goals for this sprint was to polish the UI for the time blocking feature. Another goal was to have the time blocks persist across refreshing.
* What was *Done*?
	* All tasks associated with the user story were completed. Users can now drag time blocks around to change the time dynamically.
* What was *Demo'd*?
	* None
* What was *Not Done*?
	* Some features related to the preset time blocks were not completely fleshed out because they fit better in US-16.
* What are the *Constraints/Blockers*?
	* We are having some problems running the current version of the project in a VM and plan to talk about it with Dr. Green next meeting.
* What *Changes* will you make?'
	* No major changes.

***Team member:*** Grant Ferris <br/>
***Total Time:***  600 minutes    <br/>
***Completed Issue(s):***  US-47<br/>

* What were the *sprint goals*?
	* The sprint goals for me this week were to implement the live server for the app to run on,
* What was *Done*?
	* I transferred the repo to a GitHub repo so I can use the PaaS service called Railway to host the GitHub Repo as a service. I created an online Postgres database and two services in Railway, one for the backend and other for the frontend. I updated both the code and the services with the right connections for this setup and had it up and running with their own domains (this is treated as the prod environment). Currently the only function not working on the server is email verification due to needing a fully custom domain with DNS records for Resend to verify for sending emails to more than one email.
* What was *Demo'd*?
	* None as Dr. Green wanted a text only update
* What was *Not Done*?
	* Besides the Email Verification for account creation not working, nothing else
* What are the *Constraints/Blockers*?
	* None
* What *Changes* will you make?'
	* None

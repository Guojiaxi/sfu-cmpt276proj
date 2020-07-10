# sfu-cmpt276proj
## CMPT276 Project Proposal - SUMMER 2020

## Project Overview
This application, StudyScapes, will allow users to login to their account and view the Simon Fraser University campus as a virtual map. Login views will differ for faculty and students. This uses the Web API for Google Maps for location and time updates. As a real-time feature, this application will use Socket.io to update requests made to professors or students for meetings and study groups in real time. This application enables quick meetups and easy navigation for users. The application is not just practical, but fun! There are minigames incorporated to help the user kill time while waiting between meetups (they can even battle their professors!).

## Our Team – backgrounds and experience
**Celina Wright**: Celina as been programming for 6 years, much of it at Douglas College, and is now in her fourth year of studies at Simon Fraser University. Her strongest skill set is with Object Oriented Programming. She has plenty of experience with Java and C#, and a moderate amount of experience with web design. She also greatly enjoys working with databases and querying, has experience normalizing databases, and can work well with SQL, SQLite, MongoDB, and PostgreSQl. She will be focusing on application organization, implementation of navigation, and database usage. 

**Josh Guo**: Josh is a third-year student at SFU and transferred from Mechatronics last semester. He started programming 4 years ago, mostly with Python and C. Most of Josh’s experience is with backend programming and design, focusing on performance optimization and resourceful memory usage. For this project, he will primarily focus on application design, backend implementation, and performance optimization.

**Mandeepa Mashhura**: Mandeepa is a second-year engineering student at Simon Fraser University, who is very passionate about the field. She has experience in programming languages like C++ and Python. She is very confident in her abilities to pick up and learn new technologies and languages if needed. She strives to be a great asset to our team. She will be focusing on the front end development and lifting the morale of the group.

**Parth Vakil**: Parth is a third-year SFU student in Computing Science. He mainly has experience in Python and C++. He enjoys back-end programming and is known to dabble into front-end as well. He also has worked with location-based software in the past, which will be an asset in pushing this idea forward. Web development is also a passion of his, which will help overall throughout this project. He will mainly be working on application implementation, storage and security development, and front-end.


## More About Our Application
### Name: StudyScapes

**What is the problem we are trying to solve?**
	Interaction among faculty and students is a very important part of the learning and growing process at university. This application not only makes the process easier but encourages it in a fun and interactive way. Previous applications, like SFU Snap, attempted to solve the navigation problem for new students lost on a large campus but our application strives to include that feature and many more! This serves as both an educational and entertaining application for students and faculty alike at Simon Fraser University. 

**What is the scope of the project?**
1.	**Base features**: we hope to include an interactive map as a big feature, to help students traverse the school with ease. We also plan to incorporate features to enable interaction between faculty and students, and for students to interact with other students. Our third feature is a fun one: minigames among virtual versions of students and faculty, throughout the map.  Our final feature includes the ability to view events happening on campus right on the map, so that users know when and where to attend.

2.	**Main feature epics**:
- Provide an interactive map that updates to user location so they can find other users and locations on the Simon Fraser University Campus. 
- Enable faculty and students to easily interact and meet up for studying or course/career discussion.
- Allow students and faculty to interact in mini-games with those nearby based on location. This would allow users to play small various games that can act as ice-breakers between their fellow peers.
- Have events held by clubs, faculty or student societies show on the map as icons in real-time, so users can quickly learn about the activity on campus. 

3.	**Sample stories/scenarios**:
- I am a new student to the school and would like to meet up with other students to study, but I don’t know my way around! I use this application to request a meetup with fellow classmates and the application helps me find my way to them.
- I am a professor looking for an easy way to plan meetings with students, outside of office hours. This app allows me to easily give students any additional advice/help they need on projects and courses.
- I am a student waiting to meet up with my professor during office hours. I use the app to find the professor’s office and then play a minigame while I wait for my turn. 
- (Possible additional feature story) My friend and I are new students who has yet to understand the lay of the land. Looking for something fun to do, we use the application to search for any events happening on campus. There are several ongoing or upcoming events shown on the map as icons at their campus locations. We decide to check an event out with directions to get there.
- (Possible additional feature story)I am an executive member of a student society trying to advertise an upcoming or ongoing event. I open the app and use the event creation interface. I search up the room or area on campus and select the location for the event, select the date and time for the event, maybe upload a picture, and fill in the details. I then submit the event and it becomes visible to users.
- As a second-year student I have used this application to meet professors and get to know course content. This helped me decide which upper level courses I should take and which were suitable for me.  
- I am a new student and I would like to meet people who share the same interests and hobbies as me outside of academics. So that during breaks or weekends we plan trips or socialize as a stress reliever. This application has done wonders for me in that aspect.
- I am a student who is new to the campus and would love to make new friends. As someone who is also unfamiliar with the campus locations, this app seems like a great way to become familiar with my surroundings as well as meet cool people. 


## Mockup UI – Views
 
[Home Page UI](images/UIMockup_Home.JPG)
[User Page UI](images/UIMockup_User.JPG)
[Faculty Page UI](images/UIMockup_Faculty.JPG)
[Minigame Page UI](images/UIMockup_Minigame.JPG)
[Events Page UI](images/UIMockup_Events.JPG)
[Admin Page UI](images/UIMockup_Admin.JPG)


## Meeting 1 Overview
- Agreed on use of Google Maps API and maybe use it to find professors/TAs/tutors and plan meetings with faculty and students within the app
- Is it practical to expect a multi-floor map of the school, by elevation? Or just locating users by GPS? – needs additional research
- Need to look into SFU databases!
- Minigames: simple? Text based? How interactive? Tic-tac-toe, maze, math problem, etc.
- Ideas for an **additional feature**: file sharing. 
    - Drag and drop a file
    - Generate a unique link that anyone can use to download the file

- Goals for iteration 1:
    - At least twice the user stories/scenarios
    - Implement user database
    - Completed login
    - More Socket.io research – for a better understanding of it’s uses
    - A full layout in code (minimum html) for each view and login
    - Add more types of users? TAs/Tutors?

## Iteration 1 Updates

## Customers
- **Faculty**: Teachers and TAs at Simon Fraser University that would like to interact in a convenient way with students, plan meetings, coordinate meeting locations, schedule or find events on campus, and enjoy minigames.  
- **Students**: Students at Simon Fraser University that would like to communicate with all their professors or TAs in one convenient application. They would like to meet with other students or faculty at SFU, get assistance in finding their way around the school, find specific buildings or rooms, schedule or find events on campus, meet other students, or just have fun through minigames.

## Competitive Analysis
What makes StudyScapes so unique is that it applies specifically to the Simon Fraser University Burnaby Campus. It incorporates ideas from many other successful programs into one main application for ease of access. Although Google Maps is useful, it does not provide a detailed view of the Burnaby Campus. StudyScapes will elaborate on the map with this campus in mind, allowing for much more extensive interaction and location finding around the University. SFU Snap was an inspiration for this, as it helped students to search for and travel between rooms and buildings across campus. StudyScapes expands this to allow for scheduling events and meetings around campus with students and faculty alike. It also provides icebreakers for students in the form of minigames and different views for faculty and students, so that each user sees the information that directly applies to their own needs.  

## User Stories - Actors
- **Faculty** (Professors and Teaching Assistants) that can view and cancel meetings. They can also interact with students, view the map, view and schedule events, and play minigames. Students can view, request, reschedule, and cancel meetings with Faculty and other students. They can view and schedule events, view the map for specific rooms and buildings, and play minigames.
- **Students** can view, request, reschedule, and cancel meetings with Faculty and other students. They can view and schedule events, view the map for specific rooms and buildings, and play minigames.
- **Admin** can view all database content including usernames, roles, meetings, and much more. The admin account is used for verification of debugging purposes. For the sake of security and privacy of users, the admin can only view hashed passwords.
*User stories added to this iteration can be found in the requirements document for iteration 1*

## Database Plan - Iterations 1 & 2
- *CREATE TABLE login(uid SERIAL PRIMARY KEY, username char(20) NOT NULL, password char(60) NOT NULL, role char(20) NOT NULL) WITH (oids = false);*
- *CREATE TABLE meetup(mid SERIAL PRIMARY KEY, date  DATE NOT NULL, time TIME NOT NULL, location char(10) NOT NULL, isPending boolean NOT NULL, isCancelled boolean NOT NULL);*
- *CREATE TABLE meetup_user(mid INT NOT NULL, uid INT NOT NULL, FOREIGN KEY (mid) REFERENCES meetup (uid), FOREIGN KEY (uid) REFERENCES login (uid));*

## Meeting 2 Overview
Our team discussed separating SFU’s Room Finder from our Google map. More research is needed regarding Room Finder and Esri. Our map should be for seeing building locations, nearby students, and current events while Room Finder should be solely used for finding classrooms. We also decided to add an Admin user who can view all database tables for ease of debugging and monitoring. The plan in iteration 2 will have Celina implement the Meeting Scheduling System, and Josh implement the Events database and integrate Events with the map. Parth plans to start designing minigames, and Mandeepa is looking into sockets to continue work on a messaging system between application users.


## URLs
- GitHub Repository: https://github.com/Guojiaxi/sfu-cmpt276proj.git
- Heroku link: https://cmpt276proj-jlguo.herokuapp.com/
- Heroku Git Link: https://git.heroku.com/cmpt276proj-jlguo.git






# node-js-getting-started

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application supports the [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/heroku/node-js-getting-started.git # or clone your own fork
$ cd node-js-getting-started
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)

# computer-security-web-trivia
This Web Trivia is about computer security. The Trivia has two different game modes in which one has difficult questions while the other has easy questions.
You can play a single player game or a multiplayer game in this trivia but the multiplayer is still in development right now. Uptill this point in time I have made systems where you can create groups for multiplayer and join those groups. There is a lobby which shows all the people who have joined the group.

The trivia is made using html, css, and node js. In node js I have used the ws (WebSocket library) and the standard http library. The server reads the questions from two different text files (depending on the mode) and then send them to the client. The client shuffles these questions and the options and then show them. I have uploaded the ws module in this github so you probably won't need to download it.

To run the web app you need to download all the files in the repository as they are and then run the server.js. You can run the server using the command

node server.js

After the server starts running you need to go to a web browser and open the following site    http://localhost:3000

There is a more detailed ReadMe about how to run the website in the repository.

const http = require("http");
const fs = require("fs");
const WebSocketServer = require("ws").Server;
const readline = require('readline');
const events = require("events");

const port = 3000;
const websocket_port = 3001;
var counter = 0;

const groups = new Array();
const exploring_questions = new Array();
const challenge_questions = new Array();

const event_emitter = new events.EventEmitter();

//creates a normal server for responding to webpage requests
function init() {
    const server = http.createServer((req, res) => {
        res.setHeader("Content-Type", "text/html");
        if (req.url == "/") {
            res.statusCode = 200;
            res.end(fs.readFileSync("homepage/homepage.html"));
        } else if (req.url == "/home_image") {
            let image = fs.createReadStream("homepage/home_image/home_image.jpg");
            image.on("open", () => {
                res.statusCode = 200;
                image.pipe(res);
            });
        } else if (req.url == "/singleplayer") {
            res.statusCode = 200;
            res.end(fs.readFileSync("singleplayer/singlePlayer.html"))
        } else if (req.url == "/singleplayer_js") {
            res.statusCode = 200;
            res.end(fs.readFileSync("singleplayer/singleplayer.js"));
        } else if (req.url == "/multiplayer") {
            res.statusCode = 200;
            res.end(fs.readFileSync("multiplayer/multiplayer.html"));
        } else if (req.url == "/multijs") {
            res.statusCode = 200;
            res.end(fs.readFileSync("multiplayer/multiplayer.js"));
        } else if (req.url == "/singleplayer_image") {
            let image = fs.createReadStream("singleplayer/singleplayer.png");
            image.on("open", () => {
                res.statusCode = 200;
                image.pipe(res);
            });
        } else if (req.url == "/multiplayer_image") {
            let image = fs.createReadStream("multiplayer/multiplayer_image/singleplayer.png");
            image.on("open", () => {
                res.statusCode = 200;
                image.pipe(res);
            });
        }
        else {
            res.statusCode = 404;
            res.end("Page Not Found");
        }
    });

    server.listen(port, () => {
        console.log("Server listening to port:");
    });


}

function webSockteInit() {
    // const server = http.createServer().listen(websocket_port, () => {
    //     console.log("Websocket http server live...");
    // });

    wss = new WebSocketServer({
        port: websocket_port
    });

    wss.on("connection", (ws) => {
        console.log("A client is attached");

        decisionMaking(ws);
    });
}

function decisionMaking(ws) {
    ws.on("message", (data) => {
        //received strings will always follow a format :id:command:message
        //commands: e = exploration, c = challenge, q = quit, j = join group, n = new group
        //id is the group id (-1 if not assigned) and message is the 
        //the message it wants to say             
        let group_id = parseInt(data.toString().substring(1, 3));
        let command = data.toString().substring(4, 5);
        let message = data.toString().substring(6);
        console.log(command);
        if (command == "e") {
            sendQuestions("exploration", group_id, ws);
        }
        else if (command == "c") {
            sendQuestions("challenge", group_id, ws);
        }
        else if (command == "n") {
            // make sure that the person is kicked out of the group when they
            // close connection
            if (searchAllGroups(ws)) {
                ws.send(":w:Already in a group");
            }
            else {
                newGroup(ws, message);
            }
        }
        else if (command == "j") {
            console.log(data.toString());
            if (groupExists(group_id)) {
                if (searchAGroup(ws, group_id)) {
                    ws.send(":w:Already joined the group");
                }
                else {
                    //joins the group
                    if (!isNameInGroup(group_id, message)) {
                        joinGroup(ws, group_id, message);
                        ws.send(":j:");
                    } else {
                        ws.send(":w:n");
                    }

                }
            }
            else {
                ws.send(":w:e");     //group does not exist
            }
        }
        else {

        }
    });
}
function isNameInGroup(group_id, nickname) {
    let i = 0;

    for (i = 0; i < groups[group_id].length; i++) {
        if (groups[group_id][i].name == nickname)
            return true;
    }

    return false;
}

function joinGroup(ws, group_id, nickname) {
    let new_member = {
        client: ws,
        name: nickname,
        score: 0,
        in_lobby: true,
        master: false
    }
    let command = ":n:" + nickname;
    sendToGroup(group_id, command);

    groups[group_id].push(new_member);

    let j = 1;
    for (j = 1; i < groups[group_id].length; j++) {
        command = ":n:" + groups[group_id][j].name;
        ws.send(command);

        if (groups[group_id][j].name == nickname)           //only sends the names of group members joined before this
            return;                                         //guy joined. Since all people after him will be new ones

    }
}
//function to send a message to all group members in a particular group
function sendToGroup(group_id, message) {
    for (i = 1; i < groups[group_id].length; i++) {
        groups[group_id][i].client.send(message);
    }
}
//generates a random integer, i, such that 0<= i < max
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//send questions to single player or groups depending on the mode
function sendQuestions(mode, group_id, clientID) {
    let question_index;
    if (mode == "exploration")
        question_index = getRandomQuestions(exploring_questions.length);
    else if (mode == "challenge") {
        question_index = getRandomQuestions(challenge_questions.length);
    }
    if (mode == "exploration") {
        if (group_id == -1) {
            question_index.forEach(index => {
                for (i = 0; i < 5; i++) {
                    clientID.send(exploring_questions[index][i]);
                }
            });
        } else if (group_id >= 0) {
            question_index.forEach(index => {
                for (i = 0; i < 5; i++) {
                    sendToGroup(group_id, exploring_questions[index][i]);
                }
            });
        }

    }
    else if (mode == "challenge") {
        if (group_id == -1) {
            question_index.forEach(index => {
                for (i = 0; i < 5; i++) {
                    clientID.send(challenge_questions[index][i]);
                }
            });
        } else if (group_id >= 0) {
            question_index.forEach(index => {
                for (i = 0; i < 5; i++) {
                    sendToGroup(group_id, challenge_questions[index][i]);
                }
            });
        }
    }
}
//generates psuedo-random question numbers from 0 to length - 1
function getRandomQuestions(length) {
    let questions_to_send = new Set();
    let i = 0;
    while (i < 10) {
        let rand_int = getRandomInt(length);
        if (!questions_to_send.has(rand_int)) {
            questions_to_send.add(rand_int);
            i++;
        }
    }
    return questions_to_send;
}

//async function to read files and store the content in the corresponding arrays
async function readQuestions() {
    let fileStream = fs.createReadStream("questions/exploring.txt");
    let tempArray = new Array();

    let rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        tempArray.push(line);
        if (tempArray.length == 5) {
            exploring_questions.push(tempArray);
            tempArray = [];
        }
    }
    fileStream = fs.createReadStream("questions/challenge.txt");

    rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    tempArray = [];

    for await (const line of rl) {
        tempArray.push(line);
        if (tempArray.length == 5) {
            challenge_questions.push(tempArray);
            tempArray = [];
        }
    }
    event_emitter.emit("read_file");
}
// creates a new group while also increasing the group index
function newGroup(ws, nickname) {
    let new_member = {
        client: ws,
        name: nickname,
        score: 0,
        in_lobby: true,
        master: true
    }
    groups.push([counter++, new_member]);

    let command = ":f:" + (counter - 1);
    ws.send(command);
    ws.send(":m:");
}
//checks of a client is in ANY group
function searchAllGroups(ws) {
    for (i = 0; i < groups.length; i++) {
        result = searchAGroup(ws, i);
        if (result == true) {
            return true;
        }
    }
    return false;
}
// checks for the client in a particular group
function searchAGroup(ws, group_id) {
    for (j = 0; j < groups[group_id].length; j++) {
        if (ws == groups[group_id][j].client) {
            return true;
        }
    }
    return false;
}
//checks whether the given group exists or not
function groupExists(group_id) {
    //check what happens when a group is empty
    if (group_id < groups.length && groups[group_id].length > 0)
        return true;
    else
        return false;
}
readQuestions();
event_emitter.on("read_file", () => {
    console.log("Working");
    init();
    webSockteInit();
    console.log(challenge_questions[0].length);
    sendQuestions("challenge");
});


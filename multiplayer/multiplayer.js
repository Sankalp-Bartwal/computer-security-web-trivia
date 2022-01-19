const ws = new WebSocket("ws://localhost:3001");
const questions = new Array();
const players = new Set();
var nickname = "";
var group_id = -1;
var master = false;

// all messages except for the questions follow the same format
//format of message = ":command:message"
//commands: 
//:n:message   = new members. message will represent the name of the new member
//:q:message   = when someone leaves. message will be the name of the person leaving
//:m:message   = master of the lobby.
//:s:message   = score of a player. :score:name. score always in two digits
//:r:message   = restarts the game
//:d:message   = destroyed the lobby
//:w:message   = for a warning.  message will also use codes for different types of erros
//  :e      means the group id does not exist
//  :n      means the name already exists in the group
//:f:message   = new lobby formed message will contain the id of the group
//:j:message   = joined lobby

ws.addEventListener("message", (received) => {
    let command = received.data.substring(1, 2);
    let message = received.data.substring(3);

    if (command == "f") {
        group_id = parseInt(message);
        updateRoom(nickname);

    } else if (command == "m") {
        master = true;
        //we form a room here so that the master status is updated before we decide to show
        //button or
        formRoom("f");

    } else if (command == "j") {
        formRoom("j");
    } else if (command == "w") {
        console.log(message);

        if (message == "e") {
            let warning_board = document.getElementById("warning_label");
            warning_board.innerHTML = "The group id does not exist";
            warning_board.style.display = "block";

            let join_button = document.getElementById("join_button2");
            join_button.innerHTML = "join";
            join_button.style.pointerEvents = "auto";

            document.getElementById("group_id_entry").style.pointerEvents = "auto";
        } else if (message == "n") {
            let warning_board = document.getElementById("warning_label");
            warning_board.innerHTML = "The name is already taken";
            warning_board.style.display = "block";

            let join_button = document.getElementById("join_button2");
            join_button.innerHTML = "join";
            join_button.style.pointerEvents = "auto";

            document.getElementById("name_entry2").style.pointerEvents = "auto";
        }

    } else if (command == "n") {
        updateRoom(message);
    } else if (command == "q") {
        removeMember(message);
    }
    else {
        questions.push(received.data);
        if (questions.length == 50) {
            document.dispatchEvent(loaded);
            ws.close();
        }
    }
});
function start() {
    document.getElementById("share_container").style.display = "none";

}
function removeMember(name) {
    document.getElementById(name).remove();
}
function updateRoom(name) {

    document.getElementById("share_container").remove();

    let temp_div = document.createElement("div");
    temp_div.className = "group";
    temp_div.innerHTML = name;
    temp_div.id = name;

    document.getElementById("group_container").appendChild(temp_div);

    temp_div = document.createElement("div");
    temp_div.className = "group";
    temp_div.innerHTML = `&#x2719; add more people using the group id: ${group_id}`;
    temp_div.id = "share_container";

    document.getElementById("group_container").appendChild(temp_div);
}

function formRoom(mode) {
    document.getElementById("warning_label").style.display = "none";
    if (mode == "f") {
        document.getElementById("back_button1").style.display = "none";
        document.getElementById("create_button2").style.display = "none";
        document.getElementById("name_entry1").style.display = "none";
    } else if (mode == "j") {
        document.getElementById("back_button2").style.display = "none";
        document.getElementById("join_button2").style.display = "none";
        document.getElementById("name_entry2").style.display = "none";
        document.getElementById("group_id_entry").style.display = "none";
    }
    document.getElementById("start_heading").innerHTML = "Lobby";
    document.getElementById("group_container").style.display = "block";

    if (master) {
        document.getElementById("start_button").style.display = "block";
    } else {
        document.getElementById("start_info").style.display = "block";
    }

}

function createNewGroup() {
    if (document.getElementById("name_entry1").value != "") {
        document.getElementById("create_button2").style.pointerEvents = "none";
        document.getElementById("back_button1").style.pointerEvents = "none";
        document.getElementById("create_button2").innerHTML = "creating...";
        document.getElementById("name_entry1").style.pointerEvents = "none";

        nickname = document.getElementById("name_entry1").value;

        let command = ":-1:n:";
        command = command + document.getElementById("name_entry1").value;
        ws.send(command);
    } else {
        document.getElementById("name_entry1").placeholder = "Cannot start without name!";

    }

}

function joinGroup() {
    if (document.getElementById("name_entry2").value != "") {
        group_id = document.getElementById("group_id_entry").value;

        if (group_id != "") {
            if (!isNaN(group_id) && group_id >= 0 && group_id < 100) {
                nickname = document.getElementById("name_entry2").value;

                document.getElementById("join_button2").style.pointerEvents = "none";
                document.getElementById("back_button2").style.pointerEvents = "none";
                document.getElementById("join_button2").innerHTML = "joining...";
                document.getElementById("name_entry2").style.pointerEvents = "none";
                document.getElementById("group_id_entry").style.pointerEvents = "none";

                if (parseInt(group_id) < 10 && group_id.length == 1) {
                    group_id = "0" + group_id;
                }

                let command = ":" + group_id + ":j:" + nickname;
                ws.send(command);
                group_id = parseInt(group_id);
            }
            else {
                document.getElementById("warning_label").innerHTML = "Enter a valid id";
                document.getElementById("warning_label").style.display = "block";
            }
        }
        else {
            document.getElementById("group_id_entry").placeholder = "Enter a id!";
        }
    } else {
        document.getElementById("name_entry2").placeholder = "Cannot start without name!";

    }

}

function show_join() {
    document.getElementById("start_heading").innerHTML = "Join A Group";
    document.getElementById("create_button1").style.display = "none";
    document.getElementById("join_button1").style.display = "none";

    document.getElementById("group_id_entry").style.display = "block";
    document.getElementById("name_entry2").style.display = "block";

    document.getElementById("back_button2").style.display = "block";
    document.getElementById("join_button2").style.display = "block";
}
function showCreate() {
    document.getElementById("start_heading").innerHTML = "Create a new group";
    document.getElementById("create_button1").style.display = "none";
    document.getElementById("join_button1").style.display = "none";
    document.getElementById("name_entry1").style.display = "block";
    document.getElementById("create_button2").style.display = "block";
    document.getElementById("back_button1").style.display = "block";
}

function backButton1() {
    document.getElementById("start_heading").innerHTML = "Multiplayer";
    document.getElementById("create_button1").style.display = "block";
    document.getElementById("join_button1").style.display = "block";
    document.getElementById("name_entry1").style.display = "none";
    document.getElementById("create_button2").style.display = "none";
    document.getElementById("back_button1").style.display = "none";
}

function backButton2() {
    document.getElementById("start_heading").innerHTML = "Multiplayer";
    document.getElementById("create_button1").style.display = "block";
    document.getElementById("join_button1").style.display = "block";

    document.getElementById("group_id_entry").style.display = "none";
    document.getElementById("name_entry2").style.display = "none";

    document.getElementById("back_button2").style.display = "none";
    document.getElementById("join_button2").style.display = "none";
}
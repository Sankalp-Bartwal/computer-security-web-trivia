const ws = new WebSocket("ws://localhost:3001");
const questions = new Array();
const loaded = new Event("Loaded");

var question_number = 0;
var answer_key = null;
var score = 0;
var option_selected = null;
var already_selected = false;

var question_index = 1;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//add prefix "s:" in front of scores or use "n:" for names of other people names
ws.addEventListener("message", (received) => {
    questions.push(received.data);
    if (questions.length == 50) {
        document.dispatchEvent(loaded);
        ws.close();
    }
});

document.addEventListener("Loaded", () => {
    document.getElementById("logo").innerHTML = "";
    document.getElementById("start_button").style.display = "block";
});

function setMode(mode_type) {
    //making the buttons invisible
    document.getElementById("logo").innerHTML = "Loading...";
    document.getElementById("exploring").style.display = "none";
    document.getElementById("challenge").style.display = "none";

    //requesting for questions
    ws.send(mode_type);
}
function start() {
    document.getElementById("start_container").style.display = "none";
    document.getElementById("lower").style.height = "11vh";
    document.getElementById("credit_link").style.color = "white";
    document.getElementById("container").style.display = "flex";

    updateQuestion();
}
function updateQuestion() {

    let option = jumbleUpOptions();

    document.getElementById("question_space").innerHTML = option[4];
    document.getElementById("option0").innerHTML = option[0];
    document.getElementById("option1").innerHTML = option[1];
    document.getElementById("option2").innerHTML = option[2];
    document.getElementById("option3").innerHTML = option[3];
}
function jumbleUpOptions() {
    let question, answer;
    let option = new Array();

    for (i = question_number; i < question_number + 5; i++) {
        array_string = questions[i];

        if (array_string.charAt(0) == "Q") {
            question = array_string.substring(2);
        }
        else {
            if (array_string.charAt(0) == "A") {
                answer = array_string.substring(2);
            }
            else {
                option.push(array_string.substring(2));
            }
        }
    }
    option.push();
    answer_key = getRandomInt(4);
    if (answer_key < 3) {
        temp = option[answer_key];
        option[answer_key] = answer;
        option[3] = temp;
    } else if (answer_key == 3) {
        option[3] = answer;
    }
    option.push(question);
    console.log(answer_key);
    question_number += 5;
    return (option);
}
function pressed(option_chosen, option_id) {
    if (already_selected) {
        document.getElementById("option" + option_selected).style.background = "transparent"
        document.getElementById("option" + option_selected).style.border = ""
    }
    let choosed_element = document.getElementById(option_id);
    choosed_element.style.border = "2px solid rgb(16, 17, 122)"
    choosed_element.style.background = "rgb(193, 203, 247)";

    option_selected = option_chosen;
    document.getElementById("check_button").style.display = "block";
    already_selected = true;
}
function check() {
    selected_option_id = "option" + option_selected.toString();
    console.log(selected_option_id)
    if (option_selected == answer_key) {
        score++;
        document.getElementById(selected_option_id).style.background = "#74c774";
    } else {
        document.getElementById(selected_option_id).style.background = "red";
        document.getElementById("option" + answer_key.toString()).style.background = "#74c774";
        document.getElementById(selected_option_id).style.border = "";
    }

    document.getElementById("score").innerHTML = score;

    options = document.getElementsByClassName("option");
    for (i = 0; i < options.length; i++) {
        options[i].style.pointerEvents = "none";
    }

    document.getElementById("check_button").style.display = "none";
    if (question_index == 10) {
        document.getElementById("next_button").innerHTML = "Finish";
    }
    document.getElementById("next_button").style.display = "block";
}
function next() {
    if (question_index < 10) {
        question_index++;
        document.getElementById("upper_heading").innerHTML = "Question " + question_index.toString();
        options = document.getElementsByClassName("option");
        for (i = 0; i < options.length; i++) {
            options[i].style.pointerEvents = "auto";

        }
        document.getElementById("option" + answer_key).style.background = "transparent"
        document.getElementById("option" + option_selected).style.background = "transparent"
        document.getElementById("option" + option_selected).style.border = ""

        document.getElementById("next_button").style.display = "none";
        updateQuestion();
    } else {
        document.getElementById("score_display").innerHTML = "Score " + score.toString();
        document.getElementById("lower").style.height = "100vh";
        document.getElementById("credit_link").style.display = "none";
        document.getElementById("score_container").style.display = "block";
        setTimeout(() => {
            document.getElementById("container").style.display = "none";
        }, 2000);
    }
}
function homePageButton() {
    window.open("http://localhost:3000/", "_self")
}

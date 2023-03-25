const taskInput = document.getElementById("task-input");
const startButton = document.getElementById("start-button");
const title = document.getElementById("title");

let currentTaskIndex = 0;
let tasks = [];
let timerId;
let audio = new Audio('ding.mp3');
let remainingTime = 0; // new variable to store remaining time for the current task

function startTimer() {
    clearInterval(timerId);
    if (tasks.length === 0) {
        const tasksArray = taskInput.value.trim().split('\n');
        for (let i = 0; i < tasksArray.length; i += 2) {
            const taskName = tasksArray[i];
            const taskTime = tasksArray[i + 1];
            tasks.push({ name: taskName, time: taskTime });
        }
        console.log(tasks)
    }
    if (tasks.length === 0) {
        return;
    }
    if (startButton.textContent === 'Play') {
        startButton.textContent = 'Pause';
        startButton.style.backgroundColor = "#FE6244";
        if (currentTaskIndex >= tasks.length) {
            currentTaskIndex = 0;
        }
        startNextTask();
    } else {
        startButton.textContent = 'Play';
        startButton.style.backgroundColor = "#57C5B6";
        clearInterval(timerId);
    }
}

function startNextTask() {
    if (tasks.length === 0) {
        return;
    }
    const task = tasks[currentTaskIndex];
    if (remainingTime) { // if there is remaining time for the current task, use it
        var timeLeft = remainingTime;
        remainingTime = 0;
    } else { // otherwise start new task
        var timeLeft = task.time * 60;
    }
    timerId = setInterval(() => {
        if (startButton.textContent === 'Play') { // use '===' instead of '!==' here
            return;
        }
        timeLeft--;
        remainingTime = timeLeft; // store remaining time for the current task
        const minutesLeft = Math.floor(timeLeft / 60);
        const secondsLeft = timeLeft % 60;
        title.textContent = `${task.name} - ${minutesLeft}:${secondsLeft.toString().padStart(2, "0")}`;
        document.title = `${task.name} - ${minutesLeft}:${secondsLeft.toString().padStart(2, "0")}`;
        if (timeLeft === 0) {
            clearInterval(timerId);
            const notification = new Notification(`${task.name} completed, ${tasks[currentTaskIndex + 1]?.name} started for ${task.time} minutes`);
            currentTaskIndex++;
            audio.play();
            if (currentTaskIndex < tasks.length) {
                notification;
                startNextTask();
            } else {
                new Notification("All tasks completed!")
                startButton.textContent = "Play";
                tasks = [];
                taskInput.value = "";
                title.textContent = "Task Timer";
                document.title = "Task Timer";
            }
        }
    }, 1000);
}

function handleKeyPress(event) {
    if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        startTimer();
    } else {
        remainingTime = 0; // reset remaining time for the current task
        clearInterval(timerId);
        startButton.textContent = "Play";
        startButton.style.backgroundColor = "#57C5B6";
        tasks = [];
    }
}

taskInput.addEventListener("keydown", handleKeyPress);
startButton.addEventListener("click", startTimer);

const taskInput = document.getElementById("task-input");
const startButton = document.getElementById("start-button");
const skipButton = document.getElementById("skip-button");
const title = document.getElementById("title");

let currentTaskIndex = 0;
let tasks = [];
let timerId;
let audio = new Audio('ding.mp3');
let remainingTime = 0; // new variable to store remaining time for the current task

function startTimer() {
    clearInterval(timerId);
    if (tasks.length === 0) {
        const tasksArray = taskInput.value.trim().split('\n').filter(task => task.trim() !== "");
        for (let task of tasksArray) {
            let lastSpaceIndex = task.lastIndexOf(" ");
            if (lastSpaceIndex === -1) {
                tasks = [];
                alert(`Invalid input line "${task}". Please enter tasks in the format "Task Name 10" where 10 is the time in minutes.`);
                return;
            }
            let taskName = task.slice(0, lastSpaceIndex);
            let taskTime = task.slice(lastSpaceIndex + 1);
            if (isNaN(taskTime)) {
                tasks = [];
                alert(`Invalid input line "${task}". ${taskTime} is not a number. Please enter tasks in the format "Task Name 10" where 10 is the time in minutes.`);
                return;
            }
            tasks.push({
                name: taskName,
                time: taskTime
            })
        }
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
    console.log(task)
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
            currentTaskIndex++;
            audio.play();
            if (currentTaskIndex < tasks.length) {
                const notification = new Notification(`${task.name} completed, ${tasks[currentTaskIndex + 1]?.name} started for ${task.time} minutes`);
                notification;
                startNextTask();
            } else {
                new Notification("All tasks completed!")
                startButton.textContent = "Play";
                startButton.style.backgroundColor = "#57C5B6";
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
        currentTaskIndex = 0;
        startButton.textContent = "Play";
        startButton.style.backgroundColor = "#57C5B6";
        tasks = [];
    }
}

taskInput.addEventListener("keydown", handleKeyPress);
startButton.addEventListener("click", startTimer);
skipButton.addEventListener("click", () => {
    if (currentTaskIndex < tasks.length - 1) {
        clearInterval(timerId);
        currentTaskIndex++;
        remainingTime = 0; // reset remaining time for the current task
        startNextTask();
    } else {
        clearInterval(timerId);
        currentTaskIndex = 0;
        tasks = [];
        new Notification("All tasks completed!")
        taskInput.value = "";
        remainingTime = 0;
        startButton.textContent = "Play";
        startButton.style.backgroundColor = "#57C5B6";
        title.textContent = "Task Timer";
        document.title = "Task Timer";
    }
});

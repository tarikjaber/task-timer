const taskInput = document.getElementById("task-input");
const notesInput = document.getElementById("notes-input");
const startButton = document.getElementById("start-button");
const skipButton = document.getElementById("skip-button");
const timeText = document.getElementById("time");
const title = document.getElementById("title");

taskInput.focus();
let currentTaskIndex = 0;
let tasks = [];
let timerId;
let audio = new Audio('ding.mp3');
let remainingTime = 0; // new variable to store remaining time for the current task

// Load task input from localStorage
taskInput.value = localStorage.getItem("taskInput") || "";
notesInput.value = localStorage.getItem("notesInput") || "";

function startTimer() {
    console.log("start timer");
    clearInterval(timerId);
    if (tasks.length === 0) {
        formatInput();
        const tasksArray = taskInput.value.trim().split('\n').map(task => task.trim()).filter(task => task !== "");
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
            } else if (taskTime <= 0) {
                tasks = [];
                alert(`Invalid input line "${task}". ${taskTime} is not a positive number. Please enter tasks in the format "Task Name 10" where 10 is the time in minutes.`);
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
        startButton.classList.remove("play");
        startButton.classList.add("pause");
        if (currentTaskIndex >= tasks.length) {
            currentTaskIndex = 0;
        }
        startNextTask();
    } else {
        startButton.textContent = 'Play';
        startButton.classList.remove("pause");
        startButton.classList.add("play");
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
    const startInterval = () => {
        remainingTime = timeLeft; // store remaining time for the current task
        const minutesLeft = Math.floor(timeLeft / 60);
        const secondsLeft = timeLeft % 60;
        timeText.textContent = `${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;
        title.textContent = task.name;
        document.title = `${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")} - ${task.name}`;
        if (timeLeft === 0) {
            clearInterval(timerId);
            currentTaskIndex++;
            audio.play();
            if (currentTaskIndex < tasks.length) {
                new Notification(`${task.name} completed, ${tasks[currentTaskIndex]?.name} started for ${task.time} minute${task.time > 1 ? "s" : ""}`);
                startNextTask();
            } else {
                new Notification("All tasks completed!")
                startButton.textContent = "Play";
                startButton.classList.remove("pause");
                startButton.classList.add("play");
                tasks = [];
                timerId = null;
                taskInput.value = "";
                title.textContent = "Task Timer";
                document.title = "Task Timer";
            }
        }
        timeLeft--;
    }
    startInterval();
    timerId = setInterval(startInterval, 1000);
}

function handleKeyPress(event) {
    if (event.altKey) {
        return;
    }

    if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        startTimer();
    } else if (!event.shiftKey) {
        clearInterval(timerId);
        currentTaskIndex = 0;
        startButton.classList.remove("pause");
        startButton.classList.add("play");
        tasks = [];
    }
}

function formatInput() {
    newLines = []
    taskInput.value.trim().split('\n').map(task => task.trim()).filter(task => task !== "").forEach(task => {
        line = task.trim().replace(/^- \[\s\] /, '').replace(/^- \[\s[xX]\] /, '').replace(/^- /, '')

        if (line.split(' ').length === 1 || isNaN(line.split(' ')[line.split(' ').length - 1])) {
            line += " 10"
        }

        newLines.push(line)
    });
    taskInput.value = newLines.join('\n');
}

// Event Listeners
taskInput.addEventListener("keydown", handleKeyPress);
startButton.addEventListener("click", startTimer);
skipButton.addEventListener("click", () => {
    if (currentTaskIndex < tasks.length - 1) {
        clearInterval(timerId);
        startButton.classList.remove("play");
        startButton.classList.add("pause");
        startButton.textContent = "Pause";
        currentTaskIndex++;
        remainingTime = 0; // reset remaining time for the current task
        startNextTask();
    } else {
        clearInterval(timerId);
        currentTaskIndex = 0;
        tasks = [];
        new Notification("All tasks completed!")
        startButton.textContent = "Play";
        startButton.classList.remove("pause");
        startButton.classList.add("play");
        taskInput.value = "";
        remainingTime = 0;
        timeText.textContent = "00:00";
        title.textContent = "Task Timer";
        document.title = "Task Timer";
    }
});

// Save task input to localStorage when the input changes
taskInput.addEventListener("input", () => {
    localStorage.setItem("taskInput", taskInput.value);
});

notesInput.addEventListener("input", () => {
    localStorage.setItem("notesInput", notesInput.value);
});

document.addEventListener("mouseup", (event) => {
  if (event.target === notesInput) {
    const selectedText = window.getSelection().toString();
    console.log(selectedText);

    if (selectedText.trim() !== "") {
      let confirmed = true;
      console.log(timerId);

      if (timerId) {
        confirmed = confirm(`Add "${selectedText}" to the task list and start the timer?`);
        console.log(confirmed);
      }

      if (confirmed) {
        console.log("hi");
        clearInterval(timerId);
        currentTaskIndex = 0;
        remainingTime = 0;
        tasks = [];
        taskInput.value = selectedText;
        localStorage.setItem("taskInput", notesInput.value);
      }
    }
  }
});


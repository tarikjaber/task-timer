const taskInput = document.getElementById("task-input");
const startButton = document.getElementById("start-button");
const timer = document.getElementById("timer");
const title = document.getElementById("title");

let taskName = "";
let taskTime = 0;
let currentTask = "";
let nextTask = "";
let timerId;
let audio = new Audio('ding.mp3');
let isRunning = false;

function startTimer() {
    // Clear any existing timer
    clearInterval(timerId);

    // Get task names and times from input
    const inputText = taskInput.value.trim();
    if (inputText === "") {
        return;
    }
    const inputArray = inputText.split("\n");

    // Loop through tasks
    let currentTaskIndex = 0;
    const totalTasks = inputArray.length / 2;
    const startNextTask = () => {
        if (currentTaskIndex < totalTasks) {
            // Set current and next task names and times
            currentTask = inputArray[currentTaskIndex * 2].trim();
            taskTime = parseInt(inputArray[currentTaskIndex * 2 + 1].trim());
            nextTask = inputArray[currentTaskIndex * 2 + 2]?.trim() || "";
            let timeLeft = 0; // Add this variable to store dthe remaining time

            // If the timer is being resumed, start from the remaining time
            if (timeLeft > 0) {
                taskTime = Math.floor(timeLeft / 60);
                timeLeft = timeLeft % 60;
            } else {
                timeLeft = taskTime * 60;
            }

            timerId = setInterval(() => {
                if (!isRunning) {
                    return;
                }
                timeLeft--;
                const minutesLeft = Math.floor(timeLeft / 60);
                const secondsLeft = timeLeft % 60;
                title.textContent = `${currentTask} - ${minutesLeft}:${secondsLeft.toString().padStart(2, "0")}`;

                // Update page title with task name and remaining time
                document.title = `${currentTask} - ${minutesLeft}:${secondsLeft.toString().padStart(2, "0")}`;

                // Check if time is up
                if (timeLeft === 0) {
                    clearInterval(timerId);
                    // Set title to next task name
                    title.textContent = `Task Timer`;
                    // Send notification
                    const notification = `${currentTask} completed, ${nextTask} started for ${taskTime} minutes`;
                    // Start next task
                    currentTaskIndex++;
                    audio.play();
                    if (currentTaskIndex < totalTasks) {
                        new Notification(notification);
                        startNextTask();
                    } else {
                        new Notification("All tasks completed!")
                        taskInput.value = ""
                        taskInput.focus()
                        document.title = "Task Timer";
                    }
                }
            }, 1000);

            isRunning = true;
        } else {
            // All tasks are completed, reset timer
            clearInterval(timerId);
            title.textContent = "Task Timer";
            document.title = "Task Timer";
            taskInput.value = "";
            taskInput.focus();
            isRunning = false;
        }
    };

    startNextTask();
}


function handleKeyPress(event) {
    if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        startTimer();
    }
}

taskInput.addEventListener("keydown", handleKeyPress);
startButton.addEventListener("click", startTimer);

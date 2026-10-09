const display = document.getElementById("display");
const expression = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

// Stores the current calculation
let current = "0";
let firstNumber = null;
let operator = null;
let waitingForNumber = false;
let resetOnNextInput = false;
let savedExpression="";

// Update the calculator screen
function updateDisplay() {
   resultDisplay.textContent=current;

   if(operator !==null && firstNumber !==null){
    expression.textContent=firstNumber + " " + operator + " " + (waitingForNumber ? "" : current);
   }
   else{
    expression.textContent=savedExpression;
   }
}

// Add a number to the display
function enterNumber(number) {
    if (current === "Error" || waitingForNumber ||
        resetOnNextInput) {
        current = number;
        waitingForNumber = false;
        resetOnNextInput = false;
    } else if (current === "0") {
        current = number;
    } else if (current === "-0") {
        current = "-" + number;
    } else if (current.replace("-", "").length < 15) {
        current += number;
    }

    updateDisplay();
}

// Add a decimal point
function enterDecimal() {
    if (current === "Error" || waitingForNumber ||
        resetOnNextInput) {
        current = "0.";
        waitingForNumber = false;
        resetOnNextInput = false;
    } else if (!current.includes(".")) {
        current += ".";
    }

    updateDisplay();
}

// Perform the selected calculation
function calculate(a, b, op) {
    switch (op) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return b === 0 ? null : a / b;
        default:
            return b;
    }
}

// Format the result and handle errors
function showResult(result) {
    if (result === null || !Number.isFinite(result)) {
        current = "Error";
        savedExpression="";
    } else {
        // Avoid long floating-point decimal results
        savedExpression=expression.textContent + " = " ;
        current = String(Number(result.toPrecision(12)));
    }

    firstNumber = null;
    operator = null;
    waitingForNumber = true;
    resetOnNextInput = true;
    updateDisplay();
}

// Choose an operator
function chooseOperator(nextOperator) {
    if (current === "Error") return;

    const inputValue = Number(current);

    // Calculate the previous operation first
    if (operator !== null && !waitingForNumber) {
        const result = calculate(
            firstNumber, inputValue, operator
        );

        if (result === null || !Number.isFinite(result)) {
            showResult(null);
            return;
        }

        current = String(Number(result.toPrecision(12)));
        firstNumber = Number(current);
        updateDisplay();
    } else {
        firstNumber = inputValue;
    }

    operator = nextOperator;
    waitingForNumber = true;
    resetOnNextInput = false;
    updateDisplay();
}

// Calculate the final answer
function showAnswer() {
    if (operator === null || firstNumber === null ||
        current === "Error") return;

    const secondNumber = waitingForNumber
        ? firstNumber
        : Number(current);

    const result = calculate(
        firstNumber, secondNumber, operator
    );

    showResult(result);
}

// Clear everything
function clearCalculator() {
    current = "0";
    firstNumber = null;
    operator = null;
    waitingForNumber = false;
    resetOnNextInput = false;
    savedExpression="";
    updateDisplay();
}

// Delete the last digit
function deleteDigit() {
    if (current === "Error" || resetOnNextInput) {
        clearCalculator();
        return;
    }

    if (waitingForNumber) return;

    current = current.length > 1
        ? current.slice(0, -1)
        : "0";

    if (current === "-") current = "0";
    updateDisplay();
}

// Convert the current number to a percentage
function percentage() {
    if (current === "Error") return;

    current = String(Number(current) / 100);
    updateDisplay();
}

// Change between positive and negative
function changeSign() {
    if (current === "Error") return;

    current = String(-Number(current));
    updateDisplay();
}

// Handle all calculator button clicks
document.querySelector(".buttons").addEventListener(
    "click", function(event) {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.dataset.value !== undefined) {
            const value = button.dataset.value;

            if ("0123456789".includes(value)) {
                enterNumber(value);
            } else {
                chooseOperator(value);
            }
        }

        switch (button.dataset.action) {
            case "clear":
                clearCalculator();
                break;
            case "delete":
                deleteDigit();
                break;
            case "percent":
                percentage();
                break;
            case "sign":
                changeSign();
                break;
            case "decimal":
                enterDecimal();
                break;
            case "equals":
                showAnswer();
                break;
        }
    }
);

// Allow calculations using the keyboard
document.addEventListener("keydown", function(event) {
    const key = event.key;

    if ("0123456789".includes(key) && key.length === 1) {
        enterNumber(key);
    } else if (key === ".") {
        enterDecimal();
    } else if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
    } else if (key === "Enter" || key === "=") {
        showAnswer();
    } else if (key === "Backspace") {
        deleteDigit();
    } else if (key === "Escape") {
        clearCalculator();
    } else if (key === "%") {
        percentage();
    }
});
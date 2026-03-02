const buttons = document.getElementById("buttons");
const normalKey = document.getElementsByClassName("normalKey");
const functionKey = document.getElementsByClassName("functionKey");
const specialKey = document.getElementsByClassName("specialKey");
let inputOutput = document.getElementById("inputOutput");
const operators = ["+", "-", "*", "/", "%"];
const specialFunctions = ["AC", "DEL", "="];
let currentInput = "";
let shouldReset = false; // Flag to determine if next input should reset the display
// --- Calc brain but gave me a brain ache ---
function updateInputOutput() {
    if (inputOutput) {
        inputOutput.textContent = currentInput || "0";
    }
}
function calculateResult() {
 if (!currentInput || operators.includes(currentInput.slice(-1))) return;
    // tokens is an array of numbers and operators in the order they appear
    let tokens = currentInput.match(/(\d+\.?\d*)|([\+\-\*\/%])/g);
    if (!tokens || !tokens.some(t => operators.includes(t))) return; // Needs an operator to calculate
    tokens = tokens.map(t => isNaN(t) ? t : parseFloat(t));

    const operations = {
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "*": (a, b) => a * b,
        "/": (a, b) => b === 0 ? "Error" : a / b,
        "%": (a, b) => b === 0 ? "Error" : a % b
    };
    // --- The brain be careful of order of operations MD first ---
    // ---Multiplication and Division (MD)---
    let i = 0;
    while (i < tokens.length) {
        if (tokens[i] === "*" || tokens[i] === "/") {
            const res = operations[tokens[i]](tokens[i - 1], tokens[i + 1]);
            if (res === "Error") {
                currentInput = "Can't div by 0";
                updateInputOutput(); // Update screen with error
                return;
            }
            tokens.splice(i - 1, 3, res);
            i--; 
            // Move back index to check for consecutive MD operations
        } else {
            i++;
        }
    }

    // --- Addition and Subtraction (AS) ---
    let finalValue = tokens[0];
    for (let j = 1; j < tokens.length; j += 2) {
        finalValue = operations[tokens[j]](finalValue, tokens[j + 1]);
    }

    // --- REFRESH ---
   // Added a check to ensure finalValue is a number before toFixed
    if (!isNaN(finalValue)) {
        currentInput = parseFloat(finalValue.toFixed(4)).toString();
    }
    shouldReset = true;
    updateInputOutput();
}
function handleInput(value) {
    const lastChar = currentInput.slice(-1);

    // --- NEW RESET---
    if (shouldReset) {
        if (!operators.includes(value) && value !== "=") {
            // If you type a number after "=" would start fresh
            currentInput = "";
        }
        shouldReset = false; // Turn off the reset flag
    }
    // --- Handle Special Functions ---
    if (value === "AC") {
        currentInput = "";
    } else if (value === "DEL") {
        currentInput = currentInput.slice(0, -1);
    } else if (value === "=") {
        calculateResult();
    return; // calculateResult handles its own update
    } else if (operators.includes(value)) {
        if (currentInput === "" && value === "-") currentInput = "-";
        else if (currentInput !== "" && !operators.includes(lastChar)) {
            currentInput += value;
        }
    } else {
        // Numbers and decimals
        if (value === ".") {
            // 1. Split by operators to get the "current" number segment
            const parts = currentInput.split(/[\+\-\*\/]/);
            const lastNumber = parts[parts.length - 1];

            // 2. If the last number already has a dot, block the input
            if (lastNumber.includes(".")) return; 
            // 3. Optional: If starting a number with ".", add a leading zero (e.g., ".5" -> "0.5")
            if (currentInput === "" || operators.includes(lastChar)) {
                currentInput += "0";
            }
        }
        currentInput += value;
    }

    updateInputOutput();
}
window.addEventListener("keydown", (event) => {
    let key = event.key;
    if (key === "Enter") key = "=";
    if (key === "Backspace") key = "DEL";
    if (key === "Escape") key = "AC";
    if (key === "*") key = "*";
    if (key === "/") key = "/";
    if (key === "%") key = "%";
    const validKeys = ["0","1","2","3","4","5","6","7","8","9",".","+","-","*","/","=","AC","DEL"];
    if (validKeys.includes(key)) {
        event.preventDefault();
        handleInput(key);
    }
});
buttons.addEventListener("click", (event) => {
    // finds the button even if you click on text/icons inside it
    const target = event.target.closest("button");
    if (!target) return;
    handleInput(target.textContent.trim());
    });

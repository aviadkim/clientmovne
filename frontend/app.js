const form = document.getElementById("questionnaire-form");
const canvas = document.getElementById("signature");
const clearButton = document.getElementById("clear-signature");
const ctx = canvas.getContext("2d");

let isDrawing = false;

// Handle drawing on canvas
canvas.addEventListener("mousedown", () => (isDrawing = true));
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mousemove", draw);
clearButton.addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

function draw(event) {
    if (!isDrawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
}

// Form submission
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Include signature as Base64
    data.signature = canvas.toDataURL();

    const response = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert("השאלון נשלח בהצלחה!");
    } else {
        alert("אירעה שגיאה, נסה שנית.");
    }
});

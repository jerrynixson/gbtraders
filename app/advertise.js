document.getElementById("vehicleForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from refreshing

    const formData = new FormData();
    formData.append("registration", document.getElementById("registration").value);
    formData.append("miles", document.getElementById("mileage").value);
    formData.append("brand", document.getElementById("brand").value);
    formData.append("model", document.getElementById("model").value);

    const imageFiles = document.getElementById("imageInput").files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append("images", imageFiles[i]); // Append multiple images
    }

    try {
        const response = await fetch("http://localhost:5000/add-vehicle", {
            method: "POST",
            body: formData, // Sends form data including images
        });

        const result = await response.json();
        document.getElementById("responseMessage").innerText = result.message;

        // Clear form after successful submission
        document.getElementById("vehicleForm").reset();
    } catch (err) {
        console.error("Error:", err);
        document.getElementById("responseMessage").innerText = "Error posting advertisement.";
    }
});

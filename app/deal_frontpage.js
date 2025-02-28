document.addEventListener("DOMContentLoaded", async function () {
    const carListings = document.querySelector(".car-listings");

    async function fetchVehicles() {
        try {
            console.log("Fetching vehicles...");
            const response = await fetch("http://localhost:5000/vehicles");
            const vehicles = await response.json();
            console.log("Received vehicles:", vehicles); // Debugging line

            if (!vehicles || vehicles.length === 0) {
                console.warn("No vehicles found.");
                return;
            }

            // Keep only the last 3 vehicles
            const latestVehicles = vehicles.slice(-3);

            // Clear existing car cards
            carListings.innerHTML = "";

            // Loop through the latest vehicles & add to UI
            latestVehicles.forEach(vehicle => {
                const carCard = document.createElement("article");
                carCard.classList.add("car-card");

                carCard.innerHTML = `
                    <div class="car-image-container">
                        <img src="data:image/jpeg;base64,${vehicle.images[0]}" alt="Vehicle Image" class="car-image"/>
                        <div class="car-badge">
                            <span class="badge-electric">${vehicle.brand === "Tesla" ? "EV" : ""}</span>
                        </div>
                    </div>
                    <div class="car-details">
                        <div class="price-info">
                            <div class="price-main">
                                <span class="price-label">Brand:</span>
                                <span class="price-amount">${vehicle.brand}</span>
                            </div>
                            <div class="price-main">
                                <span class="price-label">Model:</span>
                                <span class="price-amount">${vehicle.model}</span>
                            </div>
                            <div class="price-details">
                                <div>Miles: ${vehicle.miles} km</div>
                                <div>Reg: ${vehicle.registration}</div>
                            </div>
                        </div>
                        <div class="car-info">
                            <h3 class="car-title">${vehicle.brand} ${vehicle.model}</h3>
                        </div>
                    </div>
                `;

                carListings.appendChild(carCard);
            });

        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    }

    // Fetch & update vehicles on page load
    fetchVehicles();
});

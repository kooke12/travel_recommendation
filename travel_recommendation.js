
"use strict";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const resultsContainer = document.getElementById("results");
const resultsMessage = document.getElementById("resultsMessage");

let travelData = null;

// Load recommendation data from the local JSON file.
async function loadTravelData() {
  try {
    const response = await fetch("./travel_recommendation_api.json");

    if (!response.ok) {
      throw new Error(`Could not load JSON: HTTP ${response.status}`);
    }

    travelData = await response.json();
    console.log("Travel data loaded successfully:", travelData);
  } catch (error) {
    console.error("Error loading travel data:", error);
    resultsMessage.textContent =
      "Unable to load travel data. Run this project with Live Server.";
  }
}

// Normalize different keyword variations.
function normalizeKeyword(value) {
  const keyword = value.trim().toLowerCase();

  if (["beach", "beaches"].includes(keyword)) {
    return "beaches";
  }

  if (["temple", "temples"].includes(keyword)) {
    return "temples";
  }

  if (["country", "countries"].includes(keyword)) {
    return "countries";
  }

  return null;
}

// Return the appropriate recommendations from the JSON data.
function getRecommendations(category) {
  if (!travelData || !category) {
    return [];
  }

  if (category === "beaches") {
    return (travelData.beaches || []).map(place => ({
      ...place,
      category: "Beach"
    }));
  }

  if (category === "temples") {
    return (travelData.temples || []).map(place => ({
      ...place,
      category: "Temple"
    }));
  }

  if (category === "countries") {
    // Country recommendations use the first two cities
    // available for each country.
    return (travelData.countries || []).flatMap(country =>
      (country.cities || []).slice(0, 2).map(city => ({
        ...city,
        name: city.name || country.name,
        description: city.description ||
          `Discover beautiful destinations in ${country.name}.`,
        imageUrl: city.imageUrl,
        category: country.name
      }))
    );
  }

  return [];
}

// Build a recommendation card safely.
function createRecommendationCard(place) {
  const card = document.createElement("article");
  card.className = "result-card";

  const image = document.createElement("img");
  image.src = place.imageUrl || "";
  image.alt = place.name || "Travel destination";
  image.loading = "lazy";

  image.addEventListener("error", () => {
    image.alt = "Image unavailable for " + (place.name || "destination");
    image.style.display = "none";
  });

  const info = document.createElement("div");
  info.className = "result-info";

  const title = document.createElement("h3");
  title.textContent = place.name || "Travel destination";

  const description = document.createElement("p");
  description.textContent =
    place.description || "Discover this amazing travel destination.";

  const category = document.createElement("small");
  category.textContent = place.category || "Destination";

  info.append(title, description, category);
  card.append(image, info);

  return card;
}

// Search runs only after the Search button is clicked.
function searchRecommendations(event) {
  event.preventDefault();

  const category = normalizeKeyword(searchInput.value);

  resultsContainer.replaceChildren();

  if (!searchInput.value.trim()) {
    resultsMessage.textContent =
      "Please enter beach, temple, or country.";
    return;
  }

  if (!category) {
    resultsMessage.textContent =
      "No matching category. Try beach, beaches, temple, temples, country, or countries.";
    return;
  }

  if (!travelData) {
    resultsMessage.textContent =
      "Travel data is still loading. Please try again.";
    return;
  }

  const recommendations = getRecommendations(category);

  if (recommendations.length === 0) {
    resultsMessage.textContent =
      "No recommendations were found for this category.";
    return;
  }

  recommendations.forEach(place => {
    resultsContainer.appendChild(createRecommendationCard(place));
  });

  resultsMessage.textContent =
    `Showing ${recommendations.length} recommendations for "${category}".`;
}

// Clear the search box and all displayed results.
function clearRecommendations() {
  searchInput.value = "";
  resultsContainer.replaceChildren();
  resultsMessage.textContent =
    "Search for beach, temple, or country to discover your next destination.";
}

// Contact form: prepare an email using the visitor's email application.
document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const status = document.getElementById("contactStatus");

  if (!name || !email || !message) {
    status.textContent = "Please complete all fields.";
    return;
  }

  const subject = encodeURIComponent("Travel Explorer Contact");
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  status.textContent =
    "Opening your email application. Send the prepared email to complete your message.";

  window.location.href =
    `mailto:contact@example.com?subject=${subject}&body=${body}`;
});

searchForm.addEventListener("submit", searchRecommendations);
clearBtn.addEventListener("click", clearRecommendations);

// Fetch the JSON data when the page starts.
loadTravelData();

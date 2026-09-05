// North Star Bakery - Touchstone 4 interactivity and client-side data

const products = [
  { id: "sourdough", name: "Classic sourdough", category: "bread", description: "A crisp crust with a soft, chewy centre.", price: "$8-$12" },
  { id: "wholegrain", name: "Seeded wholegrain", category: "bread", description: "A hearty loaf with seeds and whole grains.", price: "$9-$13" },
  { id: "croissant", name: "Butter croissants", category: "pastry", description: "Light, flaky pastry baked until golden.", price: "$4-$6" },
  { id: "danish", name: "Fruit danishes", category: "pastry", description: "Sweet pastry filled with seasonal fruit.", price: "$5-$7" },
  { id: "cookie", name: "Filled cookies", category: "pastry", description: "Handmade cookies with rotating fillings.", price: "$4-$6" },
  { id: "small-cake", name: "Small celebration cakes", category: "cake", description: "Simple decorated cakes for birthdays and family gatherings.", price: "$25-$45" },
  { id: "large-cake", name: "Large custom cakes", category: "cake", description: "Larger cakes for events and special occasions.", price: "$45-$80" }
];

const filterOptions = [
  { value: "all", label: "All products" },
  { value: "bread", label: "Breads" },
  { value: "pastry", label: "Pastries" },
  { value: "cake", label: "Cakes & celebrations" }
];

const validationRules = {
  name: { min: 2, max: 60, message: "Please enter your name (2-60 characters)." },
  email: { message: "Please enter a valid email address." },
  pickupDate: { message: "Please choose today or a future pickup date." },
  requestType: { message: "Please choose a request type." },
  itemDetails: { min: 5, message: "Please provide at least 5 characters describing your request." }
};

const STORAGE_KEYS = {
  filter: "northStarProductFilter",
  favorite: "northStarFavoriteProduct",
  name: "northStarContactName"
};

function getStoredValue(key, fallback = "") {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function saveStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Storage may be unavailable in some browser privacy modes.
  }
}

function renderProducts(category) {
  const list = document.getElementById("product-results");
  const count = document.getElementById("product-count");
  const favoriteMessage = document.getElementById("favorite-message");
  if (!list || !count) return;

  const filtered = category === "all"
    ? products
    : products.filter(product => product.category === category);

  list.innerHTML = filtered.map(product => `
    <article class="product-item product-card" data-category="${product.category}">
      <div>
        <strong>${product.name}</strong>
        <p>${product.description}</p>
        <p><strong>Typical range:</strong> ${product.price}</p>
      </div>
      <button class="favorite-button" type="button" data-product-id="${product.id}" aria-pressed="false">☆ Save favourite</button>
    </article>
  `).join("");

  count.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"} shown`;
  const savedFavorite = getStoredValue(STORAGE_KEYS.favorite);
  document.querySelectorAll(".favorite-button").forEach(button => {
    const isSaved = button.dataset.productId === savedFavorite;
    button.setAttribute("aria-pressed", String(isSaved));
    button.textContent = isSaved ? "★ Favourite saved" : "☆ Save favourite";
    button.addEventListener("click", handleFavoriteClick);
  });

  if (favoriteMessage) {
    const saved = products.find(product => product.id === savedFavorite);
    favoriteMessage.textContent = saved
      ? `Your saved favourite is ${saved.name}.`
      : "Choose a product to save it as your favourite.";
  }
}

function handleFilterChange(event) {
  const category = event.target.value;
  saveStoredValue(STORAGE_KEYS.filter, category);
  renderProducts(category);
}

function handleFavoriteClick(event) {
  const productId = event.currentTarget.dataset.productId;
  const current = getStoredValue(STORAGE_KEYS.favorite);
  saveStoredValue(STORAGE_KEYS.favorite, current === productId ? "" : productId);
  const select = document.getElementById("product-filter");
  renderProducts(select ? select.value : "all");
}

function initializeProductFilter() {
  const select = document.getElementById("product-filter");
  if (!select) return;
  const storedCategory = getStoredValue(STORAGE_KEYS.filter, "all");
  const validCategory = filterOptions.some(option => option.value === storedCategory) ? storedCategory : "all";
  select.value = validCategory;
  select.addEventListener("change", handleFilterChange);
  renderProducts(validCategory);
}

function setFieldError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function clearFieldError(input) {
  setFieldError(input, "");
}

function validateContactForm() {
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const pickupDate = document.getElementById("pickup-date");
  const requestType = document.getElementById("request-type");
  const itemDetails = document.getElementById("item-details");
  const formMessage = document.getElementById("form-message");
  if (!name || !email || !pickupDate || !requestType || !itemDetails) return true;

  let valid = true;
  [name, email, pickupDate, requestType, itemDetails].forEach(clearFieldError);
  const trimmedName = name.value.trim();
  const trimmedEmail = email.value.trim();
  const today = new Date().toISOString().split("T")[0];

  if (trimmedName.length < validationRules.name.min || trimmedName.length > validationRules.name.max) {
    setFieldError(name, validationRules.name.message);
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    setFieldError(email, validationRules.email.message);
    valid = false;
  }
  if (!pickupDate.value || pickupDate.value < today) {
    setFieldError(pickupDate, validationRules.pickupDate.message);
    valid = false;
  }
  if (!requestType.value) {
    setFieldError(requestType, validationRules.requestType.message);
    valid = false;
  }
  if (itemDetails.value.trim().length < validationRules.itemDetails.min) {
    setFieldError(itemDetails, validationRules.itemDetails.message);
    valid = false;
  }

  if (formMessage) {
    formMessage.textContent = valid ? "Your inquiry is ready to send." : "Please correct the highlighted fields before sending your inquiry.";
    formMessage.className = valid ? "form-message success" : "form-message error";
  }
  return valid;
}

function initializeContactForm() {
  const form = document.getElementById("contact-form");
  const name = document.getElementById("name");
  const pickupDate = document.getElementById("pickup-date");
  if (!form || !name) return;

  const storedName = getStoredValue(STORAGE_KEYS.name);
  if (storedName) name.value = storedName;
  if (pickupDate) pickupDate.min = new Date().toISOString().split("T")[0];

  name.addEventListener("input", () => saveStoredValue(STORAGE_KEYS.name, name.value));
  form.addEventListener("submit", event => {
    if (!validateContactForm()) {
      event.preventDefault();
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeProductFilter();
  initializeContactForm();
});

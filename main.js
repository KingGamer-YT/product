// Define an asynchronous function to fetch data
async function getData() {
  // Fetch the JSON file located at "./data.json"
  const res = await fetch("./data.json");
  // Parse the response as JSON
  const data = await res.json();
  // Return the parsed JSON data
  return data;
}

// Call the getData function and wait for it to complete
const data = await getData();

// Initialize arrays to store item details from the JSON data
const names = [];
const categories = [];
const prices = [];
const thumbnails = [];
const desktopImages = [];
const tabletImages = [];
const mobileImages = [];
const cartList = []; // Array to keep track of items in the cart

// Select the element where the number of items in the cart will be displayed
const numItems = document.querySelector(".num-items");

// Function to calculate and display the total number of items in the cart
function getAllItems() {
  let items = 0; // Initialize the item count
  // Iterate through each item in the cartList and add its quantity to the total count
  cartList.forEach((item) => (items += item.quantity));
  // Update the text content of the numItems element to display the total number of items, or 0 if the cart is empty
  numItems.textContent = cartList.length > 0 ? items : 0;
}

// Populate arrays with item details from the data
data.forEach((element) => {
  names.push(element["name"]); // Add item name to names array
  categories.push(element["category"]); // Add item category to categories array
  prices.push(element["price"]); // Add item price to prices array
  thumbnails.push(element["image"]["thumbnail"]); // Add item thumbnail image URL to thumbnails array
  desktopImages.push(element["image"]["desktop"]); // Add item desktop image URL to desktopImages array
  tabletImages.push(element["image"]["tablet"]); // Add item tablet image URL to tabletImages array
  mobileImages.push(element["image"]["mobile"]); // Add item mobile image URL to mobileImages array
});

// Function to determine the appropriate image source based on the screen size
function generateSource(index) {
  // Check if the screen width is at least 1200px and return the desktop image URL
  if (window.matchMedia("(min-width: 1200px)").matches) {
      return desktopImages[index];
  } else if (
    // Check if the screen width is between 768px and 1199px and return the tablet image URL
    window.matchMedia("(min-width: 768px)").matches &&
    window.matchMedia("(max-width: 1199px)").matches
  ) {
      return tabletImages[index];
  } else {
      // For screens smaller than 768px, return the mobile image URL
      return mobileImages[index];
  }
}

// Select the element where the items will be displayed
const contents = document.querySelector(".contents");

// Loop through each category and create HTML for each item
for (let i = 0; i < categories.length; i++) {
  let content = document.createElement("div"); // Create a new div for each item
  content.classList.add("content"); // Add the "content" class to the new div
  // Set the inner HTML of the content div with item details
  content.innerHTML = `
      <div class="image">
          <img src="${generateSource(i)}" alt=""> <!-- Set the image source based on screen size -->
          <button data-thumb="${i}" data-name="${names[i]}">
              <i class="fa-solid fa-cart-plus"></i> <!-- Add cart-plus icon -->
              <span>add to cart</span>
          </button>
      </div>
      <p class="category">${categories[i]}</p> <!-- Display item category -->
      <h2 class="name">${names[i]}</h2> <!-- Display item name -->
      <p class="price">$<span>${prices[i]}</span></p> <!-- Display item price -->
  `;
  contents.appendChild(content); // Append the newly created content div to the contents element
}

// Add event listener to handle window resize events
window.addEventListener("resize", function () {
  const images = document.querySelectorAll(".image img"); // Select all image elements within content
  // Loop through each image and update its source based on screen size
  for (let j = 0; j < images.length; j++) {
      images[j].src = generateSource(j); // Update image source
  }
});

// Function to update the cart UI
function updateCartUI() {
  // Check if there are items in the cart
  if (cartList.length > 0) {
      cart.textContent = ""; // Clear the cart element if it has items
  } else {
      // If the cart is empty, show an empty cart message
      cart.innerHTML = `
          <div class="empty-cart">
              <img class="empty-img" src="./assets/images/illustration-empty-cart.svg" alt=""> <!-- Display empty cart image -->
              <p>Your added items will appear here</p> <!-- Display message -->
          </div>`;
      // Check if cartList is empty and reset add buttons
      if (cartList.length == 0) {
          addBtns.forEach((btn, j) => {
              btn.innerHTML = `
                  <i class="fa-solid fa-cart-plus"></i>
                  <span>add to cart</span>
              `;
          });
      }
      return; // Exit the function if the cart is empty
  }
  // Loop through each item in the cartList to create cart item elements
  cartList.forEach((it, index) => {
      let item = document.createElement("div"); // Create a new div for each cart item
      item.classList.add("item"); // Add the "item" class to the new div
      // Set the inner HTML of the item div with cart item details
      item.innerHTML = `
          <div class="product-info">
              <h3 class="name">${it.name}</h3> <!-- Display item name -->
              <div class="num-items">
                  <div class="quantity"><span>${it.quantity}</span>x</div> <!-- Display item quantity -->
                  <div class="price-box">
                      <span class="single-item-price">@$<span>${it.price}</span></span> <!-- Display item price -->
                      <span class="total-price">$<span>${it.quantity * parseFloat(it.price).toFixed(2)}</span></span> <!-- Display total price for the item -->
                  </div>
              </div>
          </div>
          <button class="remove-item" data-name="${it.name}" data-index="${index}">
              <i class="fa-solid fa-times"></i> <!-- Add remove icon -->
          </button>
      `;
      // Check if total amount section exists
      if (!document.querySelector(".items .total-amount")) {
          let totalContent = document.createElement("div"); // Create a new div for total amount
          totalContent.classList.add("total-amount"); // Add the "total-amount" class to the new div
          // Set the inner HTML of the totalContent div with total amount details
          totalContent.innerHTML = `
              <div class="total">
                  <span>order total</span> <!-- Label for order total -->
                  <span class="bold">$<span class="total-to-pay bold">${updateAllPrice()}</span></span> <!-- Display total price -->
              </div>
              <div class="tree">
                  <img src="./assets/images/icon-carbon-neutral.svg" alt=""> <!-- Display carbon-neutral delivery icon -->
                  <span>this is a <span class="bold">carbon-neutral</span> delivery</span> <!-- Carbon-neutral message -->
              </div>
              <div class="confirm-btn">
                  <button>confirm order</button> <!-- Confirm order button -->
              </div>
          `;
          cart.appendChild(item); // Append the item div to the cart element
          cart.appendChild(totalContent); // Append the totalContent div to the cart element
      } else {
          // If total amount section already exists, insert the new item before it
          cart.insertBefore(item, document.querySelector(".items .total-amount"));
          // Update the total price displayed in the total amount section
          document.querySelector(".total-to-pay.bold").textContent =
              updateAllPrice();
      }
      // Add event listeners to remove buttons
      let removeBtn = document.querySelectorAll(".remove-item");
      removeBtn.forEach((btn) =>
          btn.addEventListener("click", function () {
              let itemName = this.dataset.name; // Get the name of the item to remove
              let index;
              // Find the index of the item in the cartList
              for (let item of cartList) {
                  if (item.name == itemName) {
                      index = cartList.indexOf(item);
                      removeFromCart(index); // Call function to remove item from cart
                      return;
                  }
              }
          })
      );
  });

  // Add event listener to the confirm button
  const confirmBtn = document.querySelector(".confirm-btn");
  confirmBtn.addEventListener("click", function () {
      confirmOrders(); // Show confirmation window
      // Add event listener to the button in the confirmation window to reload the page
      document.querySelector(".confirm-window button").addEventListener("click", function () {
          window.location.reload(); // Reload the page
      });
  });
}

// Function to add an item to the cart
function addToCart(category, name, price) {
  // Check if the item already exists in the cart
  const existingItem = cartList.find((item) => item.name == name);
  if (existingItem) {
      // If item exists, return (item quantity will not be incremented)
      return;
  } else {
      // Otherwise, add a new item to the cartList with quantity 1
      cartList.push({ category, name, price, quantity: 1 });
  }
  getAllItems(); // Update the total number of items in the cart
  updateCartUI(); // Update the cart UI
}

// Function to remove an item from the cart by its index
function removeFromCart(index) {
  // Remove the item from the cartList array
  cartList.splice(index, 1);
  // Update the total price displayed in the cart UI
  document.querySelector(".total-to-pay.bold").textContent = updateAllPrice();
  getAllItems(); // Update the total number of items in the cart
  updateCartUI(); // Update the cart UI
}

// Function to increase the quantity of an item in the cart
function increaseItemQuantity(index) {
  cartList[index].quantity++; // Increment the quantity of the item at the given index
  // Update the total price displayed in the cart UI
  document.querySelector(".total-to-pay.bold").textContent = updateAllPrice();
  getAllItems(); // Update the total number of items in the cart
  updateCartUI(); // Update the cart UI
}

// Function to decrease the quantity of an item in the cart
function decreaseItemQuantity(index) {
  // Check if the item quantity is greater than 1
  if (cartList[index].quantity > 1) {
      cartList[index].quantity--; // Decrement the quantity
  } else {
      // If quantity is 1, remove the item from the cart
      cartList.splice(index, 1);
      return;
  }
  // Update the total price displayed in the cart UI
  document.querySelector(".total-to-pay.bold").textContent = updateAllPrice();
  getAllItems(); // Update the total number of items in the cart
  updateCartUI(); // Update the cart UI
}

// Function to calculate the total price of all items in the cart
function updateAllPrice() {
  let allPrice = 0; // Initialize total price
  // Loop through each item in the cartList and add its total price to allPrice
  cartList.forEach((item) => {
      allPrice += item.price * item.quantity;
  });
  return allPrice; // Return the calculated total price
}

// Select all "add to cart" buttons
let addBtns = document.querySelectorAll(".content .image button");
// Select the element where cart items will be displayed
const cart = document.querySelector("aside .items");

// Add event listeners to each "add to cart" button
addBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
      // Remove the empty cart message if present
      if (document.querySelector(".empty-cart")) {
          document.querySelector(".empty-cart").remove();
      }
      // Get the index of the item from the button's data attribute
      let index = parseInt(this.dataset.thumb);
      // Add the item to the cart
      addToCart(categories[index], names[index], prices[index]);
      let idx;
      // Find the index of the item in the cartList
      for (let item of cartList) {
          let thumbName = this.dataset.name;
          if (item.name == thumbName) {
              idx = cartList.indexOf(item);
              break;
          }
      }
      // Update the button's inner HTML to show quantity controls
      this.innerHTML = `
          <button class="increase-item" data-name="${cartList[idx].name}">+</button>
          <span>${cartList[idx].quantity}</span>
          <button class="decrease-item" data-name="${cartList[idx].name}">-</button>
      `;
      // Check if the increase and decrease buttons are present
      if (this.querySelector(".content button button")) {
          // Add event listener to increase button
          this.querySelector(".increase-item").addEventListener(
              "click",
              function () {
                  let name = this.dataset.name; // Get the name of the item to increase
                  let idx;
                  // Find the index of the item in the cartList
                  for (let item of cartList) {
                      if (item.name == name) {
                          idx = cartList.indexOf(item);
                          break;
                      }
                  }
                  increaseItemQuantity(idx); // Increase the item quantity
              }
          );
          // Add event listener to decrease button
          this.querySelector(".decrease-item").addEventListener(
              "click",
              function () {
                  let name = this.dataset.name; // Get the name of the item to decrease
                  let idx;
                  // Find the index of the item in the cartList
                  for (let item of cartList) {
                      if (item.name == name) {
                          idx = cartList.indexOf(item);
                          break;
                      }
                  }
                  decreaseItemQuantity(idx); // Decrease the item quantity
              }
          );
      }
  });
});

// Function to display the order confirmation window
function confirmOrders() {
  let box = document.createElement("div"); // Create a new div for the confirmation window
  box.classList.add("confirm-window"); // Add the "confirm-window" class to the new div
  // Set the inner HTML of the box with order confirmation details
  box.innerHTML = `
      <div class="check-icon">
          <i class="fa-solid fa-check"></i> <!-- Display check icon -->
      </div>
      <h3>order confirmed</h3> <!-- Confirmation message -->
      <p>we hope you enjoy your food</p> <!-- Additional message -->
  `;
  const pickedItems = document.createElement("div"); // Create a new div for picked items
  pickedItems.classList.add("picked-items"); // Add the "picked-items" class to the new div
  // Loop through each item in the cartList to create picked item elements
  for (let item of cartList) {
      let pickedItem = document.createElement("div"); // Create a new div for each picked item
      pickedItem.classList.add("picked-item"); // Add the "picked-item" class to the new div
      let index = names.indexOf(item.name); // Find the index of the item in the names array
      // Set the inner HTML of the pickedItem div with item details
      pickedItem.innerHTML = `
          <div class="thumb">
              <img src="${thumbnails[index]}" alt=""> <!-- Display item thumbnail -->
              <div class="food-info">
                  <h4 class="name">classic tiramisu</h4> <!-- Display item name (static text) -->
                  <div>
                      <span class="red"><span class="number">${item.quantity}</span>x</span> <!-- Display item quantity -->
                      <span class="single-price">@$<span class="price-num">${item.price}</span></span> <!-- Display item price -->
                  </div>
              </div>
          </div>
          <div class="total-payed-price">$<span>${item.quantity * item.price}</span></div> <!-- Display total price for the item -->
      `;
      pickedItems.appendChild(pickedItem); // Append the picked item div to the pickedItems element
  }
  box.appendChild(pickedItems); // Append the pickedItems element to the confirmation box
  // Add the total amount and start new order button to the confirmation box
  box.innerHTML += `
      <div class="total">
          <span>order total</span> <!-- Label for order total -->
          <span class="bold">$<span class="total-to-pay bold">${updateAllPrice()}</span></span> <!-- Display total price -->
      </div>
      <button>Start new order</button> <!-- Start new order button -->
  `;
  // Append the confirmation box to the container element
  document.querySelector(".container").appendChild(box);
}

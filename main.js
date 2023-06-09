const fetchUrl = "https://www.mobi2go.com/api/1/headoffice/XXXX/menu?export";
const prefix_to_delete = "";
let appContainer = document.getElementById("app-container");

let selectedMenu = null;

document.getElementById("fetch-button").addEventListener("click", () => {
  let headofficeId = document.getElementById("headoffice-id").value;
  let menuListDiv = document.getElementById("menu-list");
  let menuListTitle = document.getElementById("menu-list-title");
  let errorDiv = document.getElementById("error");
  let spinner = document.getElementById("spinner");

  menuListDiv.innerHTML = "";
  errorDiv.innerHTML = "";

  spinner.classList.add("spinner");
  appContainer.classList.add("app-when-spinning");

  fetch(fetchUrl.replace("XXXX", headofficeId))
    .then((res) => {
      if (!res.ok) throw new Error(`API Request failed with status ${res.status}`);
      return res.json();
    })
    .then((content) => {
      menuListTitle.innerHTML = "Select a menu";
      menuListTitle.classList.add("menu-list-title");
      menuListDiv.appendChild(menuListTitle);
      content.menus.forEach((menu, i) => {
        let menuElement = document.createElement("p");
        menuElement.textContent = menu.backend_name;
        menuElement.addEventListener("click", () => {
          selectedMenu = menu.backend_name;
          document.getElementById("submit-button").disabled = false;
          menuListDiv.childNodes.forEach((node) => (node.style.fontWeight = "normal"));
          menuListDiv.childNodes.forEach((node) => (node.style.color = "white"));
          menuElement.style.fontWeight = "bold";
          menuElement.style.color = "lime";
        });
        menuListDiv.appendChild(menuElement);
        spinner.classList.remove("spinner");
        appContainer.classList.remove("app-when-spinning");
      });
    })
    .catch((error) => {
      errorDiv.innerHTML = `<p>Error: ${error}</p>`;
      spinner.classList.remove("spinner");
      appContainer.classList.remove("app-when-spinning");
    });
});
document.getElementById("submit-button").addEventListener("click", () => {
  let headofficeId = document.getElementById("headoffice-id").value;
  let resultDiv = document.getElementById("result");
  let prefix = document.getElementById("prefix").value;
  let prefix_to_delete = document.getElementById("prefix-to-delete").value;
  resultDiv.innerHTML = "";

  spinner.classList.add("spinner");
  appContainer.classList.add("app-when-spinning");

  fetch(fetchUrl.replace("XXXX", headofficeId))
    .then((res) => {
      if (!res.ok) throw new Error(`API Request failed with status ${res.status}`);
      spinner.classList.remove("spinner");
      appContainer.classList.remove("app-when-spinning");
      return res.json();
    })
    .then((content) => {
      const menus_to_copy = [selectedMenu];

      const menus_to_keep = content.menus.filter((menu) => menus_to_copy.includes(menu.backend_name));
      const category_names_to_keep = _.union(...menus_to_keep.map((menu) => menu.categories));
      const categories_to_keep = content.categories.filter((category) => category_names_to_keep.includes(category.backend_name));

      const product_names_to_keep = _.union(...categories_to_keep.map((category) => category.products));
      const products_to_keep = content.products.filter((product) => product_names_to_keep.includes(product.backend_name));

      const modifier_group_names_to_keep = _.union(...products_to_keep.map((product) => product.modifier_groups));
      const modifier_groups_to_keep = content.modifier_groups.filter((modifier_group) =>
        modifier_group_names_to_keep.includes(modifier_group.backend_name)
      );

      const modifier_names_to_keep = _.union(...modifier_groups_to_keep.map((modifier_group) => modifier_group.modifiers));
      const modifiers_to_keep = content.modifiers.filter((modifier) => modifier_names_to_keep.includes(modifier.backend_name));

      // Display results on the webpage instead of console
      let foundList = document.createElement("ul");
      foundList.innerHTML += "<li><strong>Found</strong></li>";
      foundList.innerHTML += `<li>menus: ${content.menus.length}</li>`;
      foundList.innerHTML += `<li>categories: ${content.categories.length}</li>`;
      foundList.innerHTML += `<li>products: ${content.products.length}</li>`;
      foundList.innerHTML += `<li>modifier groups: ${content.modifier_groups.length}</li>`;
      foundList.innerHTML += `<li>modifiers: ${content.modifiers.length}</li>`;

      // Create the Extracted list
      let extractedList = document.createElement("ul");
      extractedList.innerHTML += "<li><strong>Extracted</strong></li>";
      extractedList.innerHTML += `<li>menus: ${menus_to_keep.length}</li>`;
      extractedList.innerHTML += `<li>categories: ${category_names_to_keep.length}</li>`;
      extractedList.innerHTML += `<li>products: ${product_names_to_keep.length}</li>`;
      extractedList.innerHTML += `<li>modifier groups: ${modifier_group_names_to_keep.length}</li>`;
      extractedList.innerHTML += `<li>modifiers: ${modifier_names_to_keep.length}</li>`;

      // Append the lists to the result div
      resultDiv.appendChild(foundList);
      resultDiv.appendChild(extractedList);
      const output = {
        menus: menus_to_keep.map((menu) => ({
          ...menu,
          backend_name: `${prefix}${menu.backend_name.replace(prefix_to_delete, "")}`,
          categories: menu.categories.map((category) => `${prefix}${category.replace(prefix_to_delete, "")}`),
        })),
        categories: categories_to_keep.map((category) => ({
          ...category,
          backend_name: `${prefix}${category.backend_name.replace(prefix_to_delete, "")}`,
          products: category.products.map((product) => `${prefix}${product.replace(prefix_to_delete, "")}`),
        })),
        products: products_to_keep.map((product) => ({
          ...product,
          backend_name: `${prefix}${product.backend_name.replace(prefix_to_delete, "")}`,
          modifier_groups: product.modifier_groups.map(
            (modifier_group) => `${prefix}${modifier_group.replace(prefix_to_delete, "")}`
          ),
          modifiers: product.modifiers.map((modifier) => `${prefix}${modifier.replace(prefix_to_delete, "")}`),
        })),
        modifier_groups: modifier_groups_to_keep.map((modifier_group) => ({
          ...modifier_group,
          backend_name: `${prefix}${modifier_group.backend_name.replace(prefix_to_delete, "")}`,
          modifiers: modifier_group.modifiers.map((modifier) => `${prefix}${modifier.replace(prefix_to_delete, "")}`),
        })),
        modifiers: modifiers_to_keep.map((modifier) => ({
          ...modifier,
          backend_name: `${prefix}${modifier.backend_name.replace(prefix_to_delete, "")}`,
        })),
      };

      spinner.classList.remove("spinner");
      appContainer.classList.remove("app-when-spinning");

      let jsonOutputDiv = document.getElementById("json-output");
      jsonOutputDiv.innerText = "";
      jsonOutputDiv.innerText = JSON.stringify(output, null, 2);

      // Show the JSON container
      document.getElementById("json-container").style.display = "block";
      // Hide the error message
      document.getElementById("error").innerHTML = "";
    })
    .catch((error) => {
      resultDiv.innerHTML = `<p>Error: ${error}</p>`;
      // Hide the JSON container if an error occurs
      document.getElementById("json-container").style.display = "none";
      spinner.classList.remove("spinner");
      appContainer.classList.remove("app-when-spinning");
    });
});

function downloadMenu(filename, text) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

document.getElementById("copy-button").addEventListener("click", function () {
  const jsonText = document.getElementById("json-output").innerText;
  const tempTextarea = document.createElement("textarea");

  tempTextarea.value = jsonText;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();

  document.execCommand("copy");

  document.body.removeChild(tempTextarea);

  const message = document.createElement("div");
  message.id = "copy-message";
  message.textContent = "Menu copied to clipboard";

  document.body.appendChild(message);

  // After 3 seconds, remove the message
  setTimeout(function () {
    message.parentNode.removeChild(message);
  }, 2000);
});

document.getElementById("download-button").addEventListener("click", function () {
  const jsonText = document.getElementById("json-output").innerText;
  const filename = document.getElementById("headoffice-id").value + ".json";
  downloadMenu(filename, jsonText);

  // Update the download button text
  document.getElementById("download-button").textContent = "Menu Downloaded";
  // Disable the download button after clicking
  document.getElementById("download-button").disabled = true;
});

function downloadMenu(filename, text) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


const fetchUrl = "https://www.mobi2go.com/api/1/headoffice/XXXX/menu?export";
const prefix_to_delete = "";

let selectedMenu = null;

document.getElementById("fetch-button").addEventListener("click", () => {
  let headofficeId = document.getElementById("headoffice-id").value;
  let menuListDiv = document.getElementById("menu-list");
  let errorDiv = document.getElementById("error");
  menuListDiv.innerHTML = "";
  errorDiv.innerHTML = "";

  fetch(fetchUrl.replace("XXXX", headofficeId))
    .then((res) => {
      if (!res.ok) throw new Error(`API Request failed with status ${res.status}`);
      return res.json();
    })
    .then((content) => {
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
      });
    })
    .catch((error) => {
      errorDiv.innerHTML = `<p>Error: ${error}</p>`;
    });
});

document.getElementById("submit-button").addEventListener("click", () => {
  let headofficeId = document.getElementById("headoffice-id").value;
  let resultDiv = document.getElementById("result");
  let prefix = document.getElementById("prefix").value;
  let prefix_to_delete = document.getElementById("prefix-to-delete").value;
  resultDiv.innerHTML = "";

  fetch(fetchUrl.replace("XXXX", headofficeId))
    .then((res) => {
      if (!res.ok) throw new Error(`API Request failed with status ${res.status}`);
      return res.json();
    })
    .then((content) => {
      const menus_to_copy = [selectedMenu];
      // rest of the code as before

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
      foundList.innerHTML += `<li>modifier_groups: ${content.modifier_groups.length}</li>`;
      foundList.innerHTML += `<li>modifiers: ${content.modifiers.length}</li>`;

      // Create the Extracted list
      let extractedList = document.createElement("ul");
      extractedList.innerHTML += "<li><strong>Extracted</strong></li>";
      extractedList.innerHTML += `<li>menus: ${menus_to_keep.length}</li>`;
      extractedList.innerHTML += `<li>categories: ${category_names_to_keep.length}</li>`;
      extractedList.innerHTML += `<li>products: ${product_names_to_keep.length}</li>`;
      extractedList.innerHTML += `<li>modifier_groups: ${modifier_group_names_to_keep.length}</li>`;
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

      let jsonOutputDiv = document.getElementById("json-output");
      jsonOutputDiv.innerText = "";
      jsonOutputDiv.innerText = JSON.stringify(output, null, 2);

      // Call the download function with the JSON output
      download(headofficeId + ".json", JSON.stringify(output));
    })
    .catch((error) => {
      resultDiv.innerHTML = `<p>Error: ${error}</p>`;
    });
});

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

document.getElementById("copy-button").addEventListener("click", function () {
  let jsonText = document.getElementById("json-output").innerText;

  // Create a temporary textarea to hold the text to copy
  let tempTextarea = document.createElement("textarea");
  tempTextarea.value = jsonText;

  // Append it to the body
  document.body.appendChild(tempTextarea);

  // Select the text
  tempTextarea.select();

  // Copy the text
  document.execCommand("copy");

  // Remove the textarea
  document.body.removeChild(tempTextarea);

  // Inform the user that the text has been copied
  alert("JSON copied to clipboard");
});

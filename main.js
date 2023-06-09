// Fetch API URL - replace XXXX with the headoffice ID from input
const fetchUrl = "https://www.mobi2go.com/api/1/headoffice/XXXX/menu?export";
const prefix = "[DD]";
const prefix_to_delete = ""; // The prefix to delete

document.getElementById("submit-button").addEventListener("click", () => {
  let headofficeId = document.getElementById("headoffice-id").value;
  let resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ""; // Clear previous results

  fetch(fetchUrl.replace("XXXX", headofficeId))
    .then((res) => res.json())
    .then((content) => {
      // Replace process.argv[3] with the user's input
      const menus_to_copy = [document.getElementById("menu-name").value];

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
      resultDiv.innerHTML += "<p>Found</p>";
      resultDiv.innerHTML += `<p>menus: ${content.menus.length}</p>`;
      resultDiv.innerHTML += `<p>categories: ${content.categories.length}</p>`;
      resultDiv.innerHTML += `<p>products: ${content.products.length}</p>`;
      resultDiv.innerHTML += `<p>modifier_groups: ${content.modifier_groups.length}</p>`;
      resultDiv.innerHTML += `<p>modifiers: ${content.modifiers.length}</p>`;

      resultDiv.innerHTML += "<p>Extracted</p>";
      resultDiv.innerHTML += `<p>menus: ${menus_to_keep.length}</p>`;
      resultDiv.innerHTML += `<p>categories: ${category_names_to_keep.length}</p>`;
      resultDiv.innerHTML += `<p>products: ${product_names_to_keep.length}</p>`;
      resultDiv.innerHTML += `<p>modifier_groups: ${modifier_group_names_to_keep.length}</p>`;
      resultDiv.innerHTML += `<p>modifiers: ${modifier_names_to_keep.length}</p>`;

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

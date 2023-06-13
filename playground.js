const fetchUrl = "https://www.mobi2go.com/api/1/headoffice/XXXX/menu?export";
let appContainer = document.getElementById("app-container");
let selectedMenu = null;

// New function for displaying messages
function displayMessage(msgText, msgId, delay = 2000) {
  const message = document.createElement("div");
  message.id = msgId;
  message.textContent = msgText;
  document.body.appendChild(message);

  // After delay, remove the message
  setTimeout(function () {
    message.parentNode.removeChild(message);
  }, delay);
}

document.getElementById("fetch-button").addEventListener("click", () => {
  let headofficeId = document.getElementById("headoffice-id").value;
  let menuListDiv = document.getElementById("menu-list");
  let spinner = document.getElementById("spinner");

  menuListDiv.innerHTML = "";

  spinner.classList.add("spinner");
  appContainer.classList.add("app-when-spinning");

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
        spinner.classList.remove("spinner");
        appContainer.classList.remove("app-when-spinning");
      });
    })
    .catch((error) => {
      displayMessage(`Error: ${error}`, "fetch-error");
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
      displayMessage(`Error: ${error}`, "submit-error");
      spinner.classList.remove("spinner");
      appContainer.classList.remove("app-when-spinning");
    });
});

document.getElementById("copy-button").addEventListener("click", function () {
  const jsonText = document.getElementById("json-output").innerText;
  const tempTextarea = document.createElement("textarea");

  tempTextarea.value = jsonText;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();

  document.execCommand("copy");

  document.body.removeChild(tempTextarea);

  displayMessage("Menu copied to clipboard", "copy-message");
});

document.getElementById("download-button").addEventListener("click", function () {
  const jsonText = document.getElementById("json-output").innerText;
  const filename = document.getElementById("headoffice-id").value + ".json";
  downloadMenu(filename, jsonText);

  displayMessage("Menu Downloaded", "download-message");
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

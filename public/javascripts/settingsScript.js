const menus = document.querySelectorAll(".menu");
const sideBarbuttons = document.querySelectorAll(".sidebar-link");
const editIcons = document.querySelectorAll(".editIcon");
const editInputs = document.querySelectorAll(".editInput");
const themes = {
  1: {
    "--flashLogo": "rgb(180, 244, 250)",
    "--mainBackground": "#030613",
    "--wordsTxt": "#4fcdb9",
    "--buttonTxt": "#3a6c97",
    "--buttonHover": "#fff",
  },
  2: {
    "--flashLogo": "#ffffff",
    "--mainBackground": "#000000",
    "--wordsTxt": "#d0d0d0",
    "--buttonTxt": "#ffffff",
    "--buttonHover": "#737373",
  },
  3: {
    "--flashLogo": "#d1ffcd",
    "--mainBackground": "#000000",
    "--wordsTxt": "#15ff00",
    "--buttonTxt": "#006500",
    "--buttonHover": "#d1ffcd",
  },
  4: {
    "--flashLogo": "#ffffff",
    "--mainBackground": "#0e0e0e",
    "--wordsTxt": "#db9730",
    "--buttonTxt": "#555555",
    "--buttonHover": "#c6c6c6",
  },
  5: {
    "--flashLogo": "#444444",
    "--mainBackground": "#ffffff",
    "--wordsTxt": "#444444",
    "--buttonTxt": "#898787",
    "--buttonHover": "#444444",
  },
  6: {
    "--flashLogo": "#ffa7a7",
    "--mainBackground": "#240000",
    "--wordsTxt": "#ea514b",
    "--buttonTxt": "#f36f6f",
    "--buttonHover": "#ffffff",
  },
};

let oldVals = [];
for (let i = 0; i < editInputs.length; i++) {
  oldVals.push(editInputs[i].value);
}
const edit =
  "M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z";
const check = "M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z";

for (let i = 0; i < editIcons.length; i++) {
  editIcons[i].onclick = function () {
    if (editIcons[i].firstElementChild.getAttribute("d") == edit) {
      for (let j = 0; j < editIcons.length; j++) {
        if (editInputs[j].value == "") {
          editInputs[j].value = oldVals[j];
        }
        editInputs[j].disabled = true;
        editIcons[j].firstElementChild.setAttribute("d", edit);
      }
      editIcons[i].firstElementChild.setAttribute("d", check);
      editInputs[i].disabled = false;
      editInputs[i].readOnly = false;
      editInputs[i].value = "";
      editInputs[i].focus();
    } else if (editIcons[i].firstElementChild.getAttribute("d") == check) {
      if (editInputs[i].value == "") {
        editInputs[i].value = oldVals[i];
      }
      editIcons[i].firstElementChild.setAttribute("d", edit);
      editInputs[i].disabled = true;
      editInputs[i].readOnly = true;
    }
  };
}

window.addEventListener("click", (event) => {
  const target = event.target;
  if (target.nodeName === "svg" || target.nodeName === "path") {
  } else {
    for (let i = 0; i < editIcons.length; i++) {
      if (editInputs[i].value == "") {
        editInputs[i].value = oldVals[i];
      }
      editIcons[i].firstElementChild.setAttribute("d", edit);
    }
  }
});

// console.log(user)
if (user.userName) {
  menus[1].style.display = "none";
  sideBarbuttons[0].onclick = () => {
    menus[1].style.display = "none";
    sideBarbuttons[1].classList.remove("active");
    sideBarbuttons[0].classList.add("active");
    menus[0].style.display = "initial";
  };
  sideBarbuttons[1].onclick = () => {
    menus[0].style.display = "none";
    sideBarbuttons[0].classList.remove("active");
    sideBarbuttons[1].classList.add("active");
    menus[1].style.display = "initial";
  };
}

function showMiniAlert(message) {
  const alertBox = document.getElementById("miniAlert");
  const alertMessage = document.getElementById("alertMessage");

  // Set the message and show the alert
  alertMessage.textContent = message;
  alertBox.style.display = "block";

  // Automatically hide after 3 seconds
  setTimeout(() => {
    alertBox.classList.add("fadeout");
    setTimeout(() => {
      alertBox.style.display = "none";
      alertBox.classList.remove("fadeout"); // Remove the fadeout for future alerts
    }, 1000); // This matches the fadeOut animation time
  }, 1000); // Time before fading starts
}
async function getdata() {
  try {
    const response = await fetch("/api");
    user = await response.json();
  } catch (error) {
    console.error("Error fetching user info", error);
  }
}
if (user.userName) {
  document.getElementById("saveInfo").onclick = async function () {
    getdata();
    let originalInfo = [
      user.name,
      user.userName,
      user.userEmail,
      user.password,
    ];
    // Get input values
    const name = document.getElementById("name").value.trim();
    const userName = user.userName;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    // Validation flags
    let valid = true;
    let errorMessage = "";

    // Validate Name
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name || !nameRegex.test(name)) {
      valid = false;
      errorMessage +=
        "<p>Invalid name. Only letters and spaces are allowed.</p>";
    }

    // Validate Username
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!userName || !usernameRegex.test(userName)) {
      valid = false;
      errorMessage +=
        "<p>Invalid username. Only letters, numbers, and underscores are allowed.</p>";
    }

    // Validate Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      valid = false;
      errorMessage += "<p>Invalid email address.</p>";
    }

    // Validate Password
    if (!password || password.length < 6) {
      valid = false;
      errorMessage += "<p>Password must be at least 6 characters long.</p>";
    }

    // Display errors or proceed with saving
    const errorMessagesDiv = document.getElementById("errorMessages");
    if (valid) {
      errorMessagesDiv.innerHTML = ""; // Clear any previous error messages
      // Proceed with saving user info (e.g., send data to server or save locally)
      const newUserInfo = {
        name,
        userName,
        email,
        password,
      };
      const newInfo = [name, userName, email, password];
      // Save user info logic goes here
      const equal = originalInfo.every(
        (value, index) => value === newInfo[index]
      );
      if (equal) {
        showMiniAlert("Nothing to save!");
        return;
      }
      try {
        await fetch("/saveInfo", {
          method: "POST", // or 'PUT' depending on your API
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUserInfo),
        });
        showMiniAlert("Info Saved Successfully!");
      } catch (error) {
        console.error("Error sending modified data", error);
      }
    } else {
      errorMessagesDiv.innerHTML = errorMessage;
    }
  };
}
document.getElementById("save").onclick = function () {
  // Get the values of the preferences
  const fontSize = Number(document.getElementById("fontSize").value);
  const fontFamily = Number(document.getElementById("fontFamily").value);
  const theme = Number(document.getElementById("theme").value);
  const tabRestart = document.getElementById("tabRestart").checked;
  const proMode = document.getElementById("proMode").checked;
  const keyHitSound = document.getElementById("keyHitSound").checked;

  // Save preferences to local storage
  let preference = JSON.parse(localStorage.getItem("preferences"));
  // preferences = JSON.parse(preferenceWords)
  let preferenceWords = preference.customWords;
  let preferCustomWords = preference.preferCustomWords;
  let preferTime = preference.preferTime;

  const preferences = {
    fontFamily,
    fontSize,
    theme,
    tabRestart,
    proMode,
    keyHitSound,
    preferCustomWords,
    customWords: preferenceWords,
    preferTime,
  };
  if (
    preference.fontSize === preferences.fontSize &&
    preference.fontFamily === preferences.fontFamily &&
    preference.theme === preferences.theme &&
    preference.tabRestart === preferences.tabRestart &&
    preference.proMode === preferences.proMode &&
    preference.keyHitSound === preferences.keyHitSound
  ) {
    showMiniAlert("Nothing to change");
  } else {
    localStorage.setItem("preferences", JSON.stringify(preferences));
    showMiniAlert("Preferences updated!");
  }

  const savedPreferences = localStorage.getItem("preferences");
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);

    // Apply saved preferences
    document.getElementById("fontSize").value = preferences.fontSize;
    document.getElementById("fontFamily").value = preferences.fontFamily;
    document.getElementById("theme").value = preferences.theme;
    document.getElementById("tabRestart").checked = preferences.tabRestart;
    document.getElementById("proMode").checked = preferences.proMode;
    document.getElementById("keyHitSound").checked = preferences.keyHitSound;
    const root = document.documentElement;
    let theme = parseInt(preferences.theme);
    let selectedTheme = themes[theme];
    for (const [property, value] of Object.entries(selectedTheme)) {
      root.style.setProperty(property, value);
    }
  }
};

// Get preferences from local storage

const savedPreferences = localStorage.getItem("preferences");
if (savedPreferences) {
  const preferences = JSON.parse(savedPreferences);

  // Apply saved preferences
  document.getElementById("fontSize").value = preferences.fontSize;
  document.getElementById("fontFamily").value = preferences.fontFamily;
  document.getElementById("theme").value = preferences.theme;
  document.getElementById("tabRestart").checked = preferences.tabRestart;
  document.getElementById("proMode").checked = preferences.proMode;
  document.getElementById("keyHitSound").checked = preferences.keyHitSound;
  const root = document.documentElement;
  let theme = parseInt(preferences.theme);
  let selectedTheme = themes[theme];
  for (const [property, value] of Object.entries(selectedTheme)) {
    root.style.setProperty(property, value);
  }
}
//delete account
// Get modal elements
if (user.userName) {
  const modal = document.getElementById("deleteAccountModal");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const closeBtn = document.getElementsByClassName("close")[0];

  // When the user clicks the delete button, open the modal
  deleteAccountBtn.onclick = function () {
    modal.style.display = "block";
  };

  // When the user clicks on the close button (x), close the modal
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

// Handle form submission
if (user.userName) {
  document.getElementById("confirmDeletionForm").onsubmit = async function (
    event
  ) {
    event.preventDefault(); // Prevent form submission

    const password = this.password.value; // Get password input
    const response = await fetch("/delAcc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }), // Send password as JSON
    });

    if (response.ok) {
      // Password matched; redirect to logout
      window.location.href = "/logout";
    } else {
      // Display error message
      const errorMessage = await response.text(); // Get error message from response
      document.getElementById("error-message").innerText = errorMessage;
      document.getElementById("error-message").style.display = "block"; // Show error message
    }
  };
}

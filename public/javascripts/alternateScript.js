let currentUser = undefined;
let testEnded = false;
let test = undefined;
let handleKeyDown;
let timer;

const reset = document.getElementById("reset");
const input = document.querySelector("#userTxt");
const transparentBox = document.querySelector("#transparentBox");
let time = 15;
let timeToStartWith = time;
let timeTaken = 0;
let started = false;
let audio1 = new Audio("Assets/keyHit.mp3");
let audio2 = new Audio("Assets/keyError.mp3");
// specific
let correctChars = 0;
let incorrectChars = 0;
let correctWords = 0;
let incorrectWords = 0;
let totalWords = 0;
// specific

const sourceText = document.querySelector("#sourceTxt");
const themes = {
  1: {
    "--flashLogo": "rgb(180, 244, 250)",
    "--mainBackground": "#030613",
    "--wordsTxt": "#4fcdb9",
    "--buttonTxt": "#3a6c97",
    "--buttonHover": "#fff",
    "--profileCard": "white",
  },
  2: {
    "--flashLogo": "#ffffff",
    "--mainBackground": "#000000",
    "--wordsTxt": "#d0d0d0",
    "--buttonTxt": "#ffffff",
    "--buttonHover": "#737373",
    "--profileCard": "white",
  },
  3: {
    "--flashLogo": "#d1ffcd",
    "--mainBackground": "#000000",
    "--wordsTxt": "#15ff00",
    "--buttonTxt": "#006500",
    "--buttonHover": "#d1ffcd",
    "--profileCard": "white",
  },
  4: {
    "--flashLogo": "#ffffff",
    "--mainBackground": "#0e0e0e",
    "--wordsTxt": "#db9730",
    "--buttonTxt": "#555555",
    "--buttonHover": "#c6c6c6",
    "--profileCard": "white",
  },
  5: {
    "--flashLogo": "#444444",
    "--mainBackground": "#ffffff",
    "--wordsTxt": "#444444",
    "--buttonTxt": "#898787",
    "--buttonHover": "#444444",
    "--profileCard": "white",
  },
  6: {
    "--flashLogo": "#ffa7a7",
    "--mainBackground": "#240000",
    "--wordsTxt": "#ea514b",
    "--buttonTxt": "#f36f6f",
    "--buttonHover": "#ffffff",
    "--profileCard": "white",
  },
};
const fontFamilies = [
  "Roboto", // fontFamily == "1"
  "Charm", // fontFamily == "2"
  "Cinzel", // fontFamily == "3"
  "Spicy Rice", // fontFamily == "4"
  "Cormorant Upright", // fontFamily == "5"
  "Amita", // fontFamily == "6"
  "Special Elite", // fontFamily == "7"
  "Cutive Mono", // fontFamily == "8"
];
const fontSizes = [
  "1.5rem", // fontSize == "1"
  "2rem", // fontSize == "2"
  "3rem", // fontSize == "3"
];

const defaultPreferences = {
  fontFamily: 1,
  fontSize: 2,
  theme: 1,
  tabRestart: false,
  proMode: false,
  keyHitSound: false,
  preferCustomWords: false,
  customWords: [],
  preferTime: 15,
};

async function fetchUserInfo() {
  try {
    const response = await fetch("/api");
    currentUser = await response.json();
    main();
  } catch (error) {
    console.error("Error fetching user info", error);
  }
}

function main() {
  let isActive = false;
  const x = document.getElementById("logOut");
  if (x) {
    x.addEventListener("click", () => {
      localStorage.clear();
    });
  }
  let preferences =
    JSON.parse(localStorage.getItem("preferences")) || defaultPreferences;
  if (!localStorage.getItem("preferences")) {
    localStorage.setItem("preferences", JSON.stringify(defaultPreferences));
  }
  time = preferences.preferTime;
  let fontSize = preferences.fontSize;
  let fontFamily = preferences.fontFamily;
  let theme = parseInt(preferences.theme);
  preferences.preferCustomWords = preferences.preferCustomWords;
  sourceText.style.fontFamily = fontFamilies[fontFamily - 1];
  sourceText.style.fontSize = fontSizes[fontSize - 1];
  const selectedTheme = themes[theme];
  const root = document.documentElement;
  for (const [property, value] of Object.entries(selectedTheme)) {
    root.style.setProperty(property, value);
  }
  const Allowed =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZBackspace' ";

  let words =
    "about above add after again air all almost along also always an and animal another answer any are around as ask at away back be because been before began begin being below between big book both boy but by call came can car carry change children city close come could country cut day did different do does don't down each earth eat end enough even every example eye face family far father feet few find first follow food for form found four from get girl give go good got great group grow had hand hard has have he head hear help her here high him his home house how idea if important in Indian into is it its it's just keep kind know land large last later learn leave left let letter life light like line list little live long look made make man many may me mean men might mile miss more most mother mountain move much must my name near need never new next night no not now number of off often oil old on once one only open or other our out over own page paper part people picture place plant play point put question quick quickly quite read really right river run said same saw say school sea second see seem sentence set she should show side small so some something sometimes song soon sound spell start state still stop story study such take talk tell than that the their them then there these they thing think this those thought three through time to together too took tree try turn two under until up us use very walk want was watch water way we well went were what when where which while white who why will with without word work world would write year you young your".split(
      " "
    );

  let userWords = [];

  // Function to shuffle given words
  function shuffle(wordss) {
    wordss.sort(() => Math.random() - 0.5);
    return wordss;
  }

  // When user clicks on custom words button
  const customWordsBtn = document.querySelector("#customWordsBtn");
  if (preferences.preferCustomWords) {
    customWordsBtn.textContent = "Random Words";
    isActive = true;
  } else {
    customWordsBtn.textContent = "Custom Words";
    isActive = false;
  }

  const customWordsBox = document.querySelector("#customWordsBox");
  const wordsOkBtn = document.querySelector("#TextBtn");
  const customTextBox = document.querySelector("#customWords");
  const customX_Btn = document.querySelector("#customX_Btn");
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  const changeLayoutBtn = document.getElementById("changeLayoutBtn");

  customWordsBtn.onclick = function () {
    if (!started) {
      isActive = !isActive;
      if (isActive) {
        customWordsBtn.textContent = "Random Words";
        customX_Btn.onclick = function () {
          customWordsBox.classList.add("animation2");
          setTimeout(() => {
            transparentBox.style.display = "none";
          }, 300);
          input.focus();
          customWordsBtn.textContent = "Custom Words";
          isActive = !isActive;
        };
        customWordsBox.classList.add("animation1");
        customWordsBox.classList.remove("animation2");
        transparentBox.style.display = "initial";
        customWordsBox.style.display = "flex";
        customTextBox.focus();
        if (preferences.customWords.length) {
          customTextBox.textContent = preferences.customWords.join(" ");
        }
        wordsOkBtn.onclick = function () {
          customTextBox.value = customTextBox.value.trim();
          customTextBox.value = customTextBox.value.replace(/\s+/g, " ");
          const validInput = /^[a-zA-Z\s]+$/;
          userWords = customTextBox.value.split(" ");
          if (!validInput.test(customTextBox.value)) {
            alert("Please enter only alphabets separated by a single space");
            customTextBox.focus();
          } else if (userWords.length <= 1) {
            alert("Please enter atleast 2 words");
          } else {
            customWordsBox.classList.add("animation2");
            setTimeout(() => {
              transparentBox.style.display = "none";
            }, 300);
            input.focus();
            let previousPreferences = JSON.parse(
              localStorage.getItem("preferences")
            );
            previousPreferences.customWords = userWords;
            previousPreferences.preferCustomWords = true;
            previousPreferences = JSON.stringify(previousPreferences);
            localStorage.setItem("preferences", previousPreferences);
            keyboardstart(userWords);
          }
        };
      } else {
        customWordsBtn.textContent = "Custom Words";
        let previousPreferences = JSON.parse(
          localStorage.getItem("preferences")
        );
        previousPreferences.preferCustomWords = false;
        previousPreferences = JSON.stringify(previousPreferences);
        localStorage.setItem("preferences", previousPreferences);
        keyboardstart(words);
      }
    }
  };

  // Function to select times with custom time
  const times = document.querySelectorAll(".uncheck");
  const customTime = document.getElementById("chooseTime");
  const timeTxt = document.getElementById("timerTxt");
  const timeOkBtn = document.getElementById("timeOkBtn");
  function selectTime() {
    if (!started) {
      for (let i = 0; i < times.length; i++) {
        times[i].onclick = function () {
          for (let j = 0; j < times.length; j++) {
            times[j].classList.remove("check");
          }
          times[i].classList.toggle("check");
          timeTxt.innerHTML = times[i].value + "s";
          input.focus();
          time = times[i].value;
          timeToStartWith = time;
        };
      }
      timeTxt.innerHTML = time + "s";
      timeOkBtn.onclick = function () {
        if (customTime.value != "") {
          for (let j = 0; j < times.length; j++) {
            times[j].classList.remove("check");
          }
          if (Number(customTime.value) < 15) {
            time = 15;
            customTime.value = 15;
          } else if (Number(customTime.value) > 300) {
            time = 300;
            customTime.value = 300;
          } else {
            time = customTime.value;
          }
          timeToStartWith = time;
          timeTxt.innerHTML = time + "s";
          input.focus();
        }
      };
    }
  }

  function restart() {
    if (!test) {
      test = { timeTaken: timeTaken };

      sendModifiedData();
    }
    input.removeEventListener("keydown", handleKeyDown);
    location.reload();
    input.addEventListener("keydown", handleKeyDown);
  }
  reset.onclick = function () {
    restart();
  };
  sourceText.onclick = function () {
    input.focus();
  };

  // skip word function - not needed
  // writeExtraLetter function - not needed
  // Specific
  let borderColor = themes[preferences.theme]["--wordsTxt"];
  // Specific
  handleKeyDown = function (event) {
    if (event.key == "Tab" && preferences.tabRestart) {
      restart();
    }

    // Specific
    // timercnt functionality
    if (Allowed.includes(event.key)) {
      if (started && preferences.keyHitSound) {
        audio1.currentTime = 0;
        audio1.play();
      }
      if (!started && event.key != " " && event.key != "Backspace") {
        if (preferences.keyHitSound) {
          audio1.currentTime = 0;
          audio1.play();
        }
        started = true;
        timeToStartWith = time;
        const toBeDisabled = document.querySelectorAll(".toBeDisabled");
        toBeDisabled.forEach((button) => {
          button.disabled = true;
        });

        preferences.preferTime = time;
        localStorage.setItem("preferences", JSON.stringify(preferences));

        timer = setInterval(() => {
          input.focus();
          time--;
          timeTaken++;
          timeTxt.innerHTML = time + "s";
          if (time == 0) {
            timeTxt.innerHTML = "Time's Up!";
            input.disabled = true;
            started = false;
            getResult();
          }
        }, 1000);
      }
    } else {
      event.preventDefault();
    }
    // Specific
    let wrongWord = false;

    //calculate scroll
    const scrollPosition = refWords[ind].offsetTop - sourceText.offsetTop;
    sourceText.scrollTop = scrollPosition;
    // Specific
    if (event.key === " " && input.value.trim() === "") {
      event.preventDefault();
    }
    if (event.key === "Backspace" && preferences.proMode) {
      event.preventDefault();
    }
    const typed = input.value.trim();
    if (event.key === " " && input.value.trim() !== "") {
      totalWords++;
      refWords[ind].style.borderBottom = "transparent";
      refWords[ind + 1].style.borderBottom = `.15rem solid ${borderColor}`;
      if (refWords[ind].innerHTML === typed) {
        correctChars += typed.length + 1;
        correctWords += typed.length + 1;
        refWords[ind].style.color = "var(--flashLogo)";
      } else {
        let n = Math.min(typed.length, refWords[ind].innerHTML.length);
        for (let i = 0; i < n; i++) {
          if (refWords[ind].innerHTML[i] === typed[i]) {
            correctChars++;
          } else {
            incorrectChars++;
          }
        }

        if (typed.length > refWords[ind].innerHTML.length) {
          incorrectChars += typed.length - refWords[ind].innerHTML.length;
        }
        refWords[ind].style.color = "red";
        incorrectWords++;

        if (preferences.keyHitSound) {
          audio2.currentTime = 0;
          audio2.play();
        }
      }

      if (typed.length !== refWords[ind].innerHTML.length) incorrectChars++;
      input.value = "";
      ind++;
    }
  };
  // Specific

  // Specific
  // Function to update the words and check correct, incorrect words and manage UI
  function keyboardstart(displayedWords) {
    displayedWords = shuffle(displayedWords);
    let copywords = [...displayedWords];
    preferences = JSON.parse(localStorage.getItem("preferences"));
    if (preferences.preferCustomWords) {
      let preferenceWords = localStorage.getItem("preferences");
      preferenceWords = JSON.parse(preferenceWords);
      preferenceWords = preferenceWords.customWords;
      copywords = [...preferenceWords];
    }
    let wordsLen = copywords.length;
    sourceText.textContent = "";
    let randomIndex = Math.floor(Math.random() * wordsLen);
    let randomindex2 = randomIndex;
    while (copywords.length < 300) {
      while (randomindex2 == randomIndex) {
        randomIndex = Math.floor(Math.random() * wordsLen);
      }
      randomindex2 = randomIndex;
      copywords.push(copywords[randomIndex]);
    }
    for (let i = 0; i < copywords.length; i++) {
      let currentWord = document.createElement("span");
      currentWord.innerHTML = copywords[i];
      currentWord.classList.add("word");
      sourceText.appendChild(currentWord);
    }
    refWords = document.getElementsByClassName("word");
    ind = 0;
    refWords[ind].style.borderBottom = `.15rem solid ${borderColor}`;
    input.addEventListener("keydown", handleKeyDown);

    // sourceText.textContent = ""
  }
  // Specific

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    // Function to get the ordinal suffix
    function getOrdinalSuffix(day) {
      if (day > 3 && day < 21) return "th"; // Handle teens (11th, 12th, 13th, ...)
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }

    const dayWithSuffix = day + getOrdinalSuffix(day);

    return `${dayWithSuffix} ${month} ${year}`;
  }
  // Function to calculate and display result
  function getResult() {
    clearInterval(timer);
    const resultDiv = document.querySelector("#resultPage");
    const calculations = document.querySelectorAll(".calculations");
    const resultOkBtn = document.getElementById("resultOkBtn");
    transparentBox.style.display = "initial";
    resultDiv.style.display = "flex";
    resultDiv.classList.add("animation1");
    // Specific
    const WPM = Math.round(correctWords / 5 / (timeTaken / 60));
    let accuracy = (correctChars / (correctChars + incorrectChars)) * 100;
    if (
      Number.isNaN(accuracy) ||
      !Number.isFinite(accuracy) ||
      accuracy < 0 ||
      accuracy > 100
    ) {
      accuracy = 0; // Fallback value
    }
    // Specific

    calculations[0].innerHTML = WPM;
    calculations[1].innerHTML = accuracy.toFixed(2) + "%";
    calculations[2].innerHTML = totalWords;
    calculations[3].innerHTML = correctWords;
    calculations[4].innerHTML = incorrectWords;
    calculations[5].innerHTML = timeTaken + "s";
    testEnded = true;
    test = {
      wpm: WPM,
      accuracy: accuracy,
      timeTaken: timeTaken,
      date: formatDate(Date.now()),
    };

    sendModifiedData();
    setTimeout(() => {
      document.getElementById("resultOkBtn").focus();
    }, 1000);

    resultOkBtn.onclick = function () {
      resultDiv.classList.add("animation2");
      setTimeout(() => {
        resultDiv.classList.remove("animation2");
        resultDiv.classList.remove("animation1");
        resultDiv.style.display = "none";
        transparentBox.style.display = "none";
      }, 300);
      restart();
    };
  }
  async function sendModifiedData() {
    if (!currentUser) {
      console.error("No user data to send.");
      return;
    }
    const toReturn = {
      test: test,
      currentUser: currentUser,
      testEnded: testEnded,
    };

    // Modify the data as needed
    try {
      await fetch("/api", {
        method: "POST", // or 'PUT' depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toReturn),
      });
    } catch (error) {
      console.error("Error sending modified data", error);
    }
  }

  // Calling functions
  input.focus();
  selectTime();
  keyboardstart(words);
}

// Fetch user info and then call the main function
fetchUserInfo();

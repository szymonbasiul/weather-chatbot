const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeBtn = document.getElementById("theme-btn");

const savedMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];

savedMessages.forEach((item) => {
  addMessage(item.message, item.sender, false);
});

if (savedMessages.length === 0) {
  addMessage(
    "Cześć! Napisz mi, jaka jest pogoda, np. „Jest 7 stopni i pada deszcz”.",
    "bot-message"
  );
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.textContent = "☀️ Light mode";
  } else {
    themeBtn.textContent = "🌙 Dark mode";
  }
});

function sendMessage() {
  const text = userInput.value.trim();

  if (text === "") {
    return;
  }

  addMessage(text, "user-message");
  userInput.value = "";

  showTyping();

  setTimeout(() => {
    removeTyping();
    const response = botResponse(text);
    addMessage(response, "bot-message");
  }, 900);
}

function addMessage(message, sender, save = true) {
  const div = document.createElement("div");
  div.classList.add(sender);
  div.textContent = message;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) {
    saveMessage(message, sender);
  }
}

function saveMessage(message, sender) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

  history.push({
    message: message,
    sender: sender
  });

  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function showTyping() {
  const typing = document.createElement("div");
  typing.classList.add("bot-message", "typing");
  typing.id = "typing";
  typing.textContent = "Bot pisze...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");

  if (typing) {
    typing.remove();
  }
}

function botResponse(userText) {
  const text = userText.toLowerCase();
  const temperature = findTemperature(text);

  let outfit = "";
  let accessories = "";
  let protection = "";
  let style = "";

  if (temperature !== null) {
    if (temperature <= 0) {
      outfit = "Załóż bardzo ciepłą kurtkę zimową, sweter, długie spodnie i ocieplane buty.";
    } else if (temperature <= 10) {
      outfit = "Załóż ciepłą kurtkę, bluzę lub sweter oraz pełne buty.";
    } else if (temperature <= 18) {
      outfit = "Wybierz lekką kurtkę, longsleeve lub bluzę.";
    } else if (temperature <= 25) {
      outfit = "Wystarczy koszulka, lekkie spodnie lub sukienka.";
    } else {
      outfit = "Ubierz się lekko: koszulka, krótkie spodenki, przewiewne buty.";
    }
  } else {
    outfit = "Nie widzę konkretnej temperatury, więc wybierz ubranie warstwowe.";
  }

  if (text.includes("deszcz") || text.includes("pada") || text.includes("ulewa")) {
    protection = "Zabierz parasol albo kurtkę przeciwdeszczową.";
    accessories = "Najlepiej załóż wodoodporne buty.";
  } else if (text.includes("śnieg")) {
    protection = "Załóż czapkę, rękawiczki i buty z dobrą podeszwą.";
    accessories = "Przyda się szalik oraz ciepłe skarpety.";
  } else if (text.includes("wiatr") || text.includes("wietrznie")) {
    protection = "Wybierz kurtkę przeciwwiatrową.";
    accessories = "Unikaj luźnych dodatków, które może porwać wiatr.";
  } else if (text.includes("słońce") || text.includes("upał") || text.includes("gorąco")) {
    protection = "Pamiętaj o okularach przeciwsłonecznych i kremie z filtrem.";
    accessories = "Zabierz wodę.";
  } else {
    protection = "Sprawdź, czy nie będzie opadów przed wyjściem.";
    accessories = "Dobrym wyborem będzie wygodna torba lub plecak.";
  }

  if (text.includes("elegancko") || text.includes("formalnie")) {
    style = "Styl: elegancki — płaszcz, koszula lub schludne buty.";
  } else if (text.includes("sportowo")) {
    style = "Styl: sportowy — wygodna bluza, sneakersy i lekka kurtka.";
  } else {
    style = "Styl: casual — wygodnie, praktycznie i nowocześnie.";
  }

  return `${outfit} ${protection} ${accessories} ${style}`;
}

function findTemperature(text) {
  const match = text.match(/-?\d+/);

  if (match) {
    return Number(match[0]);
  }

  return null;
}
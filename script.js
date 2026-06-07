const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const cityInput = document.getElementById("city-input");
const sendBtn = document.getElementById("send-btn");
const weatherBtn = document.getElementById("weather-btn");
const themeBtn = document.getElementById("theme-btn");

const API_KEY = "c9f60f9628ba48dbb18141948260706";

const MAX_MESSAGE_LENGTH = 200;
const MIN_MESSAGE_LENGTH = 3;
const MAX_CITY_LENGTH = 50;

const savedMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];

savedMessages.forEach((item) => {
  addMessage(item.message, item.sender, false);
});

if (savedMessages.length === 0) {
  addMessage(
    "Cześć! Wpisz pogodę ręcznie albo podaj miasto i kliknij „Sprawdź pogodę”.",
    "bot-message"
  );
}

sendBtn.addEventListener("click", sendMessage);
weatherBtn.addEventListener("click", getWeatherByCity);

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    getWeatherByCity();
  }
});

userInput.addEventListener("input", function () {
  clearInputError(userInput);
});

cityInput.addEventListener("input", function () {
  clearInputError(cityInput);
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

  const validationError = validateUserMessage(text);

  if (validationError) {
    showValidationError(userInput, validationError);
    return;
  }

  addMessage(text, "user-message");
  userInput.value = "";

  showTyping();

  setTimeout(() => {
    removeTyping();

    const response = botResponse(text);
    addMessage(response, "bot-message");
  }, 800);
}

async function getWeatherByCity() {
  const city = cityInput.value.trim();

  const validationError = validateCity(city);

  if (validationError) {
    showValidationError(cityInput, validationError);
    return;
  }

  if (API_KEY === "WKLEJ_TUTAJ_SWÓJ_WEATHERAPI_KEY" || API_KEY.length < 10) {
    addMessage(
      "Brakuje poprawnego klucza API. Wklej swój klucz WeatherAPI w pliku script.js.",
      "error-message"
    );
    return;
  }

  addMessage(`Sprawdź pogodę dla miasta: ${city}`, "user-message");
  cityInput.value = "";

  showTyping();

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no&lang=pl`;

    const response = await fetch(url);
    const data = await response.json();

    removeTyping();

    if (!response.ok || data.error) {
      const message = data.error ? data.error.message : "Nieznany błąd API.";
      addMessage(`Błąd API: ${message}`, "error-message");
      return;
    }

    if (!data.current || !data.location) {
      addMessage("API zwróciło niepełne dane pogodowe.", "error-message");
      return;
    }

    const temperature = Math.round(data.current.temp_c);
    const feelsLike = Math.round(data.current.feelslike_c);
    const condition = data.current.condition.text;
    const wind = Math.round(data.current.wind_kph);
    const humidity = data.current.humidity;

    const recommendation = generateWeatherRecommendation(
      data.location.name,
      temperature,
      feelsLike,
      condition,
      wind,
      humidity
    );

    addMessage(recommendation, "bot-message");
  } catch (error) {
    removeTyping();

    addMessage(
      "Nie udało się połączyć z API pogodowym. Sprawdź internet albo klucz API.",
      "error-message"
    );

    console.error(error);
  }
}

function validateUserMessage(text) {
  if (text === "") {
    return "Wpisz wiadomość przed wysłaniem.";
  }

  if (text.length < MIN_MESSAGE_LENGTH) {
    return "Wiadomość jest za krótka. Wpisz przynajmniej 3 znaki.";
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return "Wiadomość jest za długa. Maksymalnie 200 znaków.";
  }

  if (/^[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9]+$/.test(text)) {
    return "Wiadomość musi zawierać normalny tekst, nie same znaki specjalne.";
  }

  const temperature = findTemperature(text);

  if (temperature !== null && (temperature < -60 || temperature > 60)) {
    return "Podana temperatura wygląda nierealnie. Wpisz wartość od -60 do 60°C.";
  }

  return null;
}

function validateCity(city) {
  if (city === "") {
    return "Wpisz nazwę miasta, np. Warszawa.";
  }

  if (city.length < 2) {
    return "Nazwa miasta jest za krótka.";
  }

  if (city.length > MAX_CITY_LENGTH) {
    return "Nazwa miasta jest za długa.";
  }

  if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/.test(city)) {
    return "Miasto może zawierać tylko litery, spacje i myślnik.";
  }

  return null;
}

function showValidationError(inputElement, message) {
  inputElement.classList.add("input-error");
  addMessage(message, "error-message");
}

function clearInputError(inputElement) {
  inputElement.classList.remove("input-error");
}

function generateWeatherRecommendation(
  city,
  temperature,
  feelsLike,
  condition,
  wind,
  humidity
) {
  let clothes = "";
  let protection = "";
  let accessories = "";
  let style = "";

  if (temperature <= 0) {
    clothes = "Załóż bardzo ciepłą kurtkę zimową, sweter, długie spodnie i ocieplane buty.";
  } else if (temperature <= 10) {
    clothes = "Załóż ciepłą kurtkę, bluzę lub sweter oraz pełne buty.";
  } else if (temperature <= 18) {
    clothes = "Wybierz lekką kurtkę, longsleeve lub bluzę.";
  } else if (temperature <= 25) {
    clothes = "Wystarczy koszulka, lekkie spodnie lub sukienka.";
  } else {
    clothes = "Ubierz się lekko: koszulka, krótkie spodenki i przewiewne buty.";
  }

  const weatherText = condition.toLowerCase();

  if (
    weatherText.includes("rain") ||
    weatherText.includes("deszcz") ||
    weatherText.includes("mżawka") ||
    weatherText.includes("drizzle")
  ) {
    protection = "Zabierz parasol albo kurtkę przeciwdeszczową.";
    accessories = "Najlepiej załóż wodoodporne buty.";
  } else if (
    weatherText.includes("snow") ||
    weatherText.includes("śnieg")
  ) {
    protection = "Załóż czapkę, rękawiczki i buty z dobrą podeszwą.";
    accessories = "Przyda się szalik oraz ciepłe skarpety.";
  } else if (
    weatherText.includes("storm") ||
    weatherText.includes("burza")
  ) {
    protection = "Unikaj długich spacerów i zabierz mocną kurtkę przeciwdeszczową.";
    accessories = "Wybierz zakryte, stabilne buty.";
  } else if (wind >= 30) {
    protection = "Jest wietrznie, więc wybierz kurtkę przeciwwiatrową.";
    accessories = "Unikaj luźnych dodatków, które może porwać wiatr.";
  } else if (
    weatherText.includes("sun") ||
    weatherText.includes("clear") ||
    weatherText.includes("słońce")
  ) {
    protection = "Pamiętaj o okularach przeciwsłonecznych.";
    accessories = "Zabierz wodę.";
  } else {
    protection = "Nie wygląda na to, żeby potrzebny był parasol.";
    accessories = "Dobrym wyborem będzie wygodna torba lub plecak.";
  }

  if (temperature >= 22) {
    style = "Styl: letni casual — lekko, wygodnie i przewiewnie.";
  } else if (temperature <= 5) {
    style = "Styl: zimowy casual — ciepło, warstwowo i praktycznie.";
  } else {
    style = "Styl: casual — wygodnie, praktycznie i nowocześnie.";
  }

  return `📍 Miasto: ${city}
🌡 Temperatura: ${temperature}°C
🤔 Odczuwalna: ${feelsLike}°C
☁️ Pogoda: ${condition}
💨 Wiatr: ${wind} km/h
💧 Wilgotność: ${humidity}%

👕 Strój:
${clothes}

🎒 Dodatki i ochrona:
${protection} ${accessories}

✨ Styl:
${style}`;
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

function findTemperature(text) {
  const match = text.match(/-?\d+/);

  if (match) {
    return Number(match[0]);
  }

  return null;
}
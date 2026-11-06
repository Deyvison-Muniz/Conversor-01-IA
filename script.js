// Mapeia cada moeda para sua bandeira (emoji)
const FLAGS = {
  BRL: "🇧🇷",
  USD: "🇺🇸",
  EUR: "🇪🇺"
};

// Elementos da tela
const amountInput = document.getElementById("amount");
const resultInput = document.getElementById("result");
const currencyFrom = document.getElementById("currencyFrom");
const currencyTo = document.getElementById("currencyTo");
const flagFrom = document.getElementById("flagFrom");
const flagTo = document.getElementById("flagTo");
const swapBtn = document.getElementById("swapBtn");
const rateBadge = document.getElementById("rateBadge");
const updatedAt = document.getElementById("updatedAt");

// Guarda as taxas já buscadas para não ficar chamando a API toda hora
// formato: { "BRL": { USD: 0.19, EUR: 0.17, ... } }
const ratesCache = {};

// Atualiza os emojis de bandeira conforme a moeda selecionada
function updateFlags() {
  flagFrom.textContent = FLAGS[currencyFrom.value];
  flagTo.textContent = FLAGS[currencyTo.value];
}

// Busca as taxas de câmbio de uma moeda base na API Frankfurter (gratuita, sem chave)
async function fetchRates(base) {
  if (ratesCache[base]) {
    return ratesCache[base];
  }

  const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`);

  if (!response.ok) {
    throw new Error("Não foi possível buscar a cotação");
  }

  const data = await response.json();
  ratesCache[base] = data.rates;
  return data.rates;
}

// Faz o cálculo da conversão e atualiza a tela
async function convert() {
  const from = currencyFrom.value;
  const to = currencyTo.value;
  const amount = parseFloat(amountInput.value) || 0;

  // Se a moeda de origem e destino forem iguais, não precisa converter
  if (from === to) {
    resultInput.value = amount.toFixed(2);
    rateBadge.textContent = `1 ${from} = 1 ${to}`;
    rateBadge.classList.remove("error");
    return;
  }

  try {
    rateBadge.textContent = "Atualizando cotação...";
    rateBadge.classList.remove("error");

    const rates = await fetchRates(from);
    const rate = rates[to];

    const converted = amount * rate;
    resultInput.value = converted.toFixed(2);

    rateBadge.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;

    const now = new Date();
    updatedAt.textContent = `Atualizado às ${now.toLocaleTimeString("pt-BR")}`;
  } catch (error) {
    rateBadge.textContent = "Erro ao buscar cotação. Tente novamente.";
    rateBadge.classList.add("error");
    resultInput.value = "";
  }
}

// Troca a moeda de origem com a de destino
function swapCurrencies() {
  const temp = currencyFrom.value;
  currencyFrom.value = currencyTo.value;
  currencyTo.value = temp;

  updateFlags();
  convert();
}

// Eventos: sempre que o usuário mudar algo, recalcula
amountInput.addEventListener("input", convert);
currencyFrom.addEventListener("change", () => {
  updateFlags();
  convert();
});
currencyTo.addEventListener("change", () => {
  updateFlags();
  convert();
});
swapBtn.addEventListener("click", swapCurrencies);

// Estado inicial ao carregar a página
updateFlags();
convert();
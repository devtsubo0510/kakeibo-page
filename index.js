"use strict";

const storageKey = "kakeiboEntries";
const form = document.querySelector("#entry-form");
const dateInput = document.querySelector("#entry-date");
const itemInput = document.querySelector("#entry-item");
const entryList = document.querySelector("#entry-list");
const balanceOutput = document.querySelector("#balance-output");

function isValidEntry(entry) {
  return entry !== null
    && typeof entry === "object"
    && typeof entry.date === "string"
    && typeof entry.item === "string"
    && (entry.type === "expense" || entry.type === "income")
    && Number.isSafeInteger(entry.amount)
    && entry.amount > 0;
}

function loadEntries() {
  try {
    const savedEntries = localStorage.getItem(storageKey);
    if (savedEntries === null) {
      return [];
    }

    const parsedEntries = JSON.parse(savedEntries);
    return Array.isArray(parsedEntries) ? parsedEntries.filter(isValidEntry) : [];
  } catch {
    return [];
  }
}

function saveEntries(nextEntries) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextEntries));
    return true;
  } catch {
    window.alert("データを保存できませんでした。ブラウザーの保存設定を確認してください。");
    return false;
  }
}

function createCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.append(cell);
}

function renderEntries() {
  entryList.replaceChildren();

  if (entries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "登録データはありません";
    row.append(cell);
    entryList.append(row);
  } else {
    for (const entry of entries) {
      const row = document.createElement("tr");
      row.classList.add(entry.type);
      createCell(row, entry.date);
      createCell(row, entry.item);
      createCell(row, entry.type === "income" ? "収入" : "支出");
      createCell(row, `${entry.amount.toLocaleString("ja-JP")}円`);
      entryList.append(row);
    }
  }

  const balance = entries.reduce((total, entry) => {
    return total + (entry.type === "income" ? entry.amount : -entry.amount);
  }, 0);
  balanceOutput.textContent = `${balance.toLocaleString("ja-JP")}円`;
}

let entries = loadEntries();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const item = itemInput.value.trim();
  if (item.length === 0) {
    itemInput.setCustomValidity("品目を入力してください。");
    itemInput.reportValidity();
    return;
  }
  itemInput.setCustomValidity("");

  const formData = new FormData(form);
  const entry = {
    date: formData.get("date"),
    item,
    type: formData.get("type"),
    amount: Number(formData.get("amount"))
  };

  if (!isValidEntry(entry)) {
    return;
  }

  const nextEntries = [...entries, entry];
  if (!saveEntries(nextEntries)) {
    return;
  }

  entries = nextEntries;
  renderEntries();
  form.reset();
  dateInput.value = entry.date;
});

itemInput.addEventListener("input", () => {
  itemInput.setCustomValidity("");
});

renderEntries();
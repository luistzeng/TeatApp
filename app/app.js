const API_BASE = window.CAPTCHA_API_BASE || "http://localhost:4000";

const captchaImage = document.getElementById("captcha-image");
const botCodeInput = document.getElementById("bot-code");
const refreshBtn = document.getElementById("refresh-btn");
const searchBtn = document.getElementById("search-btn");
const caseNumberInput = document.getElementById("case-number");
const messageEl = document.getElementById("message");

let currentCaptchaId = null;

function setMessage(text, kind) {
  messageEl.textContent = text;
  messageEl.className = "message" + (kind ? ` ${kind}` : "");
}

async function loadCaptcha({ clearMessage = true } = {}) {
  captchaImage.innerHTML = '<span class="loading">…</span>';
  botCodeInput.value = "";
  if (clearMessage) setMessage("", null);

  try {
    const res = await fetch(`${API_BASE}/api/captcha`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    currentCaptchaId = data.id;
    captchaImage.innerHTML = data.svg;
  } catch (err) {
    captchaImage.innerHTML = "";
    setMessage("Failed to load verification code. Is the API running?", "error");
    console.error(err);
  }
}

async function handleSearch() {
  const caseNumber = caseNumberInput.value.trim();
  const code = botCodeInput.value.trim();

  if (!caseNumber) {
    setMessage("請輸入案件編號 / Please enter a case number.", "error");
    return;
  }
  if (!currentCaptchaId || !code) {
    setMessage("請輸入驗證碼 / Please enter the verification code.", "error");
    return;
  }

  searchBtn.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/api/captcha/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentCaptchaId, code }),
    });
    const data = await res.json();

    if (data.valid) {
      setMessage(`驗證成功，查詢「${caseNumber}」/ Verified. Searching "${caseNumber}"...`, "ok");
    } else {
      setMessage("驗證碼錯誤，請重新輸入 / Incorrect code, please try again.", "error");
      loadCaptcha({ clearMessage: false });
    }
  } catch (err) {
    setMessage("Verification request failed. Is the API running?", "error");
    console.error(err);
  } finally {
    searchBtn.disabled = false;
  }
}

refreshBtn.addEventListener("click", loadCaptcha);
searchBtn.addEventListener("click", handleSearch);

loadCaptcha();

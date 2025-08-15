// ================== CONFIG ==================
const API_BASE_URL = "https://vitalhu-backend.onrender.com/api";

// ================== UTILS ==================
function getAuthHeaders() {
  const token = localStorage.getItem("vhToken");
  return token
    ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
  const options = {
    method,
    headers: auth ? getAuthHeaders() : { "Content-Type": "application/json" }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}

// ================== AUTH ==================
async function login(email, password) {
  const res = await apiRequest("/auth/login", "POST", { email, password });
  localStorage.setItem("vhToken", res.token);
  localStorage.setItem("vhUser", JSON.stringify(res.user));
  return res.user;
}

async function register(name, email, password) {
  const res = await apiRequest("/auth/register", "POST", { name, email, password });
  localStorage.setItem("vhToken", res.token);
  localStorage.setItem("vhUser", JSON.stringify(res.user));
  return res.user;
}

function logout() {
  localStorage.removeItem("vhToken");
  localStorage.removeItem("vhUser");
  window.location.href = "login.html";
}

// ================== PROFILE ==================
async function getProfile() {
  return apiRequest("/profile", "GET", null, true);
}

async function updateProfile(data) {
  return apiRequest("/profile", "PUT", data, true);
}

// ================== PROGRESS ==================
async function getProgress(period = "week") {
  return apiRequest(`/progress?period=${period}`, "GET", null, true);
}

// ================== EXERCISES ==================
async function searchExercises(query) {
  return apiRequest(`/exercise?search=${encodeURIComponent(query)}`, "GET", null, true);
}

async function getExerciseDetail(id) {
  return apiRequest(`/exercise/${id}`, "GET", null, true);
}

// ================== NUTRITION ==================
async function searchNutrition(query) {
  return apiRequest(`/nutrition?search=${encodeURIComponent(query)}`, "GET", null, true);
}

// ================== POSTURE CHECK ==================
async function sendPostureImage(base64Image) {
  return apiRequest("/posture-check", "POST", { image: base64Image }, true);
}

// ================== NOTIFICATIONS ==================
async function getNotifications() {
  return apiRequest("/notification", "GET", null, true);
}

async function markNotificationRead(id) {
  return apiRequest(`/notification/${id}`, "POST", {}, true);
}

// ================== NAVBAR & LOGIN CONTROL ==================
function setupNavbar() {
  const accountLink = document.getElementById("account-link");
  const user = JSON.parse(localStorage.getItem("vhUser"));
  const token = localStorage.getItem("vhToken");

  if (accountLink) {
    if (token && user) {
      accountLink.textContent = user.name;
      accountLink.href = "profile.html";
    } else {
      accountLink.textContent = "Account";
      accountLink.href = "login.html";
    }
  }
}

function requireLogin() {
  const token = localStorage.getItem("vhToken");
  if (!token) window.location.href = "login.html";
}

function protectAuthPages() {
  const token = localStorage.getItem("vhToken");
  if (token) {
    if (window.location.pathname.includes("login.html") ||
        window.location.pathname.includes("register.html")) {
      window.location.href = "index.html";
    }
  } else {
    if (!window.location.pathname.includes("login.html") &&
        !window.location.pathname.includes("register.html")) {
      window.location.href = "login.html";
    }
  }
}

// ================== PAGE INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  protectAuthPages();

  // ---- Login form submit ----
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-pass").value.trim();
      try {
        await login(email, pass);
        alert("Login Successful!");
        window.location.href = "index.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // ---- Register form submit ----
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const pass = document.getElementById("reg-pass").value.trim();
      try {
        await register(name, email, pass);
        alert("Registration Successful!");
        window.location.href = "index.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }
});

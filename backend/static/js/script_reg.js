
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// Перевірка форми перед відправкою
const registerFormElement = document.getElementById('registerForm');

registerFormElement.addEventListener("submit", function(event) {
  const formIsValid = validateForm(registerFormElement);
  if (!formIsValid) {
    event.preventDefault();  // Запобігає відправці форми, якщо є помилки
  }
});

function validateForm(form) {
  let isValid = true;

  // Перевірка помилок для кожного поля
  const fields = form.querySelectorAll('input');
  
  fields.forEach((field) => {
    if (field.value === "") {
      isValid = false;
      field.classList.add("error");  // Додає клас для помилки
    } else {
      field.classList.remove("error");  // Видаляє клас для правильного поля
    }
  });

  return isValid;
}


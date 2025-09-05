/* ===========================================
    FORMULÁRIOS
=========================================== */

class SmartForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) {
      throw new Error(`Formulário com ID "${formId}" não encontrado.`);
    }
    this.validators = {}; // Inicializa o objeto de validadores
    this.init();
  }

  init() {
    this.form.setAttribute("novalidate", "true");
    this.setupEventListeners();
  }

  addValidator(fieldName, validatorFunction, errorMessage) {
    this.validators[fieldName] = {
      validate: validatorFunction,
      message: errorMessage,
    };
  }

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        this.handleSubmit();
      } else {
        console.log("Formulário inválido.");
      }
    });

    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("blur", () => this.validateField(field));
      field.addEventListener("input", () => this.validateField(field));
      field.addEventListener("change", () => this.validateField(field));
    });

    const clearBtn = this.form.querySelector("#clearBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.handleClear());
    }
  }

  validateForm() {
    let isValid = true;
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      // Aplica a validação em todos os campos
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  }

  validateField(field) {
    const isNativeValid = field.checkValidity();
    const customValidator = this.validators[field.name];
    let customMessage = "";

    // Primeiro, verifica a validação nativa do HTML5
    if (!isNativeValid) {
      customMessage = this.getValidationMessage(field);
    }
    // Em seguida, verifica a validação customizada
    else if (customValidator && !customValidator.validate(field.value, field)) {
      customMessage = customValidator.message;
    }

    if (customMessage) {
      this.showError(field, customMessage);
      return false;
    }

    this.hideError(field);
    return true;
  }

  getValidationMessage(field) {
    const validity = field.validity;
    if (validity.valueMissing) {
      return "Este campo é obrigatório.";
    } else if (validity.typeMismatch) {
      return "Por favor, insira um formato válido.";
    } else if (validity.tooShort) {
      return `Mínimo de ${field.minLength} caracteres.`;
    } else if (validity.tooLong) {
      return `Máximo de ${field.maxLength} caracteres.`;
    } else if (validity.rangeUnderflow) {
      return `Valor mínimo: ${field.min}.`;
    } else if (validity.rangeOverflow) {
      return `Valor máximo: ${field.max}.`;
    }
    return "Por favor, corrija este campo.";
  }

  showError(field, message) {
    const errorElement = document.getElementById(field.id + "-error");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
    field.classList.add("is-invalid");
  }

  hideError(field) {
    const errorElement = document.getElementById(field.id + "-error");
    if (errorElement) {
      errorElement.style.display = "none";
    }
    field.classList.remove("is-invalid");
  }

  handleSubmit() {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Adicionando produto...";

    setTimeout(() => {
      const successMessage = this.form.querySelector("#successMessage");
      if (successMessage) {
        successMessage.style.display = "block";
        setTimeout(() => (successMessage.style.display = "none"), 5000);
      }
      this.form.reset();
      this.form
        .querySelectorAll(".is-invalid")
        .forEach((field) => field.classList.remove("is-invalid"));
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      console.log("Formulário enviado com sucesso!");
    }, 1500);
  }

  handleClear() {
    if (confirm("Tem certeza que deseja limpar todos os campos?")) {
      this.form.reset();
      this.form
        .querySelectorAll(".error-message")
        .forEach((error) => (error.style.display = "none"));
      this.form
        .querySelectorAll(".is-invalid")
        .forEach((field) => field.classList.remove("is-invalid"));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = new SmartForm("registerForm");

  // Validação Customizada do Código do Produto (ex: PROD-12345)
  registerForm.addValidator(
    "productCode",
    (value) => {
      const codeRegex = /^[A-Z]{3,4}-\d{5}$/; // Ex: PROD-12345
      return codeRegex.test(value);
    },
    "O código deve seguir o formato XXXX-DDDDD (ex: PROD-12345)."
  );

  // Validação Customizada da Data de Validade (não pode ser no passado)
  registerForm.addValidator(
    "expirationDate",
    (value) => {
      const today = new Date().toISOString().split("T")[0];
      return value >= today;
    },
    "A data de validade não pode ser anterior à data de hoje."
  );

  // Validação Customizada do Preço (deve ser maior que zero)
  registerForm.addValidator(
    "price",
    (value) => parseFloat(value) > 0,
    "O preço do produto deve ser maior que zero."
  );
});

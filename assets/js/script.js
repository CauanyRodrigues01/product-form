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

  // Inicializa o formulário
  init() {
    this.form.setAttribute("novalidate", "true"); // Desativa a validação padrão do navegador
    this.setupEventListeners();
  }

  // Adiciona um validador personalizado para um campo específico
  addValidator(fieldName, validatorFunction, errorMessage) {
    this.validators[fieldName] = {
      validate: validatorFunction,
      message: errorMessage,
    };
  }

  // Configura os event listeners para o formulário e seus campos
  setupEventListeners() {
    // Listener para o evento de submissão do formulário
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        this.handleSubmit();
      } else {
        console.log("Formulário inválido.");
      }
    });

    // Listeners para validação em tempo real dos campos
    this.form
      .querySelectorAll("input, select, textarea, checkbox")
      .forEach((field) => {
        field.addEventListener("blur", () => this.validateField(field));
        field.addEventListener("input", () => this.validateField(field));
        field.addEventListener("change", () => this.validateField(field));
      });

    // Listener para o botão de limpar formulário
    const clearBtn = this.form.querySelector("#clearBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.handleClear());
    }
  }

  // Valida todo o formulário
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

  // Valida um campo específico
  validateField(field) {
    const isNativeValid = field.checkValidity(); // Verifica se o campo atende às regras do HTML5
    const customValidator = this.validators[field.name];
    let customMessage = "";

    // Primeiro, verifica a validação nativa do HTML5
    if (!isNativeValid) {
      customMessage = this.getValidationMessage(field); // Obtém a mensagem de erro padrão
    }
    // Em seguida, verifica a validação customizada
    else if (customValidator && !customValidator.validate(field.value, field)) {
      customMessage = customValidator.message; // Usa a mensagem de erro personalizada
    }

    // Exibe a mensagem de erro, se houver
    if (customMessage) {
      this.showError(field, customMessage);
      return false;
    }

    // Remove a mensagem de erro se o campo for válido
    this.hideError(field);
    return true;
  }

  // Obtém a mensagem de validação padrão do navegador
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
      return `O valor deve ser no mínimo ${field.min}.`;
    } else if (validity.rangeOverflow) {
      return `O valor deve ser no máximo ${field.max}.`;
    }
    return "Por favor, corrija este campo.";
  }

  // Exibe a mensagem de erro para um campo
  showError(field, message) {
    const errorElement = document.getElementById(field.id + "-error");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", field.id + "-error");
    }
    field.classList.add("is-invalid");
  }

  // Oculta a mensagem de erro para um campo
  hideError(field) {
    const errorElement = document.getElementById(field.id + "-error");
    if (errorElement) {
      field.textContent = "";
      errorElement.style.display = "none";
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
    field.classList.remove("is-invalid");
  }

  // Manipula a submissão do formulário
  handleSubmit() {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Adicionando produto...";

    // Simula um processo de envio
    setTimeout(() => {
      const successMessage = this.form.querySelector("#successMessage");
      if (successMessage) {
        successMessage.style.display = "block";
        setTimeout(() => (successMessage.style.display = "none"), 5000);
      }
      this.form.reset(); // limpa o formulário
      this.form.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      console.log("Formulário enviado com sucesso!");

    }, 1500);
  }

  // Manipula a limpeza do formulário
  handleClear() {

    if (confirm("Tem certeza que deseja limpar todos os campos?")) {
      this.form.reset();
      this.form.querySelectorAll(".error-message").forEach((error) => (error.style.display = "none"));
      this.form.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));
    }
  }

}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = new SmartForm("registerForm");

  // Validação customizada do Código do Produto (ex: PROD-12345)
  registerForm.addValidator(
    "productCode",
    (value) => {
      const codeRegex = /^[A-Z]{3,4}-\d+$/; // Ex: PROD-12345
      return codeRegex.test(value);
    },
    "O código deve começar com 3 ou 4 letras maiúsculas e terminar com números (ex: PROD-123)."
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
    "O preço deve ser um valor maior que zero."
  );

})
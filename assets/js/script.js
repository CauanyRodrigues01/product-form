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
}

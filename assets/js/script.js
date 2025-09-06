/* ===========================================
    FORMULÁRIO
=========================================== */

/* ===========================================
    SMARTFORM - VERSÃO SIMPLIFICADA E OTIMIZADA
=========================================== */

class SmartForm {
  constructor(formId, options = {}) {
    this.form = document.getElementById(formId);
    if (!this.form) {
      throw new Error(`Formulário com ID "${formId}" não encontrado.`);
    }
    this.config = {
      validateOnBlur: true,
      validateOnInput: true,
      showMessages: true,
      ...options,
    };
    this.fieldRules = {};
    this.isSubmitting = false;
    this.init();
  }

  init() {
    this.form.setAttribute("novalidate", "true");
    this.setupEventListeners();
    this.createErrorElements();
  }

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (this.config.validateOnBlur) {
        field.addEventListener("blur", () => this.validateField(field, true));
      }
      if (this.config.validateOnInput) {
        field.addEventListener("input", () => this.validateField(field));
      }
    });
    const clearBtn = this.form.querySelector("#clearBtn, [data-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearForm());
    }
  }

  createErrorElements() {
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (!field.id)
        field.id = `field-${Math.random().toString(36).substring(2, 7)}`;
      const errorId = `${field.id}-error`;
      if (!document.getElementById(errorId)) {
        const errorElement = document.createElement("div");
        errorElement.id = errorId;
        errorElement.className = "error-message";
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
    });
  }
  addFieldRule(fieldName, options = {}) {
    this.fieldRules[fieldName] = {
      cleaner: options.cleaner || null,
      validator: options.validator || null,
      message: options.message || "Campo inválido.",
    };
    return this;
  }

  validateForm() {
    let isValid = true;
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (!this.validateField(field, true)) {
        isValid = false;
      }
    });
    return isValid;
  }

  validateField(field, performClean = false) {
    if (performClean) {
      this.cleanField(field);
    }
    const fieldRule = this.fieldRules[field.name];
    let message = "";
    let isValid = true;

    if (!field.checkValidity()) {
      message = this.getValidationMessage(field);
      isValid = false;
    } else if (fieldRule?.validator && !fieldRule.validator(field.value)) {
      message = fieldRule.message;
      isValid = false;
    }

    if (isValid) {
      this.hideError(field);
    } else {
      this.showError(field, message);
    }
    return isValid;
  }

  cleanField(field) {
    const fieldRule = this.fieldRules[field.name];
    const cleaner = fieldRule?.cleaner || this.getGenericCleaner(field);
    if (cleaner) {
      field.value = cleaner(field.value);
    }
  }

  getGenericCleaner(field) {
    const cleaners = {
      email: (value) => value.toLowerCase().trim().replace(/\s+/g, ""),
      tel: (value) => value.replace(/[^\d\s\-\(\)\+]/g, "").trim(),
      number: (value) => value.replace(/[^\d\.\-]/g, "").trim(),
      url: (value) => value.toLowerCase().trim(),
      text: (value) => value.trim().replace(/\s+/g, " "),
      textarea: (value) => value.trim().replace(/\s+/g, " "),
    };
    return (
      cleaners[field.type] ||
      cleaners[field.tagName.toLowerCase()] ||
      ((value) => value.trim())
    );
  }

  getValidationMessage(field) {
    const validity = field.validity;
    if (validity.valueMissing) return "Este campo é obrigatório.";
    if (validity.typeMismatch) {
      if (field.type === "email") return "Digite um email válido.";
      if (field.type === "url") return "Digite uma URL válida.";
      return "Formato inválido.";
    }
    if (validity.tooShort) return `Mínimo de ${field.minLength} caracteres.`;
    if (validity.tooLong) return `Máximo de ${field.maxLength} caracteres.`;
    if (validity.rangeUnderflow) return `Valor mínimo: ${field.min}.`;
    if (validity.rangeOverflow) return `Valor máximo: ${field.max}.`;
    if (validity.patternMismatch) return "Formato não aceito.";
    return "Campo inválido.";
  }

  showError(field, message) {
    if (!this.config.showMessages) return;
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
  }

  hideError(field) {
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.style.display = "none";
    }
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
  }

  async handleSubmit() {
    if (this.isSubmitting) return;
    if (!this.validateForm()) {
      this.focusFirstError();
      return;
    }
    this.isSubmitting = true;
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }
    try {
      if (this.config.onSubmit) {
        await this.config.onSubmit(this.getFormData());
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      this.showSuccess();
      this.clearForm();
    } catch (error) {
      this.showError(null, `Erro: ${error.message}`);
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  focusFirstError() {
    const firstError = this.form.querySelector(".is-invalid");
    if (firstError) {
      firstError.focus();
    }
  }
  showSuccess() {
    if (!this.config.showMessages) return;
    let successMsg = document.getElementById("form-success");
    if (!successMsg) {
      successMsg = document.createElement("div");
      successMsg.id = "form-success";
      successMsg.className = "success-message";
      this.form.insertBefore(successMsg, this.form.firstChild);
    }
    successMsg.textContent = "Formulário enviado com sucesso!";
    successMsg.style.display = "block";
    setTimeout(() => (successMsg.style.display = "none"), 3000);
  }
  
  clearForm() {
    this.form.reset();
    this.form.querySelectorAll(".error-message").forEach((error) => {
      error.style.display = "none";
    });
    this.form.querySelectorAll(".is-invalid").forEach((field) => {
      field.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
    });
  }

  getFormData() {
    const data = {};
    new FormData(this.form).forEach((value, key) => (data[key] = value));
    return data;
  }
}

// REGRAS DE VALIDAÇÃO E LIMPEZA CUSTOMIZADAS
const FieldRules = {
  // Nome do produto
  productName: {
    cleaner: (value) =>
      value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    validator: (value) => value.length >= 2,
    message: "Nome deve ter pelo menos 2 caracteres.",
  },

  // Código de produto
  productCode: {
    cleaner: (value) => value.toUpperCase().replace(/[^A-Z0-9\-]/g, ""),
    validator: (value) => /^[A-Z]{2,4}-?\d+$/.test(value),
    message: "Formato: ABC-123 ou ABC123.",
  },

  // Preço do produto
  price: {
    cleaner: (value) => value.replace(/[^\d\,\.]/g, "").replace(",", "."),
    validator: (value) => !isNaN(value) && parseFloat(value) > 0,
    message: "Digite um preço válido maior que zero.",
  },

  // Data futura
  futureDate: {
    validator: (value) => {
      if (!value) return false;
      return new Date(value) >= new Date().setHours(0, 0, 0, 0);
    },
    message: "Data deve ser hoje ou futura.",
  }

};

// INICIALIZAÇÃO DO FORMULÁRIO
document.addEventListener("DOMContentLoaded", () => {
  const form = new SmartForm("registerForm", {
    validateOnBlur: true,
    validateOnInput: true,
    showMessages: true,
    onSubmit: async (data) => {
      console.log("Dados do formulário:", data);
      // Aqui se faria a requisição real

      // atraso artificial para simular a requisição de rede
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // return fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
    },
  });

  // Adiciona regras customizadas aos campos
  form
    .addFieldRule("productName", FieldRules.productName)
    .addFieldRule("productCode", FieldRules.productCode)
    .addFieldRule("price", FieldRules.price)
    .addFieldRule("expirationDate", FieldRules.futureDate);
});

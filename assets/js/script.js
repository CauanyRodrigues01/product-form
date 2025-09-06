/* ===========================================
    FORMULÁRIO
=========================================== */

class SmartForm {
  constructor(formId, onSubmit, options = {}) {
    // Referência ao formulário
    this.form = document.getElementById(formId);
    if (!this.form) {
      throw new Error(`Formulário com ID "${formId}" não encontrado.`);
    }

    // Validação do onSubmit: verifica se é uma função
    if (typeof onSubmit !== "function") {
      throw new Error("A função onSubmit é obrigatória e deve ser uma função.");
    }

    // Objeto de configurações. Ele define os valores padrão para a validação
    this.config = {
      validateOnBlur: true,
      validateOnInput: true,
      showMessages: true,
      ...options,
      onSubmit: onSubmit,
    };

    this.fieldRules = {};
    this.isSubmitting = false;
    this.init();
  }

  // Inicializa o formulário
  init() {
    this.form.setAttribute("novalidate", "true");
    this.setupEventListeners();
    this.createErrorElements(); // Garante que as mensagens de erro estejam prontas desde o início
  }

  // Configura os event listeners para o formulário e seus campos
  setupEventListeners() {
    // Intercepta o envio do formulário
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Adiciona listeners para validação em blur e input
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (this.config.validateOnBlur) {
        field.addEventListener("blur", () => this.validateField(field, true));
      }
      if (this.config.validateOnInput) {
        field.addEventListener("input", () => this.validateField(field));
      }
    });

    // Botão de limpar formulário
    const clearBtn = this.form.querySelector("#clearBtn, [data-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearForm());
    }
  }

  // Lida com o envio do formulário
  async handleSubmit() {
    // Evita envios múltiplos
    if (this.isSubmitting) return;

    // Valida o formulário antes de enviar
    if (!this.validateForm()) {
      this.focusFirstError();
      return;
    }

    // Inicia o envio
    this.isSubmitting = true;
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }
    // Chama a função de envio fornecida
    try {
      await this.config.onSubmit(this.getFormData());
      this.showSuccess();
      this.clearForm();
    } catch (error) {
      this.showError(null, `Erro: ${error.message}`);
    } finally {
      // Finaliza o estado de envio
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  // Valida todos os campos do formulário
  validateForm() {
    let isValid = true;
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (!this.validateField(field, true)) {
        isValid = false;
      }
    });
    return isValid;
  }

  // Foca no primeiro campo com erro
  focusFirstError() {
    // querySelector vai pegar a primeira ocorrência de .is-invalid
    const firstError = this.form.querySelector(".is-invalid");
    if (firstError) {
      firstError.focus();
    }
  }

  // Valida um campo individualmente e opcionalmente o limpa
  validateField(field, performClean = false) {
    // Limpa o campo se necessário (Por exemplo, no evento input, não é necessário chamar o cleanField)
    if (performClean) {
      this.cleanField(field);
    }
    const fieldRule = this.fieldRules[field.name];
    let message = "";
    let isValid = true;

    // Validação nativa do HTML5
    if (!field.checkValidity()) {
      message = this.getValidationMessage(field);
      isValid = false;
    }
    // Validação customizada
    else if (fieldRule?.validator && !fieldRule.validator(field.value)) {
      message = fieldRule.message;
      isValid = false;
    }

    // Mostra ou esconde a mensagem de erro
    if (isValid) {
      this.hideError(field);
    } else {
      this.showError(field, message);
    }
    return isValid;
  }

  // Limpa o valor do campo com base na regra definida ou na limpeza genérica
  cleanField(field) {
    const fieldRule = this.fieldRules[field.name];
    const cleaner = fieldRule?.cleaner || this.getGenericCleaner(field);
    if (cleaner) {
      field.value = cleaner(field.value);
    }
  }

  // Gera mensagens de erro baseadas na validação nativa do HTML5
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

  // Cria elementos para exibir mensagens de erro
  createErrorElements() {
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      // Se o campo tem um ID, vamos associá-lo à mensagem de erro
      if (!field.id)
        // Gera um ID único se o campo não tiver um
        field.id = `field-${Math.random().toString(36).substring(2, 7)}`;
      // ID único para o elemento de erro
      const errorId = `${field.id}-error`;
      if (!document.getElementById(errorId)) {
        const errorElement = document.createElement("div");
        errorElement.id = errorId;
        errorElement.className = "error-message";
        // Insere o elemento de erro logo após o campo
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
    });
  }

  // Adiciona uma regra de validação e limpeza para um campo específico
  addFieldRule(fieldName, options = {}) {
    this.fieldRules[fieldName] = {
      cleaner: options.cleaner || null,
      validator: options.validator || null,
      message: options.message || "Campo inválido.",
    };
    return this;
  }

  // Retorna uma função de limpeza genérica baseada no tipo ou tag do campo
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
      // Tenta encontrar uma regra de limpeza baseada no type do campo
      cleaners[field.type] ||
      // Se não encontrar, tenta pela tagName (ex.: textarea)
      cleaners[field.tagName.toLowerCase()] ||
      // Limpeza genérica: remove espaços extras
      ((value) => value.trim())
    );
  }

  // Coleta os dados do formulário em um objeto
  getFormData() {
    const data = {};
    new FormData(this.form).forEach((value, key) => (data[key] = value));
    return data;
  }

  // Exibe uma mensagem de sucesso após o envio do formulário
  showSuccess() {
    if (!this.config.showMessages) return; // Impede a exibição de mensagens de erro se a configuração estiver desativada
    let successMsg = document.getElementById("form-success");
    if (!successMsg) {
      successMsg = document.createElement("div");
      successMsg.id = "form-success";
      successMsg.className = "success-message";
      // Insere a mensagem de sucesso no início do formulário
      this.form.insertBefore(successMsg, this.form.firstChild);
    }
    successMsg.textContent = "Formulário enviado com sucesso!";
    successMsg.style.display = "block";
    // Oculta a mensagem após 3 segundos
    setTimeout(() => (successMsg.style.display = "none"), 3000);
  }

  // Esconde a mensagem de erro de um campo
  hideError(field) {
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.style.display = "none";
    }
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
  }

  // Mostra a mensagem de erro de um campo
  showError(field, message) {
    if (!this.config.showMessages) return; // Impede a exibição de mensagens de erro se a configuração estiver desativada
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
  }

  // Limpa o formulário, removendo erros e resetando os campos
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
  },
};

// INICIALIZAÇÃO DO FORMULÁRIO
document.addEventListener("DOMContentLoaded", () => {
  const form = new SmartForm(
    // ID do formulário
    "registerForm",

    // Função de envio
    async (data) => {
      console.log("Dados do formulário:", data);
      // Aqui se faria a requisição real

      // atraso artificial para simular a requisição de rede
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // return fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
    },
    // Opções de configuração
    {
      validateOnBlur: true,
      validateOnInput: true,
      showMessages: true,
    }
  );

  // Adiciona regras customizadas aos campos (regra de validação e limpeza de campos específicos))
  form
    .addFieldRule("productName", FieldRules.productName)
    .addFieldRule("productCode", FieldRules.productCode)
    .addFieldRule("price", FieldRules.price)
    .addFieldRule("expirationDate", FieldRules.futureDate);
});

# 🛒 Formulário de Cadastro de Produtos

Este projeto é um **formulário de cadastro de produtos para um e-commerce**, desenvolvido com o objetivo de demonstrar habilidades em **HTML, CSS e JavaScript**.  
A principal característica do projeto é a **validação de formulário robusta e dinâmica**, que melhora a experiência do usuário.

---

## 🚀 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica do formulário e dos elementos da página.  
- **CSS3**: Estilização moderna e responsiva, utilizando *Design Tokens* (variáveis CSS) para garantir consistência visual e facilitar a manutenção.  
- **JavaScript (ES6)**: Lógica de validação de formulário, feedback visual e gerenciamento de eventos.  

---

## ✨ Principais Funcionalidades

✔ **Validação em Tempo Real**  
O formulário valida os campos dinamicamente, exibindo mensagens de erro assim que o usuário interage com eles. Isso evita que o usuário tenha que submeter o formulário para descobrir um erro.

✔ **Validação Híbrida**  
A validação é uma combinação inteligente de:  
- **Validação Nativa do HTML5**: Utiliza atributos como `required`, `min`, `max` e `type` para garantir a validade básica dos dados.  
- **Validação Customizada com JavaScript**: Regras de negócio personalizadas para campos específicos (ex.: formato do código do produto e validação de data futura), garantindo que os dados sejam precisos e relevantes.

✔ **UX/UI Otimizada**  
O design foi pensado para ser intuitivo. A classe `is-invalid` adiciona uma borda de erro nos campos e exibe a mensagem correspondente, guiando o usuário de forma clara.

✔ **Sistema Modular**  
O código JavaScript é organizado em uma classe `SmartForm`, tornando a lógica de validação reutilizável e fácil de ser aplicada a outros formulários.

---

## 💡 Como a Validação Funciona no JavaScript

O projeto utiliza uma classe **`SmartForm`** que gerencia toda a lógica de validação:

- **`init()`** → Desativa a validação padrão do navegador (`novalidate`) e configura os *event listeners*.  
- **`validateField()`** → É o coração da validação. Ele primeiro verifica a validade nativa do campo (`checkValidity()`) e, se o campo for válido, executa as validações customizadas.  
- **`addValidator()`** → Permite adicionar novas regras de validação facilmente.  

---

## 💻 Instalação e Uso

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git

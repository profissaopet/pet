/* ============================================================
   PET MASCOTE COMPLETO — CIRCLE.SO
   JavaScript puro. Cole este bloco no FINAL do snippet atual.
   Mantém o PetMasterSystem funcionando e cria uma interface separada.
   ============================================================ */
(function () {
  "use strict";

  const CONFIG = {
    imageUrl:
      "https://raw.githubusercontent.com/profissaopet/pet/main/pet.png",

    dashboardUrl: "/dash_aluna",
    coursesUrl: "/home",
    socioUrl: "https://comunidade.aprenderecuidar.com.br/socio",
    supportUrl: "/members",

    desktopSize: 108,
    mobileSize: 82,

    widgetId: "pet-assistente-widget",
    styleId: "pet-assistente-style-v1",

    storage: {
      open: "pet_assistente_open",
      minimized: "pet_assistente_minimized",
      x: "pet_assistente_x",
      y: "pet_assistente_y",
      greeted: "pet_assistente_greeted"
    },

    messages: [
      "Olá! Que bom ter você aqui 🐾",
      "Quer conferir seus Arrasas?",
      "Seu próximo passo pode estar a um clique.",
      "Continue avançando. Você está arrasando! ✨"
    ]
  };

  const PetAssistant = {
    widget: null,
    bubble: null,
    button: null,
    messageEl: null,
    balanceEl: null,
    badgeEl: null,
    messageIndex: 0,
    lastBalance: null,
    observer: null,
    updateTimer: null,

    init() {
      if (!document.body) {
        setTimeout(() => this.init(), 300);
        return;
      }

      this.installStyles();
      this.removeOldVisualWidget();
      this.render();
      this.bindGlobalUpdates();
      this.syncData();
      this.startIdleMessages();
    },

    installStyles() {
      document.getElementById(CONFIG.styleId)?.remove();

      const style = document.createElement("style");
      style.id = CONFIG.styleId;
      style.textContent = `
        #pet-floating-widget {
          display: none !important;
        }

        #${CONFIG.widgetId},
        #${CONFIG.widgetId} * {
          box-sizing: border-box !important;
        }

        #${CONFIG.widgetId} {
          position: fixed !important;
          right: 18px;
          bottom: 18px;
          z-index: 2147483646 !important;
          width: ${CONFIG.desktopSize}px;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-end !important;
          gap: 4px !important;
          font-family: Inter, "Segoe UI", system-ui, sans-serif !important;
          user-select: none !important;
          touch-action: none !important;
          pointer-events: none !important;
        }

        #${CONFIG.widgetId}.pet-assistente-open {
          width: 270px;
        }

        #${CONFIG.widgetId}.pet-assistente-minimized {
          width: 56px;
        }

        .pet-assistente-bubble {
          position: relative !important;
          width: 270px !important;
          max-width: calc(100vw - 20px) !important;
          padding: 14px !important;
          margin: 0 2px 2px 0 !important;
          border: 1px solid rgba(111, 61, 25, .13) !important;
          border-radius: 17px !important;
          background: rgba(255, 255, 255, .98) !important;
          color: #34251b !important;
          box-shadow:
            0 18px 42px rgba(71, 37, 17, .18),
            0 3px 10px rgba(71, 37, 17, .08) !important;
          backdrop-filter: blur(13px) !important;
          -webkit-backdrop-filter: blur(13px) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          transform: translateY(9px) scale(.96) !important;
          transform-origin: right bottom !important;
          transition:
            opacity .2s ease,
            visibility .2s ease,
            transform .2s ease !important;
          pointer-events: auto !important;
        }

        .pet-assistente-bubble::after {
          content: "" !important;
          position: absolute !important;
          right: 35px !important;
          bottom: -7px !important;
          width: 14px !important;
          height: 14px !important;
          background: white !important;
          transform: rotate(45deg) !important;
          border-right: 1px solid rgba(111, 61, 25, .12) !important;
          border-bottom: 1px solid rgba(111, 61, 25, .12) !important;
        }

        #${CONFIG.widgetId}.pet-assistente-open .pet-assistente-bubble {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateY(0) scale(1) !important;
        }

        .pet-assistente-top {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: space-between !important;
          gap: 10px !important;
        }

        .pet-assistente-kicker {
          display: block !important;
          margin-bottom: 3px !important;
          color: #9a7961 !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          letter-spacing: .1em !important;
          text-transform: uppercase !important;
        }

        .pet-assistente-message {
          margin: 0 !important;
          color: #332319 !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          line-height: 1.4 !important;
        }

        .pet-assistente-close {
          width: 26px !important;
          height: 26px !important;
          min-width: 26px !important;
          display: grid !important;
          place-items: center !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 50% !important;
          background: #f5ede7 !important;
          color: #765b49 !important;
          font-size: 15px !important;
          cursor: pointer !important;
        }

        .pet-assistente-wallet {
          display: grid !important;
          grid-template-columns: auto 1fr !important;
          gap: 10px !important;
          align-items: center !important;
          margin: 11px 0 !important;
          padding: 9px 10px !important;
          border-radius: 13px !important;
          background: #fff7ee !important;
        }

        .pet-assistente-badge {
          width: 38px !important;
          height: 38px !important;
          display: grid !important;
          place-items: center !important;
          overflow: hidden !important;
          border-radius: 50% !important;
          background: #f2dcc5 !important;
          font-size: 20px !important;
        }

        .pet-assistente-badge img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        .pet-assistente-wallet-label {
          display: block !important;
          color: #91745f !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          letter-spacing: .08em !important;
          text-transform: uppercase !important;
        }

        .pet-assistente-balance {
          display: block !important;
          color: #df842f !important;
          font-size: 21px !important;
          font-weight: 900 !important;
          line-height: 1.15 !important;
        }

        .pet-assistente-actions {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 7px !important;
        }

        .pet-assistente-action {
          min-height: 38px !important;
          padding: 8px 9px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          border: 1px solid rgba(224, 139, 38, .18) !important;
          border-radius: 11px !important;
          background: #fffaf5 !important;
          color: #71441f !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          text-decoration: none !important;
          cursor: pointer !important;
        }

        .pet-assistente-action-primary {
          grid-column: 1 / -1 !important;
          border: 0 !important;
          background: #e08b26 !important;
          color: white !important;
        }

        .pet-assistente-button {
          position: relative !important;
          width: ${CONFIG.desktopSize}px !important;
          height: ${CONFIG.desktopSize}px !important;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
          cursor: grab !important;
          pointer-events: auto !important;
          transform-origin: center bottom !important;
          animation: petAssistenteIdle 3.1s ease-in-out infinite !important;
          filter: drop-shadow(0 9px 8px rgba(69, 34, 11, .19)) !important;
        }

        .pet-assistente-button:active {
          cursor: grabbing !important;
        }

        .pet-assistente-button img {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          object-position: center bottom !important;
          pointer-events: none !important;
        }

        .pet-assistente-dot {
          position: absolute !important;
          top: 11px !important;
          right: 7px !important;
          width: 13px !important;
          height: 13px !important;
          border: 2px solid white !important;
          border-radius: 50% !important;
          background: #e96f3d !important;
          animation: petAssistentePulse 1.7s ease-in-out infinite !important;
        }

        .pet-assistente-mini {
          width: 54px !important;
          height: 54px !important;
          display: none !important;
          place-items: center !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 50% !important;
          background: #e08b26 !important;
          color: white !important;
          font-size: 25px !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          box-shadow: 0 8px 20px rgba(224, 139, 38, .30) !important;
        }

        #${CONFIG.widgetId}.pet-assistente-minimized .pet-assistente-button,
        #${CONFIG.widgetId}.pet-assistente-minimized .pet-assistente-bubble {
          display: none !important;
        }

        #${CONFIG.widgetId}.pet-assistente-minimized .pet-assistente-mini {
          display: grid !important;
        }

        .pet-assistente-react {
          animation: petAssistenteJump .58s ease !important;
        }

        .pet-assistente-shake {
          animation: petAssistenteShake .55s ease !important;
        }

        @keyframes petAssistenteIdle {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-4px) rotate(-.5deg); }
        }

        @keyframes petAssistenteJump {
          0% { transform: translateY(0) scale(1); }
          35% { transform: translateY(-10px) scale(1.04,.96); }
          65% { transform: translateY(0) scale(.98,1.03); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes petAssistenteShake {
          0%,100% { transform: rotate(0); }
          25% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
          75% { transform: rotate(-2deg); }
        }

        @keyframes petAssistentePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(233,111,61,.35); }
          50% { box-shadow: 0 0 0 7px rgba(233,111,61,0); }
        }

        @media (max-width: 680px) {
          #${CONFIG.widgetId} {
            width: ${CONFIG.mobileSize}px;
            right: 8px;
            bottom: 66px;
          }

          #${CONFIG.widgetId}.pet-assistente-open {
            width: 245px;
          }

          .pet-assistente-button {
            width: ${CONFIG.mobileSize}px !important;
            height: ${CONFIG.mobileSize}px !important;
          }

          .pet-assistente-bubble {
            width: 245px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pet-assistente-button,
          .pet-assistente-dot {
            animation: none !important;
          }
        }
      `;

      document.head.appendChild(style);
    },

    removeOldVisualWidget() {
      const old = document.getElementById("pet-floating-widget");
      if (old) old.style.display = "none";
    },

    render() {
      document.getElementById(CONFIG.widgetId)?.remove();

      const widget = document.createElement("div");
      widget.id = CONFIG.widgetId;

      const savedOpen = localStorage.getItem(CONFIG.storage.open) === "true";
      const minimized =
        localStorage.getItem(CONFIG.storage.minimized) === "true";

      widget.classList.toggle("pet-assistente-open", savedOpen);
      widget.classList.toggle("pet-assistente-minimized", minimized);

      widget.innerHTML = `
        <section class="pet-assistente-bubble" aria-label="Assistente da comunidade">
          <div class="pet-assistente-top">
            <div>
              <span class="pet-assistente-kicker">Assistente Pet</span>
              <p class="pet-assistente-message">
                Olá! Que bom ter você aqui 🐾
              </p>
            </div>

            <button
              class="pet-assistente-close"
              type="button"
              aria-label="Fechar"
            >×</button>
          </div>

          <div class="pet-assistente-wallet">
            <div class="pet-assistente-badge">🐾</div>

            <div>
              <span class="pet-assistente-wallet-label">Seu saldo</span>
              <strong class="pet-assistente-balance">0 Arrasas</strong>
            </div>
          </div>

          <div class="pet-assistente-actions">
            <button
              class="pet-assistente-action pet-assistente-action-primary"
              data-action="dashboard"
              type="button"
            >🏆 Abrir meu dashboard</button>

            <button
              class="pet-assistente-action"
              data-action="courses"
              type="button"
            >📚 Cursos</button>

            <button
              class="pet-assistente-action"
              data-action="censo"
              type="button"
            >🐾 Censo Pet</button>

            <button
              class="pet-assistente-action"
              data-action="socio"
              type="button"
            >🎁 Benefícios</button>

            <button
              class="pet-assistente-action"
              data-action="support"
              type="button"
            >💬 Suporte</button>
          </div>
        </section>

        <button
          class="pet-assistente-button"
          type="button"
          aria-label="Abrir assistente"
          aria-expanded="${savedOpen}"
        >
          <span class="pet-assistente-dot" aria-hidden="true"></span>

          <img
            src="${CONFIG.imageUrl}"
            alt="Mascote caramelo"
            draggable="false"
          >
        </button>

        <button
          class="pet-assistente-mini"
          type="button"
          aria-label="Mostrar mascote"
        >🐾</button>
      `;

      document.body.appendChild(widget);

      this.widget = widget;
      this.bubble = widget.querySelector(".pet-assistente-bubble");
      this.button = widget.querySelector(".pet-assistente-button");
      this.messageEl = widget.querySelector(".pet-assistente-message");
      this.balanceEl = widget.querySelector(".pet-assistente-balance");
      this.badgeEl = widget.querySelector(".pet-assistente-badge");

      this.restorePosition();
      this.bindEvents();
      this.enableDrag();

      if (
        !sessionStorage.getItem(CONFIG.storage.greeted) &&
        !minimized
      ) {
        setTimeout(() => {
          this.open("Olá! Posso ajudar você a navegar pela comunidade? 🐾");
          sessionStorage.setItem(CONFIG.storage.greeted, "true");
        }, 2500);
      }
    },

    bindEvents() {
      this.button.addEventListener("click", () => {
        if (this.widget.dataset.dragged === "true") {
          this.widget.dataset.dragged = "false";
          return;
        }

        this.react("jump");

        if (this.widget.classList.contains("pet-assistente-open")) {
          this.close();
        } else {
          this.open();
        }
      });

      this.widget
        .querySelector(".pet-assistente-close")
        .addEventListener("click", () => this.close());

      this.widget
        .querySelector(".pet-assistente-mini")
        .addEventListener("click", () => this.restore());

      this.widget
        .querySelectorAll("[data-action]")
        .forEach((element) => {
          element.addEventListener("click", () => {
            this.handleAction(element.dataset.action);
          });
        });
    },

    handleAction(action) {
      this.react("shake");

      switch (action) {
        case "dashboard":
          window.location.assign(CONFIG.dashboardUrl);
          break;

        case "courses":
          window.location.assign(CONFIG.coursesUrl);
          break;

        case "socio":
          window.location.assign(CONFIG.socioUrl);
          break;

        case "support":
          window.location.assign(CONFIG.supportUrl);
          break;

        case "censo":
          if (
            window.PetMasterSystem &&
            typeof window.PetMasterSystem.iniciarCensoFormulario === "function"
          ) {
            document
              .getElementById("pet-walk-container")
              ?.remove();

            window.PetMasterSystem.iniciarCensoFormulario();
            this.close();
          } else {
            this.speak("O Censo Pet ainda não está disponível nesta página.");
          }
          break;
      }
    },

    open(message) {
      if (message) this.speak(message);

      this.widget.classList.remove("pet-assistente-minimized");
      this.widget.classList.add("pet-assistente-open");
      this.button.setAttribute("aria-expanded", "true");

      localStorage.setItem(CONFIG.storage.open, "true");
      localStorage.setItem(CONFIG.storage.minimized, "false");

      const dot = this.button.querySelector(".pet-assistente-dot");
      if (dot) dot.hidden = true;
    },

    close() {
      this.widget.classList.remove("pet-assistente-open");
      this.button.setAttribute("aria-expanded", "false");
      localStorage.setItem(CONFIG.storage.open, "false");
    },

    minimize() {
      this.widget.classList.remove("pet-assistente-open");
      this.widget.classList.add("pet-assistente-minimized");

      localStorage.setItem(CONFIG.storage.open, "false");
      localStorage.setItem(CONFIG.storage.minimized, "true");
    },

    restore() {
      this.widget.classList.remove("pet-assistente-minimized");
      localStorage.setItem(CONFIG.storage.minimized, "false");
      this.react("jump");
    },

    speak(message) {
      if (!this.messageEl) return;
      this.messageEl.textContent = message;
    },

    react(type) {
      if (!this.button) return;

      const className =
        type === "shake"
          ? "pet-assistente-shake"
          : "pet-assistente-react";

      this.button.classList.remove(
        "pet-assistente-react",
        "pet-assistente-shake"
      );

      void this.button.offsetWidth;
      this.button.classList.add(className);

      setTimeout(() => {
        this.button?.classList.remove(className);
      }, 650);
    },

    syncData() {
      const saldo = parseInt(
        localStorage.getItem("userSaldo") || "0",
        10
      );

      const badge = localStorage.getItem("userBadge") || "";
      this.updateBalance(saldo);
      this.updateBadge(badge);
    },

    updateBalance(value) {
      if (!this.balanceEl) return;

      const newValue = Number.isFinite(value) ? value : 0;
      const oldValue =
        this.lastBalance === null
          ? newValue
          : this.lastBalance;

      this.lastBalance = newValue;

      if (oldValue === newValue) {
        this.balanceEl.textContent = `${newValue} Arrasas`;
        return;
      }

      const duration = 850;
      const start = performance.now();

      const frame = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const current = Math.round(
          oldValue + (newValue - oldValue) * progress
        );

        this.balanceEl.textContent = `${current} Arrasas`;

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else if (newValue > oldValue) {
          this.open(`Você ganhou ${newValue - oldValue} Arrasas! 🎉`);
          this.react("jump");
        }
      };

      requestAnimationFrame(frame);
    },

    updateBadge(name) {
      if (!this.badgeEl) return;

      const normalized = String(name || "").toLowerCase();

      const map = {
        mulher:
          "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/assets/Mulher.webp",
        fera:
          "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/assets/Fera.webp",
        profissional:
          "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/assets/Prof.webp",
        embaixadora:
          "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/assets/Embaixadora.webp",
        aprendiz:
          "https://raw.githubusercontent.com/juanjsales/PETRocinha/main/assets/Aprendiz.webp"
      };

      const key = Object.keys(map).find((item) =>
        normalized.includes(item)
      );

      this.badgeEl.innerHTML = key
        ? `<img src="${map[key]}" alt="${String(name)}">`
        : "🐾";
    },

    bindGlobalUpdates() {
      clearInterval(this.updateTimer);

      this.updateTimer = setInterval(() => {
        this.syncData();
        this.removeOldVisualWidget();
      }, 2500);

      window.addEventListener("storage", (event) => {
        if (event.key === "userSaldo" || event.key === "userBadge") {
          this.syncData();
        }
      });

      this.observer?.disconnect();

      this.observer = new MutationObserver(() => {
        if (!document.getElementById(CONFIG.widgetId)) {
          this.render();
          this.syncData();
        }

        this.removeOldVisualWidget();
      });

      this.observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    },

    startIdleMessages() {
      setInterval(() => {
        if (
          !this.widget ||
          this.widget.classList.contains("pet-assistente-open") ||
          this.widget.classList.contains("pet-assistente-minimized")
        ) {
          return;
        }

        this.messageIndex =
          (this.messageIndex + 1) % CONFIG.messages.length;

        this.speak(CONFIG.messages[this.messageIndex]);

        const dot = this.button?.querySelector(".pet-assistente-dot");
        if (dot) dot.hidden = false;
      }, 30000);
    },

    enableDrag() {
      let active = false;
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;
      let moved = false;

      this.button.addEventListener("pointerdown", (event) => {
        active = true;
        moved = false;
        pointerId = event.pointerId;

        const rect = this.widget.getBoundingClientRect();

        startX = event.clientX;
        startY = event.clientY;
        initialLeft = rect.left;
        initialTop = rect.top;

        this.widget.style.left = `${rect.left}px`;
        this.widget.style.top = `${rect.top}px`;
        this.widget.style.right = "auto";
        this.widget.style.bottom = "auto";

        this.button.setPointerCapture?.(pointerId);
      });

      this.button.addEventListener("pointermove", (event) => {
        if (!active || event.pointerId !== pointerId) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          moved = true;
        }

        if (!moved) return;

        event.preventDefault();

        const maxLeft = Math.max(
          0,
          window.innerWidth - this.widget.offsetWidth
        );

        const maxTop = Math.max(
          0,
          window.innerHeight - this.widget.offsetHeight
        );

        const left = Math.max(
          0,
          Math.min(initialLeft + dx, maxLeft)
        );

        const top = Math.max(
          0,
          Math.min(initialTop + dy, maxTop)
        );

        this.widget.style.left = `${left}px`;
        this.widget.style.top = `${top}px`;
      });

      const finish = (event) => {
        if (!active || event.pointerId !== pointerId) return;

        active = false;

        if (moved) {
          this.widget.dataset.dragged = "true";

          localStorage.setItem(
            CONFIG.storage.x,
            this.widget.style.left
          );

          localStorage.setItem(
            CONFIG.storage.y,
            this.widget.style.top
          );

          setTimeout(() => {
            if (this.widget) this.widget.dataset.dragged = "false";
          }, 100);
        }

        pointerId = null;
      };

      this.button.addEventListener("pointerup", finish);
      this.button.addEventListener("pointercancel", finish);
    },

    restorePosition() {
      const x = localStorage.getItem(CONFIG.storage.x);
      const y = localStorage.getItem(CONFIG.storage.y);

      if (!x || !y) return;

      this.widget.style.left = x;
      this.widget.style.top = y;
      this.widget.style.right = "auto";
      this.widget.style.bottom = "auto";

      requestAnimationFrame(() => {
        const rect = this.widget.getBoundingClientRect();

        const left = Math.max(
          0,
          Math.min(rect.left, window.innerWidth - rect.width)
        );

        const top = Math.max(
          0,
          Math.min(rect.top, window.innerHeight - rect.height)
        );

        this.widget.style.left = `${left}px`;
        this.widget.style.top = `${top}px`;
      });
    }
  };

  window.PetAssistant = PetAssistant;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => PetAssistant.init(),
      { once: true }
    );
  } else {
    PetAssistant.init();
  }
})();

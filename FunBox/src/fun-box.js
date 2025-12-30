class FunBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.plugin = null;
  }

  connectedCallback() {
    const type = this.getAttribute("type") || "placeholder";
    const src = this.getAttribute("src");
    const character = this.getAttribute("character") || "none";
    const behavior = this.getAttribute("behavior") || "idle";
    const trigger = this.getAttribute("trigger") || "click";

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="src/fun-box.css">
      <div class="fun-box-wrapper" data-character="${character}">
        <div class="fun-box-canvas" id="canvas"></div>
        ${character !== "none" ? `<div class="mascot-face">${character}</div>` : ""}
      </div>
    `;

    this.loadPlugin(type, src, behavior);
    this.setupTrigger(trigger, behavior);
  }

  async loadPlugin(type, src, behavior) {
    try {
      const module = await import(`./plugins/loader-${type}.js`);
      this.plugin = await module.default(
        this.shadowRoot.getElementById("canvas"),
        src,
        behavior
      );
    } catch (e) {
      console.warn(`[FunBox] Failed to load plugin "${type}". Using fallback.`);
      this.shadowRoot.getElementById("canvas").innerHTML = `
        <img src="public/placeholder.svg" alt="FunBox Placeholder">
      `;
    }
  }

  setupTrigger(trigger, behavior) {
    this.shadowRoot.querySelector(".fun-box-wrapper")
      .addEventListener(trigger, () => {
        if (this.plugin && typeof this.plugin.play === "function") {
          this.plugin.play(behavior);
        }
      });
  }

  // Cleanup when removed from DOM
  disconnectedCallback() {
    if (this.plugin && typeof this.plugin.destroy === "function") {
      this.plugin.destroy();
    }
  }

  // Optional manual close handler
  close() {
    this.disconnectedCallback();
    this.remove();
  }
}

customElements.define("fun-box", FunBox);

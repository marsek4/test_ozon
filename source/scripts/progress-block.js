export const MAIN_OPTIONS = {
    value: 0,
    animated: false,
    hidden: false,
    label: "Progress",
  };

export default class ProgressBlock {
    constructor(element, options = {}) {
        if (!(element instanceof HTMLElement)) {
        throw new TypeError("Progress block element must be a valid HTMLElement");
        }

        this.root = element;
        this.originalHTML = this.root.innerHTML;
        this.originalClasses = this.root.className;
        this.originalStyle = this.root.hasAttribute("style")
            ? this.root.getAttribute("style")
            : null;
        this.originalHidden = this.root.hidden;

        this.options = { ...MAIN_OPTIONS, ...options };

        this.state = { value: null, isAnimated: false, isHidden: false };

        this.#cacheDOM();
        this.#render();

        this.setValue(this.options.value);
        this.setIsAnimated(this.options.animated);
        this.setIsHidden(this.options.hidden);
    }

    getValue() {
        return this.state.value;
    }

    getIsAnimated() {
        return this.state.isAnimated;
    }

    getIsHidden() {
        return this.state.isHidden;
    }

    setValue(value) {
        const normalizedValue = ProgressBlock.normalizeValue(value);
        if (this.state.value === normalizedValue) {
            return this.state.value;
        }
        
        this.state.value = normalizedValue;
        this.#updateValueUI(normalizedValue);
        return normalizedValue;
    }

    setIsAnimated(isAnimated) {
        const nextValue = Boolean(isAnimated);
        if (this.state.isAnimated === nextValue) {
          return this.state.isAnimated;
        }
    
        this.state.isAnimated = nextValue;
        this.root.classList.toggle("progress-animated", nextValue);
        this.root.dataset.isAnimated = String(nextValue);
    
        return this.state.isAnimated;
    }

    setIsHidden(isHidden) {
        const nextValue = Boolean(isHidden);
        
        if (this.state.isHidden === nextValue) {
            return this.state.isHidden;
        }
        
        this.state.isHidden = nextValue;
        this.root.hidden = nextValue;
        this.root.setAttribute("aria-hidden", String(nextValue));
        this.root.dataset.isHidden = String(nextValue);
        
        return this.state.isHidden;
    }

    static normalizeValue(value) {
        const num = Number(value);
        return Number.isFinite(num) 
            ? Math.min(100, Math.max(0, Math.round(num))) 
            : 0;
    }

    #updateValueUI(value) {
      this.root.style.setProperty("--progress", `${value}%`);
      this.root.setAttribute("aria-valuenow", String(value));
      this.root.setAttribute("aria-valuetext", `${value}%`);
      this.root.dataset.value = String(value);
      if (this.status) {
        this.status.textContent = `${this.options.label}: ${value}%`;
      }
    }

    #render() {
        this.ring = this.root.querySelector("[data-progress-ring]");
        this.status = this.root.querySelector("[data-progress-status]");
    }

    #cacheDOM() {
        this.root.classList.add("progress");
        this.root.setAttribute("role", "progressbar");
        this.root.setAttribute("aria-label", this.options.label);
        this.root.setAttribute("aria-valuemin", "0");
        this.root.setAttribute("aria-valuemax", "100");
        this.root.innerHTML = `
        <div class="progress-ring" data-progress-ring aria-hidden="true"></div>
        <span class="visually-hidden" data-progress-status>${this.options.label}: 0%</span>
        `;
    }

    destroy() {
        this.root.classList.remove("progress", "progress-animated");
        delete this.root.dataset.isAnimated;
        delete this.root.dataset.isHidden;
        delete this.root.dataset.value;
        
        const attrsToRemove = [
        "role", "aria-hidden", "aria-label", "aria-valuemin",
        "aria-valuemax", "aria-valuenow", "aria-valuetext"
        ];

        attrsToRemove.forEach(attr => this.root.removeAttribute(attr));

        this.root.innerHTML = this.originalHTML;
        this.root.className = this.originalClasses;

        if (this.originalStyle !== null) {
        this.root.setAttribute('style', this.originalStyle);
        } else {
        this.root.removeAttribute('style');
        }

        this.root.hidden = this.originalHidden;

        this.ring = null;
        this.status = null;
        this.root = null;
    }
}
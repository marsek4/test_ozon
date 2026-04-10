import ProgressBlock from "./progress-block.js";

const FALLBACK_VALUE = 50;

function queryDemoNodes(doc) {
  return {
    progressHost: doc.querySelector("[data-progress]"),
    valueField: doc.getElementById("progress-value"),
    animateToggle: doc.getElementById("progress-animate"),
    hideToggle: doc.getElementById("progress-hide"),
  };
}

function mirrorSwitchAria(input, checked) {
  input.checked = checked;
  input.setAttribute("aria-checked", String(checked));
}

function mountProgressDemo(nodes) {
  const { progressHost, valueField, animateToggle, hideToggle } = nodes;
  if (!progressHost || !valueField || !animateToggle || !hideToggle) {
    return;
  }

  const raw = valueField.value.trim();
  const initial =
    raw === "" ? FALLBACK_VALUE : ProgressBlock.normalizeValue(raw);
  const block = new ProgressBlock(progressHost, {
    value: initial,
    animated: false,
    hidden: false,
    label: "Task progress",
  });

  const pullStateIntoForm = () => {
    valueField.value = String(block.getValue());
    mirrorSwitchAria(animateToggle, block.getIsAnimated());
    mirrorSwitchAria(hideToggle, block.getIsHidden());
  };

  const applyHideSideEffects = () => {
    const locked = block.getIsHidden();
    valueField.disabled = locked;
    animateToggle.disabled = locked;
  };

  pullStateIntoForm();

  valueField.addEventListener("input", () => {
    block.setValue(ProgressBlock.normalizeValue(valueField.value));
    valueField.value = String(block.getValue());
  });

  valueField.addEventListener("blur", () => {
    valueField.value = String(block.getValue());
  });

  valueField.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") {
      return;
    }
    e.preventDefault();
    if (valueField.disabled) {
      return;
    }
    block.setValue(ProgressBlock.normalizeValue(valueField.value));
    valueField.value = String(block.getValue());
    valueField.blur();
  });

  animateToggle.addEventListener("change", () => {
    block.setIsAnimated(animateToggle.checked);
    mirrorSwitchAria(animateToggle, block.getIsAnimated());
  });

  hideToggle.addEventListener("change", () => {
    const hide = hideToggle.checked;
    block.setIsHidden(hide);
    if (hide) {
      block.setIsAnimated(false);
      mirrorSwitchAria(animateToggle, block.getIsAnimated());
    }
    applyHideSideEffects();
    mirrorSwitchAria(hideToggle, block.getIsHidden());
  });
}

function startWhenDomReady() {
  mountProgressDemo(queryDemoNodes(document));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startWhenDomReady, { once: true });
} else {
  startWhenDomReady();
}

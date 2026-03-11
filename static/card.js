let temperatureIncrease = 200;
let kelvin = true
const values = document.querySelector("#value1");
const degreeUnit = document.querySelector("#unit1")
const buttons = document.querySelectorAll(".button");
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (e.target.classList.contains("normal")) {
      e.target.parentElement.childNodes[1].classList.toggle("normal");
      e.target.parentElement.childNodes[1].classList.toggle("pushed");
      e.target.parentElement.childNodes[3].classList.toggle("normal");
      e.target.parentElement.childNodes[3].classList.toggle("pushed");
      values.textContent = kelvin ? 473 : 200 
      temperatureIncrease = kelvin ? 473 : 200
      degreeUnit.classList.toggle("hide",kelvin)
      kelvin = !kelvin
    }
  });
});

const knob = document.querySelector(".knob1");
const knob_style = window.getComputedStyle(knob);
const knob_before_style = window.getComputedStyle(knob, "::before");
const lane = document.querySelector(".lane1");
const lane_style = window.getComputedStyle(lane);
const lane_width = parseInt(lane_style.width);
const knob_width = parseInt(knob_style.width);
const knob_before_width = parseInt(knob_before_style.width);
const knob_left_end = -((knob_width - knob_before_width) / 2);
const knob_right_end = lane_width - knob_width - knob_left_end;
let mouse_over = false;
let minVal = 200;
let maxVal = 300;

knob.addEventListener("change", (e) => {
  values.textContent = `${e.detail.temperature+temperatureIncrease}`;
});

const onDrag = (e) => {
  e.preventDefault();
  const left = parseInt(knob_style.left);
  let x = left + e.movementX;
  if (x < knob_left_end) {
    x = knob_left_end;
  } else if (x > knob_right_end) {
    x = knob_right_end;
  }
  knob.style.left = `${x}px`;
  const temperature = parseInt(
    (left - knob_left_end) /
      ((knob_right_end - knob_left_end) / (maxVal - minVal))
  );
  knob.dispatchEvent(
    new CustomEvent("change", {
      detail: { temperature },
    })
  );
};
knob.addEventListener("mousedown", (e) => {
  document.onmousemove = onDrag;
});
document.addEventListener("mouseup", (e) => {
  document.onmouseup = null;
  document.onmousemove = null;
});

const knob2 = document.querySelector(".knob2");
const knob_style2 = window.getComputedStyle(knob2);
const knob_before_style2 = window.getComputedStyle(knob2, "::before");
const lane2 = document.querySelector(".lane2");
const lane_style2 = window.getComputedStyle(lane2);
const lane_width2 = parseInt(lane_style2.width);
const knob_width2 = parseInt(knob_style2.width);
const knob_before_width2 = parseInt(knob_before_style2.width);
const knob_left_end2 = -((knob_width2 - knob_before_width2) / 2);
const knob_right_end2 = lane_width2 - knob_width2 - knob_left_end2;
let mouse_over2 = false;
let minVal2 = 0;
let maxVal2 = 5;
const values2 = document.querySelector("#value2");

knob2.addEventListener("change", (e) => {
  values2.textContent = `${e.detail.temperature}`;
});

const onDrag2 = (e) => {
  e.preventDefault();
  const left = parseInt(knob_style2.left);
  let x = left + e.movementX;
  if (x < knob_left_end2) {
    x = knob_left_end2;
  } else if (x > knob_right_end2) {
    x = knob_right_end2;
  }
  knob2.style.left = `${x}px`;
  const temperature = parseInt(
    (left - knob_left_end2) /
      ((knob_right_end2 - knob_left_end2) / (maxVal2 - minVal2))
  );
  knob2.dispatchEvent(
    new CustomEvent("change", {
      detail: { temperature },
    })
  );
};
knob2.addEventListener("mousedown", (e) => {
  document.onmousemove = onDrag2;
});
document.addEventListener("mouseup", (e) => {
  document.onmouseup = null;
  document.onmousemove = null;
});

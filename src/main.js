import { throttle, removeHashFromURL } from "./scripts/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let AccesibilityButton;
let TimezoneButton;
let ReducedMotionToggle;
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion)");
let HighContrastToggle;
const highContrastMedia = window.matchMedia("(prefers-contrast: more)");
let LocationTimers;

function timer() {
  const date = new Date();
  const now = `${date.getUTCHours().toString().padStart(2, 0)}:${date.getUTCMinutes().toString().padStart(2, 0)}`;
  for (const LocationTimer of LocationTimers) {
    LocationTimer.textContent = now
  }
}

// TODO: Add JS computed viewport height variable to root ?
async function initializeSketch() {
  const sketchEl = document.getElementById('sketch');
  const mobileSketch = await import(`./scripts/sketch.mobile.js`);
  mobileSketch.run(sketchEl);
  return 1;
}

// window.initializeSketch = initializeSketch;

document.addEventListener('DOMContentLoaded', function () {

  removeHashFromURL();

  // Buttons

  AccesibilityButton = document.querySelector('.interaction__accesibility');
  TimezoneButton = document.querySelector('.interaction__timezone');

  AccesibilityButton.addEventListener('click', function () {
    document.body.classList.toggle('accesibility-open');
    document.body.classList.remove('timezone-open');
  })

  TimezoneButton.addEventListener('click', function () {
    document.body.classList.toggle('timezone-open');
    document.body.classList.remove('accesibility-open');
  })

  // Accesibility options

  ReducedMotionToggle = document.querySelector('.interaction__reduced-motion');
  ReducedMotionToggle.checked = reducedMotionMedia.matches;

  ReducedMotionToggle.addEventListener('change', function (e) {
    document.body.classList.toggle('reduced-motion-on', e.target.checked);
  })

  reducedMotionMedia.addEventListener('change', function (e) {
    ReducedMotionToggle.checked = e.matches;
    document.body.classList.toggle('reduced-motion-on', e.matches);
  })

  HighContrastToggle = document.querySelector('.interaction__high-contrast');
  HighContrastToggle.checked = highContrastMedia.matches;

  HighContrastToggle.addEventListener('change', function (e) {
    document.body.classList.toggle('high-contrast-on', e.target.checked);
  })

  highContrastMedia.addEventListener('change', function (e) {
    HighContrastToggle.checked = e.matches;
    document.body.classList.toggle('high-contrast-on', e.matches);
  })

  // Scroll status

  window.addEventListener('scroll', throttle(function () {
    document.body.classList.remove('timezone-open');
    document.body.classList.remove('accesibility-open');

    if (window.scrollY > 50) {
      document.body.classList.add('scroll-50');
    } else {
      document.body.classList.remove('scroll-50');
    }
  }, 25))

  // Timers

  LocationTimers = document.querySelectorAll('.location__time')
  timer();
  setInterval(timer, 1000);

  // Initialize sketch
  initializeSketch().then(console.log);

  // Ready, execute after time tickers
  document.body.classList.add('ready')

})

// Sketch
// ------
// Dynamically load sketch based on resolution
// Listen to resize event (create one single event)
// On resize check if new experience should be loaded
// GSAP scroll based timeline

// Mobile experience
// -----------------


// Refactor
// --------
// Refactor and create services for listeners based on design patterns
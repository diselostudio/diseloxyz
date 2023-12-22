import { throttle } from "./scripts/utils";

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

document.addEventListener('DOMContentLoaded', function () {

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
    if (window.scrollY > 50) {
      document.body.classList.add('scroll-50');
    } else {
      document.body.classList.remove('scroll-50');
    }
  }, 25))

  // On start begin timer counter and update clock interval
  // Timers
  LocationTimers = document.querySelectorAll('.location__time')
  timer();
  setInterval(timer, 900);

})

// If accesibility is open, bind event to close tooltips

// On scroll start remove hashtag same on inital load

// On scoll change add 100px class



// On document loaded and time interval began add ready class

// Sketch
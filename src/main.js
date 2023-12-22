let AccesibilityButton;
let TimezoneButton;
let ReducedMotionToggle;
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion)");
let HighContrastToggle;
const highContrastMedia = window.matchMedia("(prefers-contrast: more)");

document.addEventListener('DOMContentLoaded', function () {
  AccesibilityButton = document.querySelector('.interaction__accesibility');
  TimezoneButton = document.querySelector('.interaction__timezone');
  ReducedMotionToggle = document.querySelector('.interaction__reduced-motion');
  HighContrastToggle = document.querySelector('.interaction__high-contrast');

  AccesibilityButton.addEventListener('click', function () {
    document.body.classList.toggle('accesibility-open');
  })

  TimezoneButton.addEventListener('click', function () {
    document.body.classList.toggle('timezone-open');
  })

  ReducedMotionToggle.checked = reducedMotionMedia.matches;

  ReducedMotionToggle.addEventListener('change', function (e) {
    document.body.classList.toggle('reduced-motion-on', e.target.checked);
  })

  reducedMotionMedia.addEventListener('change', function (e) {
    ReducedMotionToggle.checked = e.matches;
    document.body.classList.toggle('reduced-motion-on', e.matches);
  })

  HighContrastToggle.checked = highContrastMedia.matches;

  HighContrastToggle.addEventListener('change', function (e) {
    document.body.classList.toggle('high-contrast-on', e.target.checked);
  })

  highContrastMedia.addEventListener('change', function (e) {
    HighContrastToggle.checked = e.matches;
    document.body.classList.toggle('high-contrast-on', e.matches);
  })


})

// On scroll start remove hashtag

// On scoll change add 100px class

// On start begin timer counter and update clock interval

// On document loaded and time interval began add ready class

// Sketch
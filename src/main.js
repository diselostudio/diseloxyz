let AccesibilityButton;
let TimezoneButton;
let ReducedMotionToggle;
let HighContrastToggle;

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

  ReducedMotionToggle.addEventListener('change', function (e) {
    document.body.classList.toggle('reduced-motion-on', e.target.checked);
  })

  HighContrastToggle.addEventListener('change', function (e) {
    document.body.classList.toggle('high-contrast-on', e.target.checked);
  })
})

// On scroll start remove hashtag

// On scoll change add 100px class

// Styling on button interaction
// Click accesibility add accesibility class
// On load check if any accesibility option is enabled, if so, add classes and change input values
// Accesibility toggles events

// Click timezone add timezone class


// On start begin timer counter and update clock interval

// On document loaded and time interval began add ready class

// Sketch
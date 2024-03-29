import { throttle, removeHashFromURL, debounce } from "./scripts/utils";
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
let mobileExperience, desktopExperience;

function timer() {
  const date = new Date();
  const now = `${date.getUTCHours().toString().padStart(2, 0)}:${date.getUTCMinutes().toString().padStart(2, 0)}`;
  for (const LocationTimer of LocationTimers) {
    LocationTimer.textContent = now
  }
}

function initializeSketch() {
  let isDesktop = window.innerWidth > 768;

  if (isDesktop) {
    initializeDesktopSketch().then((experience) => desktopExperience = experience);
  } else {
    initializeMobileSketch().then((experience) => mobileExperience = experience);
  }

  window.addEventListener('resize', debounce(() => {

    const isNewDesktop = window.innerWidth > 768;

    if (isNewDesktop !== isDesktop) {
      isDesktop = isNewDesktop;

      if (isDesktop) {
        mobileExperience && mobileExperience.kill();
        desktopExperience && desktopExperience.resume();
        !desktopExperience && initializeDesktopSketch().then((experience) => desktopExperience = experience);
      } else {
        mobileExperience && mobileExperience.resume();
        desktopExperience && desktopExperience.kill();
        !mobileExperience && initializeMobileSketch().then((experience) => mobileExperience = experience);
      }
    }
  }, 200))
}

async function initializeMobileSketch() {
  const sketchElMobile = document.getElementById('sketch__mobile');
  const mobileSketch = await import(`./scripts/sketch.mobile.js`);
  mobileSketch.run(sketchElMobile);
  return mobileSketch;
}

async function initializeDesktopSketch() {
  const sketchElDesktop = document.getElementById('sketch__desktop');
  const { Sketch } = await import(`./scripts/sketch.desktop.js`);
  const desktopSketch = new Sketch(sketchElDesktop);
  desktopSketch.run();
  return desktopSketch;
}

async function initializeAnalytics() {
  try {
    await import(`./scripts/analytics.js`);
  } catch (error) {
    console.error(error);
  }
}

function toggleDesktopMotion() {
  if (ReducedMotionToggle.checked || HighContrastToggle.checked) {
    desktopExperience && desktopExperience.kill();
  } else {
    desktopExperience && desktopExperience.resume();
  }
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
    toggleDesktopMotion();
  })

  reducedMotionMedia.addEventListener('change', function (e) {
    ReducedMotionToggle.checked = e.matches;
    document.body.classList.toggle('reduced-motion-on', e.matches);
    toggleDesktopMotion();
  })

  HighContrastToggle = document.querySelector('.interaction__high-contrast');
  HighContrastToggle.checked = highContrastMedia.matches;

  HighContrastToggle.addEventListener('change', function (e) {
    document.body.classList.toggle('high-contrast-on', e.target.checked);
    toggleDesktopMotion();
  })

  highContrastMedia.addEventListener('change', function (e) {
    HighContrastToggle.checked = e.matches;
    document.body.classList.toggle('high-contrast-on', e.matches);
    toggleDesktopMotion();
  })

  // Scroll status

  window.addEventListener('scroll', throttle(function () {
    document.body.classList.remove('timezone-open');
    document.body.classList.remove('accesibility-open');
  }, 25))

  // Timers

  LocationTimers = document.querySelectorAll('.location__time')
  timer();
  setInterval(timer, 1000);

  // Initialize sketch

  initializeSketch();

  // Ready, execute after time tickers

  document.body.classList.add('ready')

  // Load analytics scripts

  initializeAnalytics();

})


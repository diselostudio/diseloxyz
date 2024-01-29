import { debounce, throttle } from './utils';

(function () {

    window.requestIdleCallback = window.requestIdleCallback || ((fn) => fn());

    const sessionId = `${Math.floor(Math.random() * 100)}__${Date.now()}`;
    const location = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? 'Int location not supported';
    const userAgent = navigator.userAgent;
    const browser = getBrowser(userAgent);
    let resolution = window.innerWidth / window.innerHeight;
    let experience = window.innerWidth < 768 ? 'mobile' : 'desktop';
    let scrollPercentage = 0;

    requestIdleCallback(
        sendEvent.bind(null, { sessionId, event: 'new-session', when: Date.now(), location, userAgent, browser, resolution, experience }),
        { timeout: 2000 }
    )

    const clickEls = document.querySelectorAll('[data-tiny-click]')
    clickEls.forEach((el) => el.addEventListener('click',
        () => requestIdleCallback(
            sendEvent.bind(null, { sessionId, event: 'click', element: el.dataset.tinyClick, when: Date.now() }),
            { timeout: 2000 }
        )
    ))

    const hoverEls = document.querySelectorAll('[data-tiny-hover]')
    hoverEls.forEach((el) => el.addEventListener('mouseenter',
        () => requestIdleCallback(
            sendEvent.bind(null, { sessionId, event: 'hover', element: el.dataset.tinyHover, when: Date.now() }),
            { timeout: 2000 }
        )
    ))

    window.addEventListener('resize', debounce(function () {
        const newResolution = window.innerWidth / window.innerHeight;
        const newExperience = window.innerWidth < 768 ? 'mobile' : 'desktop';

        if (newResolution !== resolution) {
            resolution = newResolution;
            requestIdleCallback(
                sendEvent.bind(null, { sessionId, event: 'new-resolution', resolution, when: Date.now() }),
                { timeout: 2000 }
            )
        }

        if (newExperience !== experience) {
            experience = newExperience;
            requestIdleCallback(
                sendEvent.bind(null, { sessionId, event: 'new-experience', experience, when: Date.now() }),
                { timeout: 2000 }
            )
        }

    }, 2000))

    window.addEventListener('scroll', throttle(function (e) {
        const percentage = 100 * window.scrollY / (document.body.offsetHeight - window.innerHeight);
        const clampedPercentage = Math.round(percentage / 25) * 25;
        if (clampedPercentage !== scrollPercentage) {
            scrollPercentage = clampedPercentage;
            requestIdleCallback(
                sendEvent.bind(null, { sessionId, event: `scroll-to-${clampedPercentage}`, when: Date.now() }),
                { timeout: 2000 }
            )
        }
    }, 250))

})();

function getBrowser(userAgent) {
    let browser = "Unknown";
    if (/Chrome/.test(userAgent) && !/Chromium/.test(userAgent)) {
        browser = "Google Chrome";
    }
    else if (/Edg/.test(userAgent)) {
        browser = "Microsoft Edge";
    }
    else if (/Firefox/.test(userAgent)) {
        browser = "Mozilla Firefox";
    }
    else if (/Safari/.test(userAgent)) {
        browser = "Apple Safari";
    }

    return browser;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function sendEvent(params) {

    if (import.meta.env.DEV) return;

    const schema = {
        sessionId: null,
        event: null,
        when: null,
        experience: null,
        location: null,
        userAgent: null,
        browser: null,
        resolution: null,
        element: null,
        origin: window.location.href
    }

    const data = {
        ...schema,
        ...params,
        when: formatDate(new Date(params.when)),
        resolution: params.resolution ? Number(params.resolution.toFixed(2)) : null
    };

    fetch(
        'https://api.tinybird.co/v0/events?name=site_events',
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${import.meta.env.VITE_TINYBIRD}` }
        }
    )
}
// event event event -------> ignore ------> trigger

export function debounce(func, timeout = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => { func.apply(this, args) }, timeout)
    }
}

// event -------> trigger ------> ignore

export function throttle(fn, timeout = 300) {
    let throttled = false
    return function (...args) {
        if (!throttled) {
            fn.apply(this, args)
            throttled = true
            setTimeout(() => {
                throttled = false
            }, timeout)
        }
    }
}

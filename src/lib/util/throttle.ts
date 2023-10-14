/**
 * Creates a throttled version of a function, ensuring that the original function
 * is not called more frequently than the specified time limit.
 *
 * @template T - The function type to throttle.
 * @param {T} func - The function to throttle.
 * @param {number} limit - The time limit in milliseconds for throttling calls.
 * @returns {T} - A throttled version of the input function.
 *
 * @example
 * const throttledFunc = throttle(myFunction, 500);
 * throttledFunc(); // myFunction will not be invoked more than once in any 500ms time window.
 */
export function throttle<T extends (...args: any) => any>(func: T, limit: number): T {
    let lastFunc: ReturnType<typeof setTimeout>
    let lastRan: number

    const throttled: any = (...args: any[]): void => {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc)

            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func(...args)
                    lastRan = Date.now()
                }
            }, limit - (Date.now() - lastRan))
        }
    };

    return throttled as T
}

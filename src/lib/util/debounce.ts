export const debounce = <T extends any[]>(func: (...args: T) => void, wait: number) => {
    let timeout: NodeJS.Timeout
    return function (...args: T) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

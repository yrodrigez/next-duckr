export function Section({children, className, classNameExact}: { children: any, className?: string, classNameExact?: string }) {

    const baseclassName = `border-x border-white/30 max-w-[600px] w-screen h-screen py-6 ${className || ''}`
    const _className = baseclassName.split(' ').filter((v, i, a) => a.indexOf(v) === i).join(' ')
    return <section className={classNameExact || _className}>
        {children}
    </section>
}

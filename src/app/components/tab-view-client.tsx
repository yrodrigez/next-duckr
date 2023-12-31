'use client'
import {useState} from "react";
import {type ReactNode} from "react";

export function TabView({tabs}: {
    tabs: { label: string, icon?: any, name: string, children: ReactNode }[],
}) {
    const [activeTab, setActiveTab] = useState(tabs[0])

    return (
        <div className="flex flex-col h-full overflow-auto">
            <div className="flex">
                {tabs.map((tab, index) => (
                    <button key={index}
                            className={`flex flex-col flex-1 items-center text-white text-sm font-bold py-2 px-3 border-b-2 border-transparent hover:border-white/30 focus:outline-none focus:border-white/30 transition-all ${activeTab.name === tab.name ? 'border-white/30' : ''}`}
                            onClick={() => setActiveTab(tab)}>
                        <span className="text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>
            <div key={activeTab.name} className="overflow-auto">
                {activeTab.children || []}
            </div>
        </div>
    )
}

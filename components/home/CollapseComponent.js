import React, { useState } from 'react';
import { AssistantIcon, DashboardIcon, DatasourceIcon, NotebookIcon } from '../Icons/icon';

function CollapseComponent({ setShowCreateAssistant, setCreateDashboard, setShowCreateNotebook, setShowCreateDatasource }) {
    const [openIndex, setOpenIndex] = useState(0); // Default to the first card being open

    const cards = [
        {
            title: "Assistant",
            description: "Assistants help you interact with your data and get relevant insights at the end of each interaction. You can integrate any number of Datasources with Assistants to analyze your data and obtain actionable insights quickly.",
            buttonText: "Create Assistant",
            icon: <AssistantIcon size={6} />,
            action: () => setShowCreateAssistant && setShowCreateAssistant(true),
        },
        {
            title: "Dashboard",
            description: "Create custom Dashboards to visualize insights. After querying your Datasource or Assistant, you can add the generated insights to your Dashboard for easy tracking and analysis.",
            buttonText: "Create Dashboard",
            icon: <DashboardIcon size={6} />,
            action: () => setCreateDashboard && setCreateDashboard(true),
        },
        {
            title: "Notebook",
            description: "Analyze your Datasource or Assistant directly within the Notebook while creating your report. Add generated insights with ease to make your report visually appealing and easy to track.",
            buttonText: "Create Notebook",
            icon: <NotebookIcon size={6} />,
            action: () => setShowCreateNotebook && setShowCreateNotebook(true),
        },
        {
            title: "Datasource",
            description: "Create a Datasource to bring your data into the platform. Then, you can ask questions, integrate with Assistants, or visualize with Dashboards and Notebooks for actionable insights.",
            buttonText: "Create Datasource",
            icon: <DatasourceIcon size={6} />,
            action: () => setShowCreateDatasource && setShowCreateDatasource(true),
        },
    ];

    return (
        <div className="w-full rounded-lg font-roboto">
            {cards.map((card, index) => (
                <div key={index} className={`${index !== cards.length - 1 && "border-b border-border-color"}`}>
                    <div
                        onClick={() => setOpenIndex(index)}
                        className="flex justify-between items-center cursor-pointer h-12"
                    >
                        <div className="flex space-x-2 items-center justify-center">
                            <span>{card.icon}</span>
                            <span
                                className={`text-sm leading-4 font-medium ${openIndex === index ? "text-primary-text" : "text-secondary-text"
                                    }`}
                            >
                                {card.title}
                            </span>
                        </div>
                        <span className="flex items-center">
                            {openIndex !== index ? (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 10.2663L4 6.26634L4.93333 5.33301L8 8.39967L11.0667 5.33301L12 6.26634L8 10.2663Z" fill="#414551" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5.73366L4 9.73366L4.93333 10.667L8 7.60033L11.0667 10.667L12 9.73366L8 5.73366Z" fill="#414551" />
                                </svg>
                            )}
                        </span>
                    </div>
                    {openIndex === index && (
                        <div className="gap-3 mb-3 flex flex-col">
                            <div className="text-[13px] text-secondary-text">{card.description}</div>
                            <button
                                type="button"
                                className="flex w-fit items-center justify-center h-8 px-3 space-x-2 text-xs font-semibold tracking-wide rounded-md text-btn-primary-text hover:bg-btn-primary-hover bg-btn-primary"
                                onClick={card.action}
                            >
                                <span>{card.buttonText}</span>
                                <span className="flex items-center justify-center">
                                    <svg
                                        width="12"
                                        height="13"
                                        viewBox="0 0 12 13"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M7.5 10L6.7875 9.3L9.0875 7H1V6H9.0875L6.8 3.7L7.5 3L11 6.5L7.5 10Z" fill="#F6F6F6" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default CollapseComponent;
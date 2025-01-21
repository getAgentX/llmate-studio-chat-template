import React from 'react';
import Link from 'next/link';
import { useExploreTemplatesQuery } from '@/store/templates';
import { AssistantIcon, DashboardIcon, DatasourceIcon, NotebookIcon } from '../Icons/icon';
import { useLabelPromptContext } from '@/context/LabelPromptContext';
import Loader from '../loader/Loader';

const ExploreTemplate = () => {
    const { setPromptLabel } = useLabelPromptContext();

    const {
        data: templatesData,
        isLoading: templatesLoading,
        error: templatesError,
        refetch: refetchTemplates,
    } = useExploreTemplatesQuery(
        {},
        { refetchOnMountOrArgChange: true }
    );

    if (templatesLoading)
        return (
            <div className="flex h-[140px] items-center justify-center rounded-lg shadow-lg bg-primary ">
                <Loader />
            </div>
        );

    if (templatesError) {
        return <div className="flex h-[140px] items-center justify-center rounded-lg shadow-lg bg-primary text-primary-text">
            <p>Error loading templates. Please try again later.</p>
        </div>
    }

    const cardsData = [
        {
            title: templatesData?.assistant?.name || 'Assistant',
            icon: <AssistantIcon size={6} />,
            description: templatesData?.assistant?.about || 'No description available',
            items: templatesData?.assistant?.sample_questions[0]?.slice(0, 2)?.map((question) => ({
                text: question,
                href: `/assistant/chat/${templatesData?.assistant.id}`,
            })) || [],
        },
        {
            title: templatesData?.datasource?.name || 'Datasource',
            icon: <DatasourceIcon size={6} />,
            description: templatesData?.datasource?.about || 'No description available',
            items: templatesData?.datasource?.ds_config?.sample_questions?.slice(0, 2)?.map((question) => ({
                text: question,
                href: `/datasource/details/${templatesData?.datasource.id}/query`,
            })) || [],
        },
        {
            title: templatesData?.dashboard?.label || 'Dashboard',
            icon: <DashboardIcon size={6} />,
            description: templatesData?.dashboard?.description || 'No description available',
            buttonText: 'View',
            href: '/dashboard',
        },
        {
            title: templatesData?.notebook?.label || 'Notebook',
            icon: <NotebookIcon size={6} />,
            description: templatesData?.notebook?.description || 'No description available',
            buttonText: 'View',
            href: '/notebook',
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-4">
            {cardsData.map((card, index) => (
                <div
                    key={index}
                    className="flex flex-col justify-between rounded-md shadow-md bg-primary space-y-2 py-3"
                >
                    {/* Title and Description */}
                    <div className="flex flex-col space-y-2 px-3">
                        <div className="flex items-center space-x-2">
                            <span>{card.icon}</span>
                            <p className="text-sm font-medium text-primary-text">{card.title}</p>
                        </div>
                        <p className="text-[13px] text-secondary-text overflow-hidden text-ellipsis line-clamp-2">
                            {card.description}
                        </p>
                    </div>

                    {/* Items */}
                    {card.items?.length > 0 && (
                        <ul className="space-y-2 text-xs text-secondary-text px-3">
                            {card.items.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="py-1.5 px-3 rounded text-ellipsis border border-transparent whitespace-nowrap overflow-hidden cursor-pointer hover:bg-label-hover hover:border-border-color bg-icon-secondary-bg"
                                >
                                    <Link href={item.href} onClick={() => setPromptLabel(item.text)}>
                                        {item.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Action Button */}
                    {card.buttonText && card.href && (
                        <div className="border-t border-border-color px-3 pt-3 flex justify-end">
                            <Link
                                href={card.href}
                                className="flex items-center justify-center h-8 px-3 space-x-1.5 text-xs font-medium tracking-wide border rounded w-fit text-btn-primary-outline-text hover:text-btn-primary-text group border-btn-primary-outline hover:bg-btn-primary-outline-bg"
                            >
                                <span className="flex items-center justify-center">
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 fill-active-icon group-hover:fill-white"
                                    >
                                        <path d="M2 14V10.6667H3.33333V12.6667H5.33333V14H2ZM10.6667 14V12.6667H12.6667V10.6667H14V14H10.6667ZM2 5.33333V2H5.33333V3.33333H3.33333V5.33333H2ZM12.6667 5.33333V3.33333H10.6667V2H14V5.33333H12.6667Z" />
                                    </svg>
                                </span>
                                <span>{card.buttonText}</span>
                            </Link>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ExploreTemplate;

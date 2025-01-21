import { SidebarLayout } from '@/components';
import Breadcrumb from '@/components/common/Breadcrumbs';
import UserInfoSidebar from '@/components/Layout/UserInfoSidebar';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import Split from "react-split";

const UserInfoLayout = ({ children, extraChild = null }) => {
    const [showCreateAssistant, setShowCreateAssistant] = useState(false);
    const [isCollapse, setIsCollapse] = useState(false);
    const [slug, setSlug] = useState(null);
    const router = useRouter()
    const crumbData = [
        {
            name: "User Info",
            slug: "/user-info",
        },
    ];

    const SortedRes1 = [
        {
            id: "11",
            name: "Google Ads",
            datasources: [
                {
                    account: "Account_Id_1",
                    username: "Channel 2",
                    status: true,
                    workspace_used: 2,
                    datasource_connected: 3,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
                {
                    account: "Account_Id_2",
                    username: "Abhas",
                    status: true,
                    workspace_used: 10,
                    datasource_connected: 6,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
                {
                    account: "Account_Id_3",
                    username: "Channel 2",
                    status: false,
                    workspace_used: 5,
                    datasource_connected: 5,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
                {
                    account: "Account_Id_4",
                    username: "Channel 2",
                    status: true,
                    workspace_used: 2,
                    datasource_connected: 3,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
            ],
        },
        {
            id: "22",
            name: "Facebook Ads",
            datasources: [
                {
                    account: "Account_Id_2",
                    username: "Abhas",
                    status: true,
                    workspace_used: 10,
                    datasource_connected: 6,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
                {
                    account: "Account_Id_3",
                    username: "Channel 2",
                    status: false,
                    workspace_used: 5,
                    datasource_connected: 5,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
            ],
        },
        {
            id: "33",
            name: "Instagram Ads",
            datasources: [
                {
                    account: "Account_Id_2",
                    username: "Abhas",
                    status: true,
                    workspace_used: 10,
                    datasource_connected: 6,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
                {
                    account: "Account_Id_3",
                    username: "Channel 2",
                    status: false,
                    workspace_used: 5,
                    datasource_connected: 5,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
                {
                    account: "Account_Id_2",
                    username: "Abhas",
                    status: true,
                    workspace_used: 10,
                    datasource_connected: 6,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
                {
                    account: "Account_Id_3",
                    username: "Channel 2",
                    status: false,
                    workspace_used: 5,
                    datasource_connected: 5,
                    created: "Aug 12, 2024",
                    authorized_at: "Oct 29, 2024",
                    datasource_id: "66c5b6056036bf0aef588b71",
                },
            ],
        },
    ];

    useEffect(() => {
        if (router?.query?.slug) {
            setSlug(router.query.slug);
        }
    }, [router]);


    return (
        <div className="relative flex flex-col h-full max-h-screen min-h-screen overflow-hidden font-roboto">
            <Split
                className="split_row"
                direction="horizontal"
                minSize={isCollapse ? 0 : 100}
                gutterSize={2}
                cursor="e-resize"
                // sizes={[20, 80]}
                sizes={[isCollapse ? "48px" : 20, isCollapse ? 96.5 : 80]}
            >
                <div className="w-full h-full max-h-full">
                    <UserInfoSidebar
                        setShowCreateAssistant={setShowCreateAssistant}
                        isCollapse={isCollapse}
                        setIsCollapse={setIsCollapse}
                    />
                </div>

                <div className="w-full h-full max-h-full">
                    <div className="relative flex flex-col w-full h-full overflow-y-auto recent__bar">
                        <div className="sticky top-0 left-0 z-50 flex flex-col w-full bg-page">
                            <div className="flex items-center justify-between h-12 px-4 border-b border-border-color">
                                <div className="flex items-center space-x-2">
                                    {/* <span className="flex items-center justify-center mb-1">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clip-path="url(#clip0_2645_4849)">
                                                <path d="M15.8333 20H4.16667C1.87255 20 0 18.1275 0 15.8333V4.16667C0 1.87255 1.87255 0 4.16667 0H15.8333C18.1275 0 20 1.87255 20 4.16667V15.8333C20 18.1275 18.1275 20 15.8333 20Z" fill="url(#paint0_linear_2645_4849)" />
                                                <path d="M20.0029 15.8343V10.3245L12.3068 2.74609L4.75781 14.3637L10.5225 19.9912H15.8264C18.1304 20.001 20.0029 18.1284 20.0029 15.8343Z" fill="url(#paint1_linear_2645_4849)" />
                                                <path d="M12.0226 9.95217L10.9049 7.83452C10.552 7.15805 9.70883 6.89334 9.03236 7.24629L3.8853 9.95217C3.20883 10.3051 2.94413 11.1482 3.29707 11.8247L4.41471 13.9424C4.76766 14.6188 5.61079 14.8835 6.28726 14.5306L6.6206 14.3541C6.6206 14.3541 7.56177 16.1679 7.93432 16.8541C8.30687 17.5404 8.76766 17.3933 9.20883 17.1973C9.65001 17.0012 10.2873 16.56 10.2873 16.56L8.50295 13.3737L11.4441 11.8345C12.1108 11.4718 12.3755 10.6286 12.0226 9.95217Z" fill="#4B73B1" />
                                                <path d="M9.21415 17.1958C9.65533 16.9997 10.2926 16.5586 10.2926 16.5586L8.50827 13.3723L10.6259 12.2644L9.31219 10.0684L3.89062 12.9409L4.42004 13.9507C4.77298 14.6272 5.61612 14.8919 6.29259 14.5389L6.62592 14.3625C6.62592 14.3625 7.5671 16.1762 7.93964 16.8625C8.30239 17.5389 8.77298 17.3919 9.21415 17.1958Z" fill="#365493" />
                                                <path d="M6.67969 8.43233L9.1993 12.9715L15.4346 11.7951L11.1895 3.75586L6.67969 8.43233Z" fill="white" />
                                                <path d="M14.4943 8.26601C15.0737 8.26601 15.5434 7.79635 15.5434 7.21699C15.5434 6.63763 15.0737 6.16797 14.4943 6.16797C13.915 6.16797 13.4453 6.63763 13.4453 7.21699C13.4453 7.79635 13.915 8.26601 14.4943 8.26601Z" fill="white" />
                                                <path d="M15.4543 11.9811L11.0327 3.57919C10.9249 3.37331 11.0033 3.11841 11.2092 3.02037L11.8367 2.68703C12.0425 2.57919 12.2974 2.65762 12.3955 2.8635L16.817 11.2655C16.9249 11.4713 16.8465 11.7262 16.6406 11.8243L16.0131 12.1576C15.817 12.2655 15.5621 12.187 15.4543 11.9811Z" fill="#5989C4" />
                                                <path d="M9.20205 12.9707L15.3687 11.8139L13.3393 7.96094L7.97656 10.7649L9.20205 12.9707Z" fill="#E7E9EA" />
                                                <path d="M16.026 12.1577L16.6535 11.8243C16.8594 11.7165 16.9378 11.4616 16.83 11.2655L14.7417 7.29492L13.3594 7.9812L15.4672 11.991C15.5653 12.1871 15.8202 12.2655 16.026 12.1577Z" fill="#4268AD" />
                                            </g>
                                            <defs>
                                                <linearGradient id="paint0_linear_2645_4849" x1="10" y1="20.0001" x2="10" y2="0" gradientUnits="userSpaceOnUse">
                                                    <stop stop-color="#263B74" />
                                                    <stop offset="1" stop-color="#4D78BF" />
                                                </linearGradient>
                                                <linearGradient id="paint1_linear_2645_4849" x1="12.3803" y1="20.0011" x2="12.3803" y2="2.75021" gradientUnits="userSpaceOnUse">
                                                    <stop stop-color="#1F3157" />
                                                    <stop offset="1" stop-color="#3F63AF" />
                                                </linearGradient>
                                                <clipPath id="clip0_2645_4849">
                                                    <rect width="20" height="20" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>

                                    </span> */}

                                    <p className="text-base font-normal capitalize text-primary-text leading-[0px]">
                                        {/* {getRes?.name || ""} */}
                                        {SortedRes1.find((item) => item.id === slug)?.name}
                                    </p>
                                </div>

                            </div>

                        </div>

                        <div className="w-full px-4 pt-4">{children}</div>
                    </div>
                </div>
            </Split>
        </div>
    )
}

export default UserInfoLayout

UserInfoLayout.getLayout = function getLayout(page) {
    return <SidebarLayout>{page}</SidebarLayout>;
};
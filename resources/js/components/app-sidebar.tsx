import { Link } from '@inertiajs/react';
import { PackageSearch, Upload, Logs } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Upload Master DC Report',
        href: `/upload-master-dc-report`,
        icon: Upload,
    },
    {
        title: 'Process Manual Allocation',
        href: `/process-manual-allocation`,
        icon: PackageSearch,
    },
    {
        title: 'Logs',
        href: `/logs`,
        icon: Logs,
    },

];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Settings',
//         href: '',
//         icon: Settings2,
//     },

// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={""} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            {/* <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter> */}
        </Sidebar>
    );
}

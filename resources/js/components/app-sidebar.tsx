import { Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Heart, 
    BarChart3, 
    Megaphone, 
    MapPin, 
    Book as Bible, 
    History,
    LayoutDashboard,
    User
} from 'lucide-react';
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
        title: 'Profile',
        href: '/profile',
        icon: User,
    },
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
    },
    // Group: Spiritual Growth
    {
        title: 'Daily Devotions',
        href: '/daily-devotions',
        icon: BookOpen,
    },
    {
        title: 'Read Bible',
        href: '/read-bible',
        icon: Bible,
    },
    // Group: Stewardship & Community
    {
        title: 'Tithes & Offerings',
        href: '/tithes-offerings',
        icon: Heart,
    },
    {
        title: 'Our Churches',
        href: '/our-churches',
        icon: MapPin,
    },
    // Group: Admin
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
    },
    {
        title: 'Administer Logs',
        href: '/logs',
        icon: History,
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

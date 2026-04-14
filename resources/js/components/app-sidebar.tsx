import { Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { 
    Home, 
    BookOpen, 
    Book as Bible, 
    Heart, 
    Music, 
    MessageSquareHeart, 
    Megaphone, 
    HandCoins, 
    MapPin, 
    BarChart3, 
    Users,     
    Church,    
    Calendar,  
    ShieldCheck,
    Settings2
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
        title: 'Home',
        href: '/',
        icon: Home,
    },
    {
        title: 'Spiritual Growth',
        href: '#',
        icon: BookOpen,
        children: [
            {
                title: 'Bible Study',
                href: '/bible-study',
                icon: Bible,
            },
            {
                title: 'Daily Devotion',
                href: '/devotion',
                icon: Heart,
            },
            {
                title: 'Praise & Worship',
                href: '/praise-worship',
                icon: Music,
            },
            {
                title: 'Prayer Requests',
                href: '/prayer-requests',
                icon: MessageSquareHeart,
            }
        ]
    },
    {
        title: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
    },
    {
        title: 'Tithes & Offerings',
        href: '/tithes-offerings',
        icon: HandCoins,
    },
    {
        title: 'Our Churches',
        href: '/our-churches',
        icon: MapPin,
    },
    {
        title: 'Admin',
        href: '#',
        icon: ShieldCheck,
        children: [
            {
                title: 'Reports',
                href: '/reports',
                icon: BarChart3,
            },
            {
                title: 'Membership',
                href: '/membership',
                icon: Users,
            },
            {
                title: 'Churches',
                href: '/churches',
                icon: MapPin,
            },
            {
                title: 'Ministries',
                href: '/ministries',
                icon: Church,
            },
            {
                title: 'Calendar of Activities',
                href: '/calendar',
                icon: Calendar,
            },
        ]
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '',
        icon: Settings2,
    },

];

function useResponsiveCollapsed() {
    const { state } = useSidebar();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // It's effectively collapsed if we aren't on mobile and state is 'collapsed'
    return !isMobile && state === 'collapsed';
}

export function AppSidebar() {
    const isCollapsed = useResponsiveCollapsed();

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
                {/* NavMain handles the logic for:
                  1. Standard links
                  2. Accordions (Expanded)
                  3. Hover Portals (Collapsed)
                */}
                <NavMain items={mainNavItems} isCollapsed={isCollapsed} />
            </SidebarContent>

            <SidebarFooter>
                {/* You can add a NavFooter here for Settings if needed */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

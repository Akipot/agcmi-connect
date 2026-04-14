import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    module?: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | React.ComponentType<any> | null;
    isActive?: boolean;
    children?: NavItem[];
    // Change HTMLAnchorElement to Element
    onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void; 
    external?: boolean; 
    target?: string;
}

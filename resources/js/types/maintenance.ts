
export interface BaseMaintenance {
    isActive: boolean;
    insertBy: string;
    insertDate: string;
    updateBy: string;
    updateDate: string;
    firstName?: string; // Joined from member_details
}

export interface Module extends BaseMaintenance {
    module_id: number;
    module: string;
}

export interface Position extends BaseMaintenance {
    position_id: number;
    position: string;
}

export interface Ministry extends BaseMaintenance {
    ministry_id: number;
    ministry: string;
}

export interface Action extends BaseMaintenance {
    access_id: number;
    access: string;
}

/**
 * The Pivot Table for Module Access
 */
export interface ModuleAccess extends BaseMaintenance {
    ModuleAccess_id: number;
    module_id: number;
    access_id: number;
    position_id: number;
    // Relations loaded via Eloquent .with()
    module?: Module;
    action?: Action;
    position?: Position;
}

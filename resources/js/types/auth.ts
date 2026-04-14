export type Member = {
    user_id: number;
    FirstName: string | null;
    MiddleName: string | null;
    LastName: string | null;
    Suffix: string | null;
    Gender: number | null;
    BirthDate: string | null;
    BirthPlace: string | null;
    JoinDate: string | null;
    Church_ID: number | null;
    Email: string | null;
    PermanentAddress: string | null;
    PresentAddress: string | null;
    ProfilePicture: string | null;
    ProfilePicturePath: string | null;
    CoverPicture: string | null;
    CoverPicturePath: string | null;
    InsertDate: string | null;
    UpdateDate: string | null;
    isActive: boolean | number | null;
    Type: string | null;
};

export type User = {
    user_id: number;
    userName: string;
    type: number;
    created_at: string;
    updated_at: string;
    // Nesting the member details inside the user object
    member: Member | null; 
};

export type Auth = {
    user: Member;
};

// Standard Inertia PageProps wrapper
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: Auth;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

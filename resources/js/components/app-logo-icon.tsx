import Logo from '@assets/icon.png';

export default function AppLogoIcon(props: React.HTMLAttributes<HTMLImageElement>) {
    return (
        <div
            className="inline-block p-[7px] rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.3)] bg-white dark:bg-gray-800"
        >
            <img src={Logo} alt="Logo" {...props} />
        </div>
    );
}

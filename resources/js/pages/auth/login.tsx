import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth/auth-split-layout';
import ThemeToggle from '@/components/theme-toggle';
import { store } from '@/routes/login';

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your username and password below to log in"
        >
            <Head title="Login" />

            {/* Theme Toggle positioned relative to the right panel */}
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {/* --- Username Field --- */}
                            <div className="grid gap-2">
                                <Label htmlFor="userName">Username</Label>
                                <Input
                                    id="userName"
                                    type="text"
                                    name="userName" // Matches accounts table and Fortify config
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Username"
                                    className="block w-full"
                                />
                                {/* Display specific "Account not found" error from Provider */}
                                <InputError message={errors.userName} />
                            </div>

                            {/* --- Password Field --- */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                {/* Display specific "Incorrect password" error from Provider */}
                                <InputError message={errors.password} />
                            </div>

                            {/* --- Remember Me --- */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label 
                                    htmlFor="remember" 
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {/* --- Submit Button --- */}
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2" />}
                                Log in
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {/* Status messages (e.g., successful password reset) */}
            {status && (
                <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}

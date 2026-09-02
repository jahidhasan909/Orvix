'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button, Link } from '@heroui/react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const LoginPage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
    const [totpCode, setTotpCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setAuthError('');
        setIsLoading(true);

        const { error } = await authClient.signIn.email({
            email: data.email,
            password: data.password,
        }, {
            onRequest: () => {
                setIsLoading(true);
            },
            onSuccess: (ctx) => {
                if (ctx.data?.twoFactorRedirect) {
                    setNeedsTwoFactor(true);
                    setIsLoading(false);
                    return;
                }
                setIsLoading(false);
                window.location.href = "/dashboard";
            },
            onError: (ctx) => {
                setIsLoading(false);
                setAuthError(ctx.error.message || "Login failed. Please check your credentials.");
            }
        });

        if (error) {
            setAuthError(error.message);
            setIsLoading(false);
        }
    };

    const onVerifyTwoFactor = async (event) => {
        event.preventDefault();
        setAuthError('');
        setIsLoading(true);

        const code = totpCode.replace(/\s/g, '');
        const result = useBackupCode
            ? await authClient.twoFactor.verifyBackupCode({ code })
            : await authClient.twoFactor.verifyTotp({ code });

        setIsLoading(false);

        if (result.error) {
            setAuthError(result.error.message || "Invalid authenticator code.");
            return;
        }

        window.location.href = "/dashboard";
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
            <div className="w-full max-w-md rounded-2xl bg-slate-900/60 p-8 shadow-xl backdrop-blur-xl border border-slate-800">
                
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        {needsTwoFactor ? 'Authenticator' : 'Welcome Back'}
                    </h2>
                    <p className="text-sm text-slate-400 mt-2">
                        {needsTwoFactor
                            ? 'Enter the code from Microsoft Authenticator to finish signing in.'
                            : 'Log in using Better Auth & HeroUI'}
                    </p>
                </div>

                {authError && (
                    <div className="mb-4 rounded-xl bg-danger-500/10 border border-danger-500/30 p-3 text-center text-sm text-danger">
                        {authError}
                    </div>
                )}

                {needsTwoFactor ? (
                    <form onSubmit={onVerifyTwoFactor} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm text-slate-300">
                                {useBackupCode ? 'Backup code' : '6-digit code'}
                            </label>
                            <input
                                type="text"
                                inputMode={useBackupCode ? 'text' : 'numeric'}
                                autoComplete="one-time-code"
                                required
                                value={totpCode}
                                onChange={(event) => setTotpCode(event.target.value)}
                                placeholder={useBackupCode ? 'Enter a backup code' : '000000'}
                                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-transparent px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
                            />
                        </div>
                        <Button
                            type="submit"
                            color="secondary"
                            isLoading={isLoading}
                            className="w-full font-semibold mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        >
                            {isLoading ? 'Verifying...' : 'Verify and continue'}
                        </Button>
                        <button
                            type="button"
                            className="text-center text-sm text-purple-400"
                            onClick={() => {
                                setUseBackupCode((current) => !current);
                                setTotpCode('');
                                setAuthError('');
                            }}
                        >
                            {useBackupCode ? 'Use authenticator code' : 'Use a backup code'}
                        </button>
                    </form>
                ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div>
                        <Input
                            isRequired
                            type="email"
                            label="Email Address"
                            placeholder="Enter your email"
                            variant="bordered"
                            startContent={<Mail className="text-slate-400" size={18} />}
                            {...register('email', { 
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message}
                            classNames={{
                                label: "text-slate-300",
                                input: "text-white",
                                inputWrapper: "border-slate-700 hover:border-purple-500 focus-within:!border-purple-500"
                            }}
                        />
                    </div>

                    <div>
                        <Input
                            isRequired
                            label="Password"
                            placeholder="Enter your password"
                            variant="bordered"
                            startContent={<Lock className="text-slate-400" size={18} />}
                            endContent={
                                <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                                    {isVisible ? (
                                        <EyeOff className="text-slate-400" size={18} />
                                    ) : (
                                        <Eye className="text-slate-400" size={18} />
                                    )}
                                </button>
                            }
                            type={isVisible ? "text" : "password"}
                            {...register('password', { 
                                required: 'Password is required'
                            })}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                            classNames={{
                                label: "text-slate-300",
                                input: "text-white",
                                inputWrapper: "border-slate-700 hover:border-purple-500 focus-within:!border-purple-500"
                            }}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        color="secondary" 
                        isLoading={isLoading}
                        className="w-full font-semibold mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    >
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </Button>
                </form>
                )}

                {!needsTwoFactor ? (
                    <>
                <p className="text-center text-sm text-slate-400 mt-6">
                    Need a platform admin account?{' '}
                    <Link href="/registration" size="sm" className="text-purple-400 font-medium">
                        Register
                    </Link>
                </p>
                <p className="text-center text-xs text-slate-500 mt-2">
                    NGO Admin and worker accounts are created by an administrator, not through public registration.
                </p>
                    </>
                ) : null}

            </div>
        </div>
    );
};

export default LoginPage;

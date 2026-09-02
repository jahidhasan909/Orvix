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
            callbackURL: "/dashboard",
        }, {
            onRequest: () => {
                setIsLoading(true);
            },
            onSuccess: () => {
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

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
            <div className="w-full max-w-md rounded-2xl bg-slate-900/60 p-8 shadow-xl backdrop-blur-xl border border-slate-800">
                
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
                    <p className="text-sm text-slate-400 mt-2">Log in using Better Auth & HeroUI</p>
                </div>

                {authError && (
                    <div className="mb-4 rounded-xl bg-danger-500/10 border border-danger-500/30 p-3 text-center text-sm text-danger">
                        {authError}
                    </div>
                )}

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

                <p className="text-center text-sm text-slate-400 mt-6">
                    Dont have an account?{' '}
                    <Link href="/registration" size="sm" className="text-purple-400 font-medium">
                        Sign up
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default LoginPage;
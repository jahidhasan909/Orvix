"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { authClient } from "@/lib/auth-client";
import { homePath } from "@/lib/navigation";

const LOTTIE_SRC = "https://lottie.host/a87aa979-e336-4418-9b49-de3bd19f0ee9/IfQw4w5Qmm.lottie";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none focus:border-[#2176fe] focus:ring-2 focus:ring-[#2176fe]/20";

function BrandMark({ size = 44 }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/orvix-logo.png"
        alt="ORVIX"
        width={size}
        height={size}
        className="h-auto w-11 shrink-0"
        priority
      />
      <div className="min-w-0">
        <p className="truncate text-lg font-bold tracking-wide text-slate-900">ORVIX</p>
        <p className="truncate text-xs text-slate-500">NGO Operations</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setAuthError("");
    setIsLoading(true);

    await authClient.signOut().catch(() => {});

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (error) {
      setAuthError(error.message || "Login failed. Please check your credentials.");
      return;
    }

    const session = await authClient.getSession();
    window.location.href = homePath(session.data?.user);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <section className="relative flex flex-1 flex-col">
        <div className="absolute top-0 left-0 z-10 px-6 py-5 sm:px-8 sm:py-6">
          <BrandMark />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-24 sm:px-10">
          <div className="h-[min(420px,52vh)] w-full max-w-lg">
            <DotLottieReact src={LOTTIE_SRC} loop autoplay className="h-full w-full" />
          </div>
        </div>
      </section>

      <div className="hidden self-stretch border-l-4 border-dashed border-[#2176fe] lg:block" aria-hidden />
      <div className="border-t-4 border-dashed border-[#2176fe] lg:hidden" aria-hidden />

      <section className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-[min(560px,44%)] lg:shrink-0 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark size={36} />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to your ORVIX workspace.</p>
          </div>

          {authError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              {authError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email Address</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className={inputClass}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={isVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${inputClass} pr-10`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setIsVisible((open) => !open)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={isVisible ? "Hide password" : "Show password"}
                >
                  {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2176fe] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <span className="orvix-spinner orvix-spinner-on-dark" /> : null}
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";
const labelClass = "text-sm font-medium text-slate-800";

function secretFromTotpUri(uri) {
  try {
    return new URL(uri).searchParams.get("secret") || "";
  } catch {
    const match = String(uri).match(/[?&]secret=([^&]+)/i);
    return match ? decodeURIComponent(match[1]) : "";
  }
}

export default function MicrosoftAuthenticatorCard({ twoFactorEnabled }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(Boolean(twoFactorEnabled));

  const secret = secretFromTotpUri(totpURI);
  const qrSrc = totpURI
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&ecc=M&data=${encodeURIComponent(totpURI)}`
    : "";

  const startSetup = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const { data, error: enableError } = await authClient.twoFactor.enable({
      password,
      issuer: "ORVIX",
    });

    setBusy(false);

    if (enableError) {
      setError(enableError.message || "Could not start authenticator setup.");
      return;
    }

    setTotpURI(data?.totpURI || "");
    setBackupCodes(Array.isArray(data?.backupCodes) ? data.backupCodes : []);
    setPassword("");
  };

  const verifySetup = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const { error: verifyError } = await authClient.twoFactor.verifyTotp({
      code: code.replace(/\s/g, ""),
    });

    setBusy(false);

    if (verifyError) {
      setError(verifyError.message || "That code did not match. Try the latest one from the app.");
      return;
    }

    setEnabled(true);
    setTotpURI("");
    setBackupCodes([]);
    setCode("");
  };

  const disable = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const { error: disableError } = await authClient.twoFactor.disable({ password });

    setBusy(false);

    if (disableError) {
      setError(disableError.message || "Could not turn off authenticator.");
      return;
    }

    setEnabled(false);
    setPassword("");
    setTotpURI("");
    setBackupCodes([]);
    setCode("");
  };

  return (
    <section className="rounded-2xl border border-[#2075fe]/20 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold tracking-[0.14em] text-[#2075fe] uppercase">
        Microsoft Authenticator / MFA
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {enabled
          ? "Microsoft Authenticator is connected on this account. Login still uses email and password only."
          : totpURI
            ? "Scan the QR code in Microsoft Authenticator, then enter the 6-digit code to finish setup."
            : "Set up Microsoft Authenticator on this account. It is managed here in the app and is not required at login."}
      </p>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {enabled ? (
        <form onSubmit={disable} className="mt-4 max-w-sm space-y-3">
          <label className="block">
            <span className={labelClass}>Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy ? "Turning off…" : "Turn off authenticator"}
          </button>
        </form>
      ) : totpURI ? (
        <div className="mt-4 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {qrSrc ? (
              <img
                src={qrSrc}
                alt="Microsoft Authenticator QR code"
                width={220}
                height={220}
                className="rounded-xl border border-slate-200 bg-white p-2"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className={labelClass}>Or enter this key manually</p>
              <p className="mt-1.5 break-all rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900">
                {secret || totpURI}
              </p>
              {backupCodes.length ? (
                <div className="mt-4">
                  <p className={labelClass}>Backup codes (save these now)</p>
                  <ul className="mt-1.5 grid grid-cols-2 gap-1.5 font-mono text-xs text-slate-700">
                    {backupCodes.map((item) => (
                      <li key={item} className="rounded bg-slate-50 px-2 py-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <form onSubmit={verifySetup} className="max-w-sm space-y-3">
            <label className="block">
              <span className={labelClass}>6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={8}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className={inputClass}
                placeholder="000000"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify and enable"}
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={startSetup} className="mt-4 max-w-sm space-y-3">
          <label className="block">
            <span className={labelClass}>Confirm your password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
          >
            {busy ? "Starting…" : "Set up Microsoft Authenticator"}
          </button>
        </form>
      )}
    </section>
  );
}

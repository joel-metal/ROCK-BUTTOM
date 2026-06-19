"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { GraduationCap, Award, ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState, NoCampaignsIllustration } from "@/components/ui/EmptyState";
import { ALL_CAMPAIGNS } from "@/lib/campaigns";
import type { Campaign } from "@/types/campaign";

// ── Helpers ─────────────────────────────────────────────────────────────────

const EDUCATION_CATEGORY = "education";

function formatAmount(xlm: number): string {
  return `${xlm.toLocaleString(undefined, { maximumFractionDigits: 0 })} XLM`;
}

function progressPct(c: Campaign): number {
  if (c.goal <= 0) return 0;
  return Math.min(100, Math.round((c.raised / c.goal) * 100));
}

// ── On-chain contracts that back this surface ────────────────────────────────
// These are the Soroban contracts (contracts/scholarship_fund, contracts/grants)
// inherited from Rock-Buttom, funded by the crowdfunding engine from Rock-Buttom.
const ON_CHAIN_BACKING = [
  {
    name: "scholarship_fund",
    blurb: "Holds raised funds and disburses scholarships to approved students.",
  },
  {
    name: "grants",
    blurb: "Milestone-based grants for educational and vocational programs.",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ScholarshipsPage() {
  const educationCampaigns = useMemo(
    () => ALL_CAMPAIGNS.filter((c) => c.category === EDUCATION_CATEGORY),
    [],
  );

  const totalRaised = useMemo(
    () => educationCampaigns.reduce((sum, c) => sum + c.raised, 0),
    [educationCampaigns],
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <Navbar />

      {/* Hero — the thesis of the merge */}
      <header className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-emerald-500/10" />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
            <GraduationCap className="h-3.5 w-3.5" />
            Crowdfunding that powers education
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Fund scholarships &amp; grants, on-chain.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
            Every campaign here routes contributions into Stellar smart contracts
            that issue verifiable credentials and release scholarship funds when
            goals are met — the bridge between Rock-Buttom and Rock-Buttom.
          </p>

          <dl className="mt-8 flex flex-wrap gap-8">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                Education campaigns
              </dt>
              <dd className="text-2xl font-semibold">{educationCampaigns.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                Raised so far
              </dt>
              <dd className="text-2xl font-semibold">{formatAmount(totalRaised)}</dd>
            </div>
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* On-chain backing band */}
        <section className="mb-12 grid gap-4 sm:grid-cols-2">
          {ON_CHAIN_BACKING.map((contract) => (
            <div
              key={contract.name}
              className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-mono text-sm font-semibold">
                  contracts/{contract.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {contract.blurb}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Campaign grid */}
        <div className="mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold">Open education causes</h2>
        </div>

        {educationCampaigns.length === 0 ? (
          <EmptyState
            title="No education campaigns yet"
            description="Be the first to launch a scholarship or grant campaign."
            illustration={<NoCampaignsIllustration />}
          />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {educationCampaigns.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/campaigns/${c.contractId}`}
                  className="group flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-indigo-500/50"
                >
                  <h3 className="text-lg font-semibold group-hover:text-indigo-400">
                    {c.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                    {c.description}
                  </p>

                  <div className="mt-4">
                    <ProgressBar progress={progressPct(c)} />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium">{formatAmount(c.raised)}</span>
                    <span className="text-[var(--color-text-muted)]">
                      of {formatAmount(c.goal)}
                    </span>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-400">
                    Contribute
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

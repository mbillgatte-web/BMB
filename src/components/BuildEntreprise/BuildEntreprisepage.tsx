"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import EntrepriseForm from "@/components/BuildEntreprise/EntrepriseForm";

export default function CreateEntreprise() {
  return (
    <div className="bg-background text-on-background antialiased flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F9FAFB] relative">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-2xl">
          <div className="max-w-[840px] mx-auto flex flex-col gap-lg pb-12">
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-headline-lg text-[36px] font-extrabold text-on-surface mb-2 tracking-tight">
                Configuration de l'espace
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Laissez-vous guider par notre IA pour poser les fondations de votre projet.
              </p>
            </div>

            {/* Form Card */}
            <div className="relative overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-[0_18px_45px_rgb(27,27,35,0.08)]">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
              <EntrepriseForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


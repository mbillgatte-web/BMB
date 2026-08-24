import React, { FormEvent } from "react";
import FormInput from "./FormInput";

interface FounderInfoFormProps {
  onNext?: () => void;
}

export default function FounderInfoForm({ onNext }: FounderInfoFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Ici tu peux récupérer les données avec FormData ou React Hook Form
    onNext?.();
  };

  return (
    <form onSubmit={handleSubmit} className="form-shell space-y-0">
      <section className="form-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <div className="min-w-0">
            <p className="mb-1 font-label-md text-label-md uppercase text-primary">
              Étape 1 sur 4
            </p>
            <h3 className="font-headline-md text-[22px] font-bold text-on-surface">
              Informations du Fondateur
            </h3>
            <p className="font-body-sm text-outline">
              Vos coordonnées principales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <FormInput
            id="fullName"
            name="fullName"
            label="Nom complet"
            placeholder="Ex: Jean Dupont"
            icon="badge"
            required
          />
          <FormInput
            id="email"
            name="email"
            label="Email professionnel"
            type="email"
            placeholder="jean@exemple.com"
            icon="mail"
            required
          />
          <FormInput
            id="phone"
            name="phone"
            label="Téléphone"
            type="tel"
            placeholder="+237 XXX XXX XXX"
            icon="call"
          />
          <FormInput
            id="address"
            name="address"
            label="Adresse personnelle"
            placeholder="Quartier, Ville"
            icon="home_pin"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="form-actions flex items-center justify-between pt-8 mt-8 border-t border-outline-variant/30">
        <button
          type="button"
          disabled
          className="text-on-surface-variant font-label-md text-label-md hover:text-on-surface transition-colors flex items-center gap-2 px-4 py-2 opacity-50 cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Précédent
        </button>

        <button
          type="submit"
          className="group bg-primary text-white font-label-md text-label-md rounded-xl px-8 py-3.5 shadow-[0_8px_20px_rgb(70,72,212,0.22)] hover:bg-primary/90 hover:shadow-[0_12px_24px_rgb(70,72,212,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2"
        >
          Étape suivante
          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </form>
  );
}
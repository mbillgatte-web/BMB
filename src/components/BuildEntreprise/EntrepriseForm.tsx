"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { supabase } from "@/lib/supabaseClient";

const SECTEURS = [
  { value: "commerce", label: "Commerce & vente" },
  { value: "technologie", label: "Technologie & Numérique" },
  { value: "education", label: "Éducation & Formation" },
  { value: "Restaurant", label: "Restaurant et Consomation" },
  { value: "Beauté", label: "Beauté cosmetique" },
  { value: "autre", label: "Autre" },
];

export default function EntrepriseForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [secteur, setSecteur] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // getSession() (et pas seulement getUser()) car on a aussi besoin du
    // access_token : c'est lui qui prouve à Supabase, côté serveur, qui
    // est en train de faire la requête (nécessaire pour que la policy RLS
    // "auth.uid() = compte_id" passe dans route.ts).
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      setError("Vous devez être connecté pour créer une entreprise.");
      return;
    }

    // On envoie ici les 5 states du formulaire + l'id de l'utilisateur
    // connecté. Les clés de cet objet (fullName, slogan, ...) sont celles
    // que route.ts va lire via `await request.json()` — elles doivent donc
    // rester identiques aux noms utilisés côté route.ts, mais elles n'ont
    // PAS besoin de correspondre aux noms des colonnes en base (c'est
    // route.ts qui fait la conversion vers les colonnes réelles).
    const res = await fetch("/api/entreprise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Le token de l'utilisateur connecté : route.ts s'en sert pour
        // s'authentifier auprès de Supabase avant d'insérer, sinon la
        // policy RLS voit un utilisateur anonyme et bloque l'insertion.
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        fullName,                 // state "Nom de l'entreprise"
        slogan,                   // state "Slogan"
        secteur,                  // state "Secteur d'activité" (valeur du <select>)
        phone,                    // state "Téléphone"
        address,                  // state "Adresse de l'entreprise"
        compteId: session.user.id, // id du compte connecté (table auth.users de Supabase)
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création de l'entreprise");
      return;
    }

    router.push("/PaletteColor");
  };

  return (
    <form onSubmit={handleSubmit} className="form-shell space-y-0">
      <section className="form-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-md text-[22px] font-bold text-on-surface">
              Informations sur l'entreprise
            </h3>
            <p className="font-body-sm text-outline">
              Les informations générales de votre entreprise
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="md:col-span-2">
            <FormInput
              id="fullName"
              name="fullName"
              label="Nom de l'entreprise"
              placeholder="Ex: BMB"
              icon="storefront"
              hint="Le nom officiel ou commercial de votre entreprise"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <FormInput
              id="slogan"
              name="slogan"
              label="Slogan"
              type="text"
              placeholder="Ex: Bâtir mieux, ensemble"
              icon="campaign"
              hint="Une phrase courte qui résume votre activité"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              required
            />
          </div>

          <FormSelect
            id="secteur"
            name="secteur"
            label="Secteur d'activité"
            placeholder="Sélectionnez un secteur"
            icon="category"
            hint="Le domaine principal de votre activité"
            options={SECTEURS}
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
          />

          <FormInput
            id="phone"
            name="phone"
            label="Téléphone"
            type="tel"
            placeholder="+237 6XX XXX XXX"
            icon="call"
            hint="Format international recommandé"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="md:col-span-2">
            <FormInput
              id="address"
              name="address"
              label="Adresse de l'entreprise"
              placeholder="Quartier, Ville"
              icon="location_on"
              hint="Quartier, ville, et pays si nécessaire"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="mt-6 font-body-sm text-body-sm text-red-600">{error}</p>
        )}
      </section>

      {/* Actions */}
      <div className="form-actions flex items-center justify-end pt-8 mt-8 border-t border-outline-variant/30">
        <button
          type="submit"
          disabled={loading}
          className="group bg-primary text-white font-label-md text-label-md rounded-xl px-8 py-3.5 shadow-[0_8px_20px_rgb(70,72,212,0.22)] hover:bg-primary/90 hover:shadow-[0_12px_24px_rgb(70,72,212,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? "Création en cours..." : "Créer mon entreprise"}
          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </form>
  );
}

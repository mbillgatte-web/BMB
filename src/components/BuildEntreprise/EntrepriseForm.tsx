"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, MapPin, Megaphone, Phone, Store } from "lucide-react";
import Button from "@/components/ui/Button";
import { FormError, SelectField, TextField } from "@/components/ui/Field";
import { supabase } from "@/lib/supabase/browser";
import { SECTEURS } from "@/data/entreprise";

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

        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        fullName, // state "Nom de l'entreprise"
        slogan, // state "Slogan"
        secteur, // state "Secteur d'activité" (valeur du <select>)
        phone, // state "Téléphone"
        address, // state "Adresse de l'entreprise"
        compteId: session.user.id, // id du compte connecté (table auth.users de Supabase)
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création de l'entreprise");
      return;
    }

    // data.entreprise = la ligne insérée renvoyée par route.ts. Un compte
    // pouvant posséder plusieurs entreprises, on précise explicitement
    // laquelle dans l'URL (celle qu'on vient de créer) : useEntrepriseId()
    // la lira en priorité, sans avoir à deviner parmi les entreprises du
    // compte (voir src/hooks/useEntrepriseId.ts).
    router.push(`/PaletteColor?entrepriseId=${data.entreprise.id}`);
  };

  return (
    // Deux groupes (identité, coordonnées) qui arrivent en cascade à la
    // suite de l'en-tête de page (--cascade-depart).
    <form
      onSubmit={handleSubmit}
      className="cascade-floue [--cascade-depart:200ms]"
    >
      <fieldset className="space-y-5">
        <GroupeTitre
          titre="Identité"
          detail="Ces trois informations apparaîtront sur votre logo, votre site et vos visuels."
        />

        <TextField
          label="Nom de l'entreprise"
          icon={Store}
          name="fullName"
          placeholder="Ex. : Boulangerie Mbeng"
          autoComplete="organization"
          hint="Le nom officiel ou commercial, tel que vos clients le connaissent."
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <TextField
          label="Slogan"
          icon={Megaphone}
          type="text"
          name="slogan"
          placeholder="Ex. : Du pain chaud dès 6 h"
          hint="Une phrase courte qui dit ce que vous faites."
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          required
        />

        <SelectField
          label="Secteur d'activité"
          icon={LayoutGrid}
          name="secteur"
          placeholder="Choisissez un secteur"
          hint="Le domaine principal : il oriente les couleurs et les polices proposées ensuite."
          options={SECTEURS}
          value={secteur}
          onChange={(e) => setSecteur(e.target.value)}
        />
      </fieldset>

      {/* Le filet et le retrait sont sur un div : posés sur le fieldset, le
          padding s'intercalerait entre la légende et les champs. */}
      <div className="mt-9 border-t border-outline-variant/60 pt-7">
        <fieldset className="space-y-5">
          <GroupeTitre
            titre="Coordonnées"
            detail="Elles seront reprises sur votre site et vos visuels. Vous pourrez les compléter plus tard."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Téléphone"
              icon={Phone}
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+237 6XX XXX XXX"
              labelAside={<Facultatif />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <TextField
              label="Adresse"
              icon={MapPin}
              name="address"
              autoComplete="street-address"
              placeholder="Quartier, ville"
              labelAside={<Facultatif />}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </fieldset>
      </div>

      {error && (
        <div className="mt-6">
          <FormError>{error}</FormError>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 border-t border-outline-variant/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-snug text-on-surface-variant">
          Étape suivante : le choix de vos couleurs.
        </p>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Création en cours…" : "Créer mon entreprise"}
        </Button>
      </div>
    </form>
  );
}

/** Sous-titre d'un groupe de champs : titre noir semi-gras, précision en dessous. */
function GroupeTitre({ titre, detail }: { titre: string; detail: string }) {
  return (
    <legend className="block">
      <span className="block text-[17px] font-semibold leading-tight tracking-[-0.01em] text-on-surface">
        {titre}
      </span>
      <span className="mt-1 block text-sm leading-relaxed text-on-surface-variant">
        {detail}
      </span>
    </legend>
  );
}

function Facultatif() {
  return (
    <span className="text-[13px] text-on-surface-variant">Facultatif</span>
  );
}

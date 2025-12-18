import { useEffect, useMemo, useState } from "react";
import { Modal } from "./Modal";
import { Plus, X } from "lucide-react";
import { Toast } from "../Toast";
import type { Client, ClientContact } from "../../types";
import type { ClientUpsertInput } from "../../api/clients";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: ClientUpsertInput) => void;
  client?: Client;
}

const emptyContact = (): Omit<ClientContact, "id"> => ({
  name: "",
  role: "",
  email: "",
  phone: "",
});

export function ManageClientModal({ isOpen, onClose, onSave, client }: Props) {
  const [name, setName] = useState(client?.name ?? "");
  const [address, setAddress] = useState(client?.address ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [tier, setTier] = useState<ClientUpsertInput["tier"]>(client?.tier ?? "Tier 3");

  const [contacts, setContacts] = useState<Omit<ClientContact, "id">[]>(
    (client?.contacts ?? []).map((c) => ({
      name: c.name ?? "",
      role: c.role ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
    }))
  );

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(client?.name ?? "");
    setAddress(client?.address ?? "");
    setPhone(client?.phone ?? "");
    setTier(client?.tier ?? "Tier 3");
    setContacts(
      (client?.contacts ?? []).map((c) => ({
        name: c.name ?? "",
        role: c.role ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
      }))
    );
  }, [isOpen, client]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (contacts.some((c) => !c.name.trim())) return false;
    return true;
  }, [name, contacts]);

  const addContact = () => setContacts((p) => [...p, emptyContact()]);
  const removeContact = (idx: number) => setContacts((p) => p.filter((_, i) => i !== idx));
  const updateContact = (idx: number, patch: Partial<Omit<ClientContact, "id">>) => {
    setContacts((p) => p.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedContacts = contacts
      .map((c) => ({
        name: c.name.trim(),
        role: (c.role ?? "").trim(),
        email: (c.email ?? "").trim(),
        phone: (c.phone ?? "").trim(),
      }))
      .filter((c) => c.name);

    onSave({
      name: name.trim(),
      address: address ?? "",
      phone: phone ?? "",
      tier,
      contacts: cleanedContacts.map((c) => ({ id: "", ...c })) as any,
    });

    setShowToast(true);
    setTimeout(() => onClose(), 700);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={client ? "Modifier le client" : "Créer un client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Numéro client : affichage uniquement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Numéro client</label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                {client ? client.clientNumber : "Automatique"}
              </div>
              <div className="text-xs text-gray-500 mt-1">Généré automatiquement. Non modifiable.</div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Tier *</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as ClientUpsertInput["tier"])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Tier 3">Tier 3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom du client"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adresse complète"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Téléphone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+33 ..."
            />
          </div>

          {/* Contacts */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700">Contacts</label>
              <button
                type="button"
                onClick={addContact}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un contact
              </button>
            </div>

            {contacts.length === 0 ? (
              <div className="text-sm text-gray-500">Aucun contact</div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm text-gray-700">Contact #{idx + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeContact(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Nom *</label>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => updateContact(idx, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Prénom Nom"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Rôle</label>
                        <input
                          type="text"
                          value={c.role}
                          onChange={(e) => updateContact(idx, { role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="DSI, RH, Achats…"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={c.email}
                          onChange={(e) => updateContact(idx, { email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="contact@client.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
                        <input
                          type="text"
                          value={c.phone}
                          onChange={(e) => updateContact(idx, { phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+33 ..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {client ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast message={client ? "Client mis à jour" : "Client créé"} type="success" onClose={() => setShowToast(false)} />
      )}
    </>
  );
}

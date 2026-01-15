"use client"

import React, { useEffect, useState } from 'react'
import DepartmentSelect from '@/components/DepartmentSelect'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  initial?: any
  departments?: string[]
}

const defaultForm = {
  matricule: '',
  name: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  status: 'Actif',
  joinDate: '',
  avatarColor: '',
  performance: 0,
  projects: 0,
  salary: 0,
  sex: ''
}

export default function PersonnelFormModal({ open, onClose, onSave, initial = {}, departments = [] }: Props) {
  const [form, setForm] = useState({ ...defaultForm })

  useEffect(() => {
    // merge defaults with initial to avoid retaining stale values
    setForm({ ...defaultForm, ...initial })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  function change(k: string, v: any) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    // ensure numeric salary
    const payload = { ...form, salary: Number(form.salary || 0) }
    onSave(payload)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={save} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{initial?.id ? 'Modifier Employé' : 'Nouvel Employé'}</h3>
          <button type="button" onClick={onClose} className="text-gray-600">Fermer</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.matricule} onChange={(e) => change('matricule', e.target.value)} placeholder="Matricule" className="input" />
          <input value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="Nom complet" className="input" />
          <input value={form.email} onChange={(e) => change('email', e.target.value)} placeholder="Email" className="input" />
          <input value={form.phone} onChange={(e) => change('phone', e.target.value)} placeholder="Téléphone" className="input" />
          <input value={form.position} onChange={(e) => change('position', e.target.value)} placeholder="Poste" className="input" />
          <DepartmentSelect value={form.department} onChange={(v) => change('department', v)} options={departments} />
          <select value={form.status} onChange={(e) => change('status', e.target.value)} className="input">
            <option value="Actif">Actif</option>
            <option value="Congé">Congé</option>
            <option value="Arrêt maladie">Arrêt maladie</option>
            <option value="Formation">Formation</option>
          </select>
          <input type="date" value={form.joinDate} onChange={(e) => change('joinDate', e.target.value)} className="input" />

          {/* New fields: sex and salary */}
          <select value={form.sex} onChange={(e) => change('sex', e.target.value)} className="input">
            <option value="">Sexe</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
            <option value="Autre">Autre</option>
          </select>
          <input type="number" value={form.salary as any} onChange={(e) => change('salary', e.target.value)} placeholder="Salaire de base" className="input" />

        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Annuler</button>
          <button type="submit" className="px-3 py-2 rounded bg-orange-500 text-white">Enregistrer</button>
        </div>
      </form>
    </div>
  )
}

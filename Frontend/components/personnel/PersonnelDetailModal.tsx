"use client"
import React from 'react'

export default function PersonnelDetailModal({ open, onClose, person }: { open: boolean, onClose: () => void, person?: any }) {
  if (!open || !person) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${person.avatarColor || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
            <span className="text-white font-bold text-xl">{person.name?.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">{person.name}</h3>
            <p className="text-sm text-gray-500">{person.position}</p>
            <p className="text-xs text-gray-400">Matricule: {person.matricule}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div><strong>Email:</strong> {person.email}</div>
          <div><strong>Téléphone:</strong> {person.phone}</div>
          <div><strong>Département:</strong> {person.department}</div>
          <div><strong>Statut:</strong> {person.status}</div>
          <div><strong>Date entrée:</strong> {person.joinDate}</div>
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-2 rounded border">Fermer</button>
        </div>
      </div>
    </div>
  )
}

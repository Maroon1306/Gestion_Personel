"use client"
import React from 'react'

export default function ConfirmDeleteModal({ open, onClose, onConfirm, name }: { open: boolean, onClose: () => void, onConfirm: () => void, name?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg p-4">
        <h3 className="font-bold mb-2">Confirmer la suppression</h3>
        <p className="text-sm text-gray-600 mb-4">Voulez-vous vraiment supprimer {name || 'cet employé'} ? Cette action est irréversible.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">Annuler</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded bg-rose-600 text-white">Supprimer</button>
        </div>
      </div>
    </div>
  )
}

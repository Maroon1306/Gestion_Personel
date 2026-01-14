"use client"
import React from 'react'

const DEPARTMENTS = [
  'Distribution et Production Électricité',
  'Distribution et Production Eau',
  'Vente',
  'Finance et Contrôle de Gestion',
  'Support Administratif et du Capital Humain',
  'Médecin Responsable Régional'
]

type Props = {
  value?: string
  onChange?: (v: string) => void
  name?: string
  className?: string
  label?: string
}

export default function DepartmentSelect({ 
  value, 
  onChange, 
  name = 'department', 
  className = '',
  label = "Département"
}: Props) {
  const departmentColors: Record<string, string> = {
    'Distribution et Production Électricité': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    'Distribution et Production Eau': 'text-cyan-700 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300',
    'Vente': 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Finance et Contrôle de Gestion': 'text-violet-700 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300',
    'Support Administratif et du Capital Humain': 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
    'Médecin Responsable Régional': 'text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300',
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
                 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                 transition-all duration-200 appearance-none cursor-pointer"
      >
        <option value="" className="text-gray-500">Sélectionner un département</option>
        {DEPARTMENTS.map((d) => (
          <option 
            key={d} 
            value={d}
            className={`${departmentColors[d]} py-2`}
          >
            {d}
          </option>
        ))}
      </select>
      {value && value in departmentColors && (
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${departmentColors[value]}`}>
            {value}
          </span>
        </div>
      )}
    </div>
  )
}
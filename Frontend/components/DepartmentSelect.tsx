"use client"
import React from 'react'

// Définition des départements disponibles
const DEPARTMENTS = [
  'Distribution et Production Électricité',
  'Distribution et Production Eau',
  'Vente',
  'Finance et Contrôle de Gestion',
  'Support Administratif et du Capital Humain',
  'Médecin Responsable Régional'
] as const

// Type TypeScript pour les départements
type Department = typeof DEPARTMENTS[number]

// Props du composant
type DepartmentSelectProps = {
  value?: string
  onChange?: (v: string) => void
  name?: string
  className?: string
  label?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  options?: string[]
}

export default function DepartmentSelect({
  value = "",
  onChange,
  name = 'department',
  className = '',
  label = "Département",
  required = false,
  placeholder = "Sélectionner un département",
  disabled = false,
  options
}: DepartmentSelectProps) {

  // Couleurs pour chaque département (pour l'option sélectionnée)
  const departmentColors: Record<string, string> = {
    'Distribution et Production Électricité': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    'Distribution et Production Eau': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    'Vente': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    'Finance et Contrôle de Gestion': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    'Support Administratif et du Capital Humain': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    'Médecin Responsable Régional': 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
  }

  // Use passed options or default constant
  // We cast DEPARTMENTS to generic string[] for compatibility with mixed sources
  const effectiveDepartments: string[] = options || [...DEPARTMENTS];

  // Vérifie si la valeur sélectionnée est un département valide
  const isValidDepartment = value ? effectiveDepartments.includes(value) : false

  // Gestion du changement de sélection
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(event.target.value)
    }
  }

  // Default color style if not in known map
  const getColorClass = (dept: string) => {
    return departmentColors[dept] || 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
  }

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium mb-2 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Sélecteur */}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border 
            ${disabled
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer'
            }
            transition-all duration-200 
            appearance-none
            focus:outline-none
            ${!value ? 'text-gray-500 dark:text-gray-400' : ''}
          `}
        >
          {/* Option par défaut */}
          <option value="" className="text-gray-500 dark:text-gray-400">
            {placeholder}
          </option>

          {/* Options des départements */}
          {effectiveDepartments.map((dept) => (
            <option
              key={dept}
              value={dept}
              className={`${getColorClass(dept)} py-2`}
            >
              {dept}
            </option>
          ))}
        </select>

        {/* Icône de flèche */}
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {/* Affichage du département sélectionné avec sa couleur */}
      {value && isValidDepartment && (
        <div className="mt-3 animate-fadeIn">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getColorClass(value)}`}>
            <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>
            {value}
          </span>
        </div>
      )}

      {/* Message d'avertissement si la valeur n'est pas valide */}
      {value && !isValidDepartment && (
        <div className="mt-2 flex items-center text-amber-600 dark:text-amber-400 text-sm animate-fadeIn">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Attention : Ce département n'existe pas dans la liste
        </div>
      )}
    </div>
  )
}
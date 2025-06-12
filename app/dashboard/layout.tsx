"use client";

import React from "react";
import Link from "next/link";
import {
  FolderIcon,
  ScaleIcon,
  ChartBarSquareIcon,
  DocumentTextIcon,
  UsersIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

/**
 * Dashboard Layout Component
 * Provides navigation and layout for all dashboard pages
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = [
    {
      name: "Gestión de Datasets",
      href: "/dashboard/datasets",
      icon: FolderIcon,
      description: "Subir y visualizar datasets",
    },
    {
      name: "Balanceo de Datos",
      href: "/dashboard/balance",
      icon: ScaleIcon,
      description: "Aplicar algoritmo SMOTE",
    },
    {
      name: "Clasificación",
      href: "/dashboard/classify",
      icon: ChartBarSquareIcon,
      description: "Clasificar pacientes",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BeakerIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">OncoDiag</h1>
              <span className="ml-2 text-sm text-gray-500">
                Diagnóstico Asistido de Cáncer
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <UsersIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-700">Especialista</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 mr-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Herramientas
              </h2>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Estado del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">TensorFlow.js</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Conectado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

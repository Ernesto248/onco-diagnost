"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderIcon,
  ScaleIcon,
  ChartBarSquareIcon,
  UsersIcon,
  BeakerIcon,
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AuthGuard from "../components/AuthGuard";

/**
 * Dashboard Layout Component
 * Provides navigation and layout for all dashboard pages
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Datasets",
      href: "/dashboard/datasets",
      icon: FolderIcon,
      description: "Gestionar datos",
    },
    {
      name: "Balancear",
      href: "/dashboard/balance",
      icon: ScaleIcon,
      description: "Algoritmo SMOTE",
    },
    {
      name: "Entrenar",
      href: "/dashboard/train",
      icon: AcademicCapIcon,
      description: "Modelos ML",
    },
    {
      name: "Clasificar",
      href: "/dashboard/classify",
      icon: ChartBarSquareIcon,
      description: "Diagnosticar",
    },
  ];
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </div>
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center">
              <BeakerIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">
                OncoDiag
              </span>
            </div>{" "}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              aria-label="Cerrar menú"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-6 px-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-3 mb-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:block">
          <div className="flex items-center h-16 px-6 border-b">
            <BeakerIcon className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-semibold text-gray-900">
              OncoDiag
            </span>
            <span className="ml-2 text-xs text-gray-500 hidden xl:block">
              Diagnóstico IA
            </span>
          </div>
          <nav className="mt-6 px-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 mb-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 hidden xl:block">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Stats */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-900 mb-2">Estado</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">TensorFlow.js</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    ✓
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">API</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top navigation bar */}
        <div className="lg:pl-64">
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <div className="flex items-center">
                {" "}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
                  aria-label="Abrir menú"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="lg:hidden ml-2 flex items-center">
                  <BeakerIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    OncoDiag
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UsersIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700 hidden sm:block">
                  Especialista
                </span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

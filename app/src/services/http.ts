/**
 * Client Axios partagé pour le backend réel.
 * - baseURL issue d'une variable d'environnement unique (EXPO_PUBLIC_API_URL).
 * - jeton Bearer ajouté automatiquement à chaque requête si connecté.
 * - toutes les erreurs sont normalisées en ApiError.
 */
import axios, { AxiosError } from "axios";

import type { ApiError } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL, HTTP_TIMEOUT_MS } from "./config";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// En-tête Authorization : Bearer <token> si l'utilisateur est connecté.
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalisation des erreurs + déconnexion sur 401.
httpClient.interceptors.response.use(
  (reponse) => reponse,
  (erreur: AxiosError<Partial<ApiError>>) => {
    if (erreur.response?.status === 401) {
      useAuthStore.getState().deconnecter();
    }

    const donnees = erreur.response?.data;
    if (donnees?.code) {
      return Promise.reject<ApiError>({
        code: donnees.code,
        message: donnees.message ?? erreur.message,
        details: donnees.details,
      });
    }

    return Promise.reject<ApiError>({
      code: erreur.code === "ECONNABORTED" ? "timeout" : "network_error",
      message: erreur.message,
    });
  },
);

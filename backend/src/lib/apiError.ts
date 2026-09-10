/** Erreur API typée — voir la forme ApiError dans types.ts / app/src/types/api.ts. */
export class ApiErrorHttp extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

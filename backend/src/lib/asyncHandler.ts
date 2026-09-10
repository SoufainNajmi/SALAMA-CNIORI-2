/**
 * Express 4 ne route pas automatiquement les rejets de promesses des
 * handlers async vers le middleware d'erreur — sans ce wrapper, une requête
 * en échec resterait bloquée sans réponse au lieu de renvoyer une 500.
 */
import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

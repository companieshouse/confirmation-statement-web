import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

export function savePreviousPageInSession(req: Request): string {
  const referer = req.headers.referer || "/";
  const url = new URL(referer, `http://${req.headers.host}`);
  url.searchParams.delete("lang");
  const previousPage = url.pathname;
  req.session?.setExtraData("previous-page", previousPage); 
  return previousPage; 
}

export function getPreviousPageFromSession(session: Session): string {
  const previousPage = session?.getExtraData("previous-page") as string | undefined; 
  if (previousPage !== undefined && typeof previousPage === 'string') {return previousPage;}

  throw new Error(`Cannot find url of page to return user to.`);  
}
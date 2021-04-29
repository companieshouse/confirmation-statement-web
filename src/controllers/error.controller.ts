import { Request, Response } from "express";
import { Templates } from "../types/template.paths";

const pageNotFound = (req: Request, res: Response) => {
  return res.status(404).render(Templates.ERROR_404);
};

export default pageNotFound;

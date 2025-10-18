import { HttpError } from "http-errors";

export const errorHandler = (err, req, res, next) => {

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }


  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
};

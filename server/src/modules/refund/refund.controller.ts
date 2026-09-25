import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  processRefund,
} from "./refund.service.ts";

import {
  validateCreateRefundInput,
} from "../../validators/refund.validator.ts";

export async function createRefund(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //  1. Validate HTTP input.
    const validation =
      validateCreateRefundInput(req.body);

    if (!validation.valid || !validation.data) {
      return res.status(400).json({
        success: false,
        message:
          validation.message ??
          "Invalid refund request.",
      });
    }

    //  2. Process refund.
    const refund =
      await processRefund(
        validation.data
      );

    //  3. Return final result.
    return res.status(201).json({
      success: true,
      message:
        "Refund request processed successfully.",
      data: {
        refund,
      },
    });
  } catch (error) {
    next(error);
  }
}
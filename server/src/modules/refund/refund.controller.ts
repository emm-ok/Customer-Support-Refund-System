import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  processRefund,
} from "./refund.service.js";

import {
  validateCreateRefundInput,
} from "../../validators/refund.validator.js";

export async function createRefund(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //  1. Validate HTTP input.
    console.log("Refund Request started");
    const validation =
    validateCreateRefundInput(req.body);
    console.log("Validation");

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
    console.log("Refund", refund);


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
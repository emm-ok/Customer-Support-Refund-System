import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

// POST /api/customers/identify

// Checks whether a customer exists using their email.
// This is just an identity lookup, NOT full authentication.

export const identifyCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;

        // Validate input

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        // Find customer

        const customer = await prisma.customer.findUnique({
            where: {
                email: normalizedEmail,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        // Customer does not exist

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "We could not find a customer account associated with this email address.",
            });
        }

        // Customer exists

        return res.status(200).json({
            success: true,
            message: "Customer identified successfully.",
            data: {
                customer,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/customers/:customerId/orders

// Fetches all orders belonging to a customer.
export const getCustomerOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { customerId } = req.params;

        // Validate customer ID

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required.",
            });
        }

        // Verify customer exists

        const customer = await prisma.customer.findUnique({
            where: {
                id: customerId as string,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
        }

        // Fetch orders

        const orders = await prisma.order.findMany({
            where: {
                customerId: customer.id,
            },

            orderBy: {
                orderedAt: "desc",
            },

            select: {
                id: true,
                orderNumber: true,
                status: true,
                totalAmount: true,
                currency: true,
                orderedAt: true,
                deliveredAt: true,

                items: {
                    select: {
                        id: true,
                        productName: true,
                        quantity: true,
                        unitPrice: true,
                        isFinalSale: true,
                    },
                },
            },
        });

        // Return orders

        return res.status(200).json({
            success: true,
            data: {
                customer,
                orders,
                count: orders.length,
            },
        });
    } catch (error) {
        next(error);
    }
};
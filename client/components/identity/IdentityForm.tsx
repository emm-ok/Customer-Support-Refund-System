"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

import { useIdentifyCustomer } from "@/hooks/useIdentifyCustomer";
import { ApiErrorResponse } from "@/types/customer";
import { saveCustomerSession } from "@/lib/customer-session";

export default function IdentityForm() {
    const router = useRouter();

    const emails = ["john.doe@example.com", "jane.smith@example.com"]

    const [email, setEmail] = useState("");
    const [validationError, setValidationError] = useState("");

    const identifyMutation = useIdentifyCustomer();

    const validateEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();

        setValidationError("");

        if (!normalizedEmail) {
            setValidationError("Please enter your email address.");
            return;
        }

        if (!validateEmail(normalizedEmail)) {
            setValidationError("Please enter a valid email address.");
            return;
        }

        identifyMutation.mutate(
            {
                email: normalizedEmail,
            },
            {
                onSuccess: (response) => {
                    const customer = response.data.customer;

                    //    Stores only the minimum context required for the next screen.
                    saveCustomerSession(customer);

                    router.push("/orders");
                },
            }
        );
    };

    const getErrorMessage = () => {
        if (!identifyMutation.error) return "";

        if (axios.isAxiosError<ApiErrorResponse>(identifyMutation.error)) {
            return (
                identifyMutation.error.response?.data?.message ??
                "We could not verify your account. Please try again."
            );
        }

        return "Something went wrong while verifying your account.";
    };

    const apiError = getErrorMessage();

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {(validationError || apiError) && (
                <Alert message={validationError || apiError} />
            )}

            <div className="relative">
                <div className="pointer-events-none absolute left-4 top-[42px] z-10">
                    <Mail className="h-5 w-5 text-slate-400" />
                </div>

                <Input
                    id="email"
                    type="email"
                    label="Email address"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);

                        if (validationError) {
                            setValidationError("");
                        }

                        if (identifyMutation.isError) {
                            identifyMutation.reset();
                        }
                    }}
                    className="pl-12"
                    disabled={identifyMutation.isPending}
                    aria-describedby="email-description"
                />
            </div>

            <p
                id="email-description"
                className="-mt-2 text-xs leading-5 text-slate-500"
            >
                Use the email address connected to your customer account.
            </p>

            <Button
                type="submit"
                loading={identifyMutation.isPending}
                disabled={!email.trim()}
            >
                {identifyMutation.isPending
                    ? "Verifying account..."
                    : "Continue"}

                {!identifyMutation.isPending && (
                    <ArrowRight className="h-4 w-4" />
                )}
            </Button>
            <h2 className="text-xl font-medium">Test Users</h2>
            <div className="space-y-4">
                {emails.map((mail) => (
                    <div
                        key={mail}
                        onClick={() => setEmail(mail)}
                        className={`
                            ${email === mail ? "bg-neutral-900 text-white" : ""}
                        w-full px-6 py-3 text-center 
                        font-medium border border-gray-300 
                        opacity-80 transition-all duration-200
                        bg-neutral-300 rounded-full cursor-pointer 
                        hover:opacity-90`}>
                        {mail}
                    </div>
                ))}
            </div>
        </form>
    );
}
import { OrderItem } from "@/types/customer";

interface OrderItemListProps {
  items: OrderItem[];
  currency: string;
}

function formatCurrency(
  amount: string | number,
  currency: string
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export default function OrderItemList({
  items,
  currency,
}: OrderItemListProps) {
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {item.productName}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>
                Qty {item.quantity}
              </span>

              {item.isFinalSale && (
                <>
                  <span>•</span>

                  <span className="text-amber-600">
                    Final sale
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="shrink-0 text-sm font-medium text-slate-700">
            {formatCurrency(item.unitPrice, currency)}
          </p>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PurchaseOrderForm } from "@/Components/Procurement/forms";

function emptyLine() {
  return { key: crypto.randomUUID(), itemId: "", quantity: 1, unitPrice: 0 };
}

export default function Page() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [lines, setLines] = useState([emptyLine()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/ngo/inventory/suppliers").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load suppliers.");
        return data.items ?? [];
      }),
      fetch("/api/ngo/inventory/items?status=active").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load inventory items.");
        return data.items ?? [];
      }),
    ])
      .then(([vendorRows, catalog]) => {
        setSuppliers(vendorRows);
        setItems(catalog);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const onSubmit = async (body) => {
    setError("");
    setSaving(true);
    const response = await fetch("/api/ngo/procurement/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the purchase order.");
      return;
    }
    router.push(`/purchases/orders/${data.item.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/purchases/orders" className="text-sm font-medium text-[#2075fe]">← Purchase orders</Link>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">New purchase order</h2>
      </div>
      <PurchaseOrderForm
        mode="create"
        suppliers={suppliers}
        items={items}
        lines={lines}
        onLinesChange={setLines}
        saving={saving}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => router.push("/purchases/orders")}
      />
    </div>
  );
}

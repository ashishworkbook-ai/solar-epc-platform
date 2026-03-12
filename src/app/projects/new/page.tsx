"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

const field = (label: string, name: string, type = "text", required = false) => ({ label, name, type, required });

const steps = [
  {
    title: "Customer Info",
    fields: [
      field("Customer Name", "customerName", "text", true),
      field("Mobile Number", "mobile", "tel"),
      field("Email", "email", "email"),
      field("Address", "address"),
      field("City", "city"),
      field("PIN Code", "pincode"),
    ],
  },
  {
    title: "Electricity Details",
    fields: [
      field("Consumer Number", "consumerNumber"),
      field("Sanctioned Load (kW)", "sanctionedLoad", "number"),
      field("Tariff Category", "tariffCategory"),
    ],
  },
  {
    title: "Solar System",
    fields: [
      field("System Size (kW)", "systemSizeKw", "number", true),
      field("Panel Brand", "panelBrand"),
      field("Inverter Brand", "inverterBrand"),
      field("Panel Quantity", "panelQuantity", "number"),
    ],
  },
  {
    title: "Loan Details",
    fields: [
      field("Bank Name", "bankName"),
      field("Loan Amount (₹)", "loanAmount", "number"),
      field("Loan Status", "loanStatus"),
    ],
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({ loanRequired: "false" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sanctionedLoad: form.sanctionedLoad ? parseFloat(form.sanctionedLoad) : null,
          systemSizeKw: form.systemSizeKw ? parseFloat(form.systemSizeKw) : null,
          panelQuantity: form.panelQuantity ? parseInt(form.panelQuantity) : null,
          loanAmount: form.loanAmount ? parseFloat(form.loanAmount) : null,
          loanRequired: form.loanRequired === "true",
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const current = steps[step];

  return (
    <AppLayout>
      <div style={{ padding: "28px 28px 48px", maxWidth: 600 }}>
        <div style={{ marginBottom: 28 }}>
          <a href="/projects" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back to Projects</a>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "8px 0 0" }}>New Project</h1>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? "#6366f1" : "#1e2535" }} />
          ))}
        </div>

        <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 20px" }}>
            Step {step + 1} of {steps.length} — {current.title}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {current.fields.map(f => (
              <div key={f.name}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {f.label}{f.required && " *"}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name] || ""}
                  onChange={update}
                  style={{ width: "100%", background: "#1e2535", border: "1px solid #2a3347", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}
                />
              </div>
            ))}

            {step === 3 && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Loan Required
                </label>
                <select name="loanRequired" value={form.loanRequired} onChange={update}
                  style={{ width: "100%", background: "#1e2535", border: "1px solid #2a3347", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            )}
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{ flex: 1, background: "#1e2535", color: "#e2e8f0", border: "none", borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Next
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                style={{ flex: 1, background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creating..." : "Create Project"}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

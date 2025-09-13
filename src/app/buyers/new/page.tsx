'use client'

import { useState } from 'react'

export default function NewBuyerPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: '',
    purpose: 'Buy',
    budgetMin: '',
    budgetMax: '',
    timeline: 'ThreeMonths',
    source: 'Website',
    notes: '',
    tags: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Prepare payload - convert numbers and tags list
    const payload = {
      ...form,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      bhk: form.bhk || undefined,
    }

    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create buyer lead')
      } else {
        setSuccess(true)
        setForm({
          fullName: '',
          email: '',
          phone: '',
          city: 'Chandigarh',
          propertyType: 'Apartment',
          bhk: '',
          purpose: 'Buy',
          budgetMin: '',
          budgetMax: '',
          timeline: 'ThreeMonths',
          source: 'Website',
          notes: '',
          tags: '',
        })
      }
    } catch {
      setError('Network error')
    }
  }

  return (
    <main style={{ padding: '1rem' }}>
      <h1>New Buyer Lead</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Buyer lead created successfully!</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label>
          Full Name:
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required minLength={2} maxLength={80} />
        </label>

        <label>
          Email:
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </label>

        <label>
          Phone:
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} pattern="\d{10,15}" required />
        </label>

        <label>
          City:
          <select name="city" value={form.city} onChange={handleChange}>
            <option>Chandigarh</option>
            <option>Mohali</option>
            <option>Zirakpur</option>
            <option>Panchkula</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Property Type:
          <select name="propertyType" value={form.propertyType} onChange={handleChange}>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        </label>

        <label>
          BHK (for Apartment, Villa):
          <select name="bhk" value={form.bhk} onChange={handleChange}>
            <option value="">Select</option>
            <option>One</option>
            <option>Two</option>
            <option>Three</option>
            <option>Four</option>
            <option>Studio</option>
          </select>
        </label>

        <label>
          Purpose:
          <select name="purpose" value={form.purpose} onChange={handleChange}>
            <option>Buy</option>
            <option>Rent</option>
          </select>
        </label>

        <label>
          Budget Min:
          <input type="number" name="budgetMin" value={form.budgetMin} onChange={handleChange} min={0} />
        </label>

        <label>
          Budget Max:
          <input type="number" name="budgetMax" value={form.budgetMax} onChange={handleChange} min={0} />
        </label>

        <label>
          Timeline:
          <select name="timeline" value={form.timeline} onChange={handleChange}>
            <option value="ThreeMonths">0-3 Months</option>
            <option value="SixMonths">3-6 Months</option>
            <option value="MoreThanSixMonths">&gt;6 Months</option>
            <option value="Exploring">Exploring</option>
          </select>
        </label>

        <label>
          Source:
          <select name="source" value={form.source} onChange={handleChange}>
            <option>Website</option>
            <option>Referral</option>
            <option>WalkIn</option>
            <option>Call</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Notes:
          <textarea name="notes" value={form.notes} onChange={handleChange} maxLength={1000} rows={4} />
        </label>

        <label>
          Tags (comma separated):
          <input type="text" name="tags" value={form.tags} onChange={handleChange} />
        </label>

        <button type="submit">Create Lead</button>
      </form>
    </main>
  )
}

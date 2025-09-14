'use client'
import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Buyer {
  id: string
  fullName: string
  email?: string
  phone: string
  city: string
  propertyType: string
  bhk?: string
  purpose: string
  budgetMin?: number
  budgetMax?: number
  timeline: string
  source: string
  notes?: string
  tags?: string[]
  status: string
}

interface Props {
  params: Promise<{ id: string }>
}

export default function EditBuyerPage(props: Props) {
  const params = use(props.params) // unwrap promise
  const id = params.id
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchBuyer() {
      setLoading(true)
      try {
        const res = await fetch(`/api/buyers/${id}`)

        const text = await res.text()
        let data = null
        try {
          data = text ? JSON.parse(text) : null
        } catch {
          // invalid JSON
        }

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load buyer')
        }

        setBuyer(data as Buyer)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBuyer()
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    let value: any = e.target.value
    if (e.target.type === 'number') {
      value = value === '' ? undefined : Number(value)
    }
    const { name } = e.target
    setBuyer((b) => (b ? { ...b, [name]: value } : null))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyer((b) =>
      b
        ? {
            ...b,
            tags: e.target.value
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          }
        : null
    )
  }

  const handleSave = async () => {
    if (!buyer) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...buyer,
          budgetMin: buyer.budgetMin ?? undefined,
          budgetMax: buyer.budgetMax ?? undefined,
        }),
      })

      const text = await res.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {}

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save')
      }

      router.push('/buyers')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!buyer) return
    if (!confirm('Are you sure you want to delete this buyer lead?')) return
    setIsDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'DELETE',
      })

      const text = await res.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {}

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete')
      }

      router.push('/buyers')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <p>Loading buyer data...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!buyer) return <p>Buyer not found.</p>

  const showBHK = buyer.propertyType === 'Apartment' || buyer.propertyType === 'Villa'

  return (
    <main style={{ padding: '1rem', maxWidth: 600 }}>
      <h1>Edit Buyer Lead</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <label htmlFor="fullName">
          Full Name:
          <input
            id="fullName"
            name="fullName"
            value={buyer.fullName}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={80}
          />
        </label>

        <label htmlFor="email">
          Email:
          <input
            id="email"
            name="email"
            type="email"
            value={buyer.email ?? ''}
            onChange={handleChange}
          />
        </label>

        <label htmlFor="phone">
          Phone:
          <input
            id="phone"
            name="phone"
            type="tel"
            value={buyer.phone}
            onChange={handleChange}
            pattern="\d{10,15}"
            required
          />
        </label>

        <label htmlFor="city">
          City:
          <select id="city" name="city" value={buyer.city} onChange={handleChange}>
            <option>Chandigarh</option>
            <option>Mohali</option>
            <option>Zirakpur</option>
            <option>Panchkula</option>
            <option>Other</option>
          </select>
        </label>

        <label htmlFor="propertyType">
          Property Type:
          <select
            id="propertyType"
            name="propertyType"
            value={buyer.propertyType}
            onChange={handleChange}
          >
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        </label>

        <label htmlFor="bhk">
          BHK (for Apartment, Villa):
          <select
            id="bhk"
            name="bhk"
            value={buyer.bhk ?? ''}
            onChange={handleChange}
            required={showBHK}
            disabled={!showBHK}
          >
            <option value="">Select</option>
            <option>One</option>
            <option>Two</option>
            <option>Three</option>
            <option>Four</option>
            <option>Studio</option>
          </select>
        </label>

        <label htmlFor="purpose">
          Purpose:
          <select id="purpose" name="purpose" value={buyer.purpose} onChange={handleChange}>
            <option>Buy</option>
            <option>Rent</option>
          </select>
        </label>

        <label htmlFor="budgetMin">
          Budget Min:
          <input
            id="budgetMin"
            name="budgetMin"
            type="number"
            value={buyer.budgetMin ?? ''}
            onChange={handleChange}
            min={0}
          />
        </label>

        <label htmlFor="budgetMax">
          Budget Max:
          <input
            id="budgetMax"
            name="budgetMax"
            type="number"
            value={buyer.budgetMax ?? ''}
            onChange={handleChange}
            min={0}
          />
        </label>

        <label htmlFor="timeline">
          Timeline:
          <select id="timeline" name="timeline" value={buyer.timeline} onChange={handleChange}>
            <option value="ThreeMonths">0-3 Months</option>
            <option value="SixMonths">3-6 Months</option>
            <option value="MoreThanSixMonths">&gt;6 Months</option>
            <option value="Exploring">Exploring</option>
          </select>
        </label>

        <label htmlFor="source">
          Source:
          <select id="source" name="source" value={buyer.source} onChange={handleChange}>
            <option>Website</option>
            <option>Referral</option>
            <option>WalkIn</option>
            <option>Call</option>
            <option>Other</option>
          </select>
        </label>

        <label htmlFor="notes">
          Notes:
          <textarea
            id="notes"
            name="notes"
            value={buyer.notes ?? ''}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
          />
        </label>

        <label htmlFor="tags">
          Tags (comma separated):
          <input
            id="tags"
            type="text"
            value={buyer.tags?.join(', ') ?? ''}
            onChange={handleTagsChange}
          />
        </label>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ backgroundColor: '#e55353', color: 'white' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Lead'}
          </button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  )
}

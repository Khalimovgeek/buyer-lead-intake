'use client'

import { useEffect, useState } from 'react'
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
  params: { id: string }
}

export default function EditBuyerPage({ params }: Props) {
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
        const res = await fetch(`/api/buyers/${params.id}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load buyer')
        }
        const data: Buyer = await res.json()
        setBuyer(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBuyer()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBuyer((b) => (b ? { ...b, [name]: value } : null))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyer((b) =>
      b ? { ...b, tags: e.target.value.split(',').map((t) => t.trim()) } : null
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
          budgetMin: buyer.budgetMin ? Number(buyer.budgetMin) : undefined,
          budgetMax: buyer.budgetMax ? Number(buyer.budgetMax) : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
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
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
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
        <label>
          Full Name:
          <input
            name="fullName"
            value={buyer.fullName}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={80}
          />
        </label>

        <label>
          Email:
          <input name="email" type="email" value={buyer.email ?? ''} onChange={handleChange} />
        </label>

        <label>
          Phone:
          <input
            name="phone"
            type="tel"
            value={buyer.phone}
            onChange={handleChange}
            pattern="\d{10,15}"
            required
          />
        </label>

        <label>
          City:
          <select name="city" value={buyer.city} onChange={handleChange}>
            <option>Chandigarh</option>
            <option>Mohali</option>
            <option>Zirakpur</option>
            <option>Panchkula</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Property Type:
          <select name="propertyType" value={buyer.propertyType} onChange={handleChange}>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        </label>

        <label>
          BHK (for Apartment, Villa):
          <select
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

        <label>
          Purpose:
          <select name="purpose" value={buyer.purpose} onChange={handleChange}>
            <option>Buy</option>
            <option>Rent</option>
          </select>
        </label>

        <label>
          Budget Min:
          <input
            name="budgetMin"
            type="number"
            value={buyer.budgetMin ?? ''}
            onChange={handleChange}
            min={0}
          />
        </label>

        <label>
          Budget Max:
          <input
            name="budgetMax"
            type="number"
            value={buyer.budgetMax ?? ''}
            onChange={handleChange}
            min={0}
          />
        </label>

        <label>
          Timeline:
          <select name="timeline" value={buyer.timeline} onChange={handleChange}>
            <option value="ThreeMonths">0-3 Months</option>
            <option value="SixMonths">3-6 Months</option>
            <option value="MoreThanSixMonths">&gt;6 Months</option>
            <option value="Exploring">Exploring</option>
          </select>
        </label>

        <label>
          Source:
          <select name="source" value={buyer.source} onChange={handleChange}>
            <option>Website</option>
            <option>Referral</option>
            <option>WalkIn</option>
            <option>Call</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Notes:
          <textarea
            name="notes"
            value={buyer.notes ?? ''}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
          />
        </label>

        <label>
          Tags (comma separated):
          <input
            type="text"
            value={buyer.tags?.join(', ') ?? ''}
            onChange={handleTagsChange}
          />
        </label>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleDelete} disabled={isDeleting} style={{ backgroundColor: '#e55353', color: 'white' }}>
            {isDeleting ? 'Deleting...' : 'Delete Lead'}
          </button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  )
}

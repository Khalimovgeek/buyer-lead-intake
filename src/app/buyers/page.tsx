"use client"

import { useEffect, useState } from "react"

type Buyer = {
  id: string
  fullName: string
  email: string | null
  phone: string
  city: string
  propertyType: string
  status: string
  updatedAt: string
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBuyers() {
      const res = await fetch("/api/buyers?page=1&pageSize=10")
      const data = await res.json()
      setBuyers(data.buyers)
      setLoading(false)
    }
    fetchBuyers()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Buyers</h1>
      <ul>
        {buyers.map((buyer) => (
          <li key={buyer.id} className="mb-2 border-b pb-2">
            <strong>{buyer.fullName}</strong> – {buyer.email || "No Email"} –{" "}
            {buyer.phone}
          </li>
        ))}
      </ul>
    </div>
  )
}

import { z } from 'zod'

const loginResponse = z.object({ token: z.string() })

const API_URL = import.meta.env.VITE_API_URL ?? ''

/** TODO: adjust the endpoint to match the backend. */
export async function loginAdmin(password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error(res.status === 401 ? 'Wrong password' : 'Login failed')
  return loginResponse.parse(await res.json()).token
}

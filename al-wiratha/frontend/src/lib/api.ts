import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export async function calculateInheritance(payload: object) {
  const response = await api.post('/inheritance/calculate', payload);
  return response.data;
}

export async function saveInheritanceCase(payload: object, token: string) {
  const response = await api.post('/inheritance/cases', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export default api;

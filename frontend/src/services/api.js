const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const ROOT_URL = API_URL.replace('/api/v1', '');

export async function fetchHealth() {
  const startTime = Date.now();
  try {
    const res = await fetch(`${ROOT_URL}/health`);
    const latency = Date.now() - startTime;
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data: data.data, latency, timestamp: new Date() };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      latency,
      timestamp: new Date(),
    };
  }
}

export async function fetchApiInfo() {
  try {
    const res = await fetch(`${API_URL}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export { API_URL, ROOT_URL };

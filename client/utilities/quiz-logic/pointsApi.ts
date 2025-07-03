import axios from "axios";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://quizzly-bears.onrender.com/api/points";

// ========== Send Points to Database ==========
export const sendPoints = async () => {
try {
    const respone = await axios.post(`${API_BASE_URL}/send`, {})
} catch (error) {
    
}
}
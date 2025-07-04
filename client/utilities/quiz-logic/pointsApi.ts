import axios from "axios";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ||
  "https://quizzly-bears.onrender.com/api/points";

interface SendPointsResponse {
  message: string;
  data: {
    totalPoints: number;
    correctAnswers: number;
    totalAnswers: number;
    categoryStats: {
      categoryName: string;
      correctAnswers: number;
      totalAnswers: number;
    };
  };
}

interface SendPointsParams {
  clerkUserId: string;
  totalPoints: number;
  correctAnswers: number;
  totalAnswers: number;
  category: string;
}

// ========== Send Points to Database ==========
export const sendPoints = async ({
  clerkUserId,
  totalPoints,
  correctAnswers,
  totalAnswers,
  category,
}: SendPointsParams): Promise<SendPointsResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send`, {
      clerkUserId,
      totalPoints,
      correctAnswers,
      totalAnswers,
      category,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to send points to database");
  }
};

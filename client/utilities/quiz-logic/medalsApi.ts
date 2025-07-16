import axios from "axios";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ||
  "https://quizzly-bears.onrender.com/api/medals";

export interface SendMedalParams {
  clerkUserId: string;
  place: number; // 1, 2, 3
  roomId: string;
}

export interface SendMedalResponse {
  message: string;
  data: any;
}

export const sendMedal = async ({
  clerkUserId,
  place,
  roomId,
}: SendMedalParams): Promise<SendMedalResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send`, {
      clerkUserId,
      place,
      roomId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to send medal to database");
  }
};

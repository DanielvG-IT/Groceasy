import { loginDto, RegisterModel, tokenResponseDto } from "@/models/auth";
import { ApiErrorDto } from "@/models/error";

const backendApiUrl = process.env.BACKEND_API_URL;
if (!backendApiUrl) {
  throw new Error(
    "BACKEND_API_URL is not defined in the environment variables."
  );
}

export const signin = async (
  loginDto: loginDto,
  authStore: {
    token: string;
    storeToken: Function;
    removeToken: Function;
    getToken: Function;
  }
) => {
  const { storeToken } = authStore;
  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginDto),
  };

  let request;

  try {
    request = await fetch(`${backendApiUrl}/auth/login`, reqOptions);
  } catch (error: any) {
    if (error.message) {
      return { errorMessage: error.message };
    } else {
      return { errorMessage: "Something went wrong. Please try again!" };
    }
  }

  if (request.status >= 500 && request.status < 600) {
    return { errorMessage: "Server error. Please try again later!" };
  }

  let response;
  try {
    const text = await request.text();
    response = text ? JSON.parse(text) : {};
  } catch {
    return { errorMessage: "Failed to parse server response." };
  }

  if (!request.ok) {
    return {
      errorMessage: (response as ApiErrorDto).title || "An error occurred.",
    };
  }

  const tokenResponse = response as tokenResponseDto;
  storeToken(tokenResponse.token); // TODO Make the cookies expire {expires: new Date(Date.now() + 7 days}

  return { successMessage: "Login successful!" };
};

export const logout = async (authStore: {
  token: string;
  storeToken: Function;
  removeToken: Function;
  getToken: Function;
}) => {
  const { removeToken } = authStore;
  removeToken();
};

export const register = async (
  registerDto: RegisterModel,
  loginDto: loginDto
) => {
  if (registerDto.password !== registerDto.confirmPassword) {
    return { errorMessage: "Passwords do not match. Please try again." };
  }

  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerDto),
  };

  let request;
  try {
    request = await fetch(`${backendApiUrl}/auth/register`, reqOptions);
  } catch (error: any) {
    if (error.message) {
      return { errorMessage: error.message };
    } else {
      return { errorMessage: "Something went wrong. Please try again!" };
    }
  }

  if (request.status >= 500 && request.status < 600) {
    return { errorMessage: "Server error. Please try again later!" };
  }

  let response;
  try {
    const text = await request.text();
    response = text ? JSON.parse(text) : {};
  } catch {
    return { errorMessage: "Failed to parse server response." };
  }

  console.log(request.status);
  console.log(response);

  if (!request.ok) {
    return {
      errorMessage: (response as ApiErrorDto).title || "An error occurred.",
    };
  }

  return { successMessage: "Registration successful!" };
};

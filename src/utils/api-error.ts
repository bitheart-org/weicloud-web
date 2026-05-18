export function getApiErrorMessage(error: unknown, fallback: string): string {
  const responseData = (error as any)?.response?.data;
  const code = responseData?.code;
  const message = responseData?.message;
  if (typeof message === "string" && message.trim() !== "") {
    if (typeof code === "number" && code > 0) {
      return `${message}（错误码：${code}）`;
    }
    return message;
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}

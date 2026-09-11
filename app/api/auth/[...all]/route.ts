import { auth } from "@/lib/auth"; // Adjust the path as necessary
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

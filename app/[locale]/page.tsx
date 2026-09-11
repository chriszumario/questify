import { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "Questify | Engage your audience with AI-powered Quizzes & Polls",
  description: "The ultimate platform for educators and creators. Generate interactive quizzes, live polls, and assessments in seconds using Artificial Intelligence.",
  keywords: "AI quiz maker, assessments for teachers, lead generation, interactive polls, classroom tools, interactive marketing",
  openGraph: {
    title: "Questify | Engage your audience with AI",
    description: "The all-in-one platform for educators and creators. Generate interactive quizzes and live polls in seconds.",
    type: "website",
  }
};

export default function Page() {
  return <LandingPage />;
}

import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="w-full max-w-2xl pb-10">
        <p className="indent-3">
          Welcome to ______! We know the feeling of uncertainty as a
          pre-collegiate student, wanting to reach excellence but not knowing
          how. That's why we gather the stories and advice of accomplished
          students from across the US to offer insights and guidance to
          exploring young achievers. Here, you'll find wisdom from past olympiad
          medalists, writing scholars, science fair winners, and far more. So
          what're you waiting for!
        </p>
      </div>
      <Link
        href="home"
        className="group transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        <span className="inline-block transition-opacity duration-300 opacity-100">
          start exploring
        </span>
        <svg
          className="inline-block w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
          <path
            className="transition-all duration-300 group-hover:scale-x-100 scale-x-0"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2 12h10"
          ></path>
        </svg>
      </Link>
    </>
  );
}

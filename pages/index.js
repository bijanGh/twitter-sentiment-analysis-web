import Head from "next/head";
import Image from "next/image";
import TwitterPic from "../public/twitter-240.png";

const data = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 205, 86)",
      ],
      hoverOffset: 4,
    },
  ],
};

const btnStyles =
  "px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600 w-28";
export default function Home() {
  return (
    <div>
      <Head>
        <title>Twitter Sentiment Analysis</title>
        <meta name="description" content="home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container flex flex-col items-center justify-center w-full h-screen mx-auto align-middle ">
        <Image
          width="100rem"
          height="100rem"
          alt="tweeter logo image"
          src={TwitterPic}
        />
        <input
          className="px-4 py-1 mt-16 text-center border-2 border-blue-500 border-solid rounded w-72 "
          placeholder="Enter your Twitter username"
        />
        <div className="flex flex-row justify-around mt-24 w-72">
          <button className={`${btnStyles} `}>Mentions</button>
          <button className={`${btnStyles} `}>Tweets</button>
        </div>
      </div>
    </div>
  );
}

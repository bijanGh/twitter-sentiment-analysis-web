import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Avatar from "../../src/components/Avatar";
import Pie from "../../src/components/PieChart";
import Tweet from "../../src/components/Tweet";
import { sentimentAnalysis, loadModel, getMetaData } from "../../src/helpers";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const data = {
  datasets: [
    {
      label: "sentiment analysis result",
      data: [10, 20, 30],
      backgroundColor: [
        "rgb(68, 242, 103)",
        "rgb(240, 104, 77)",
        "rgb(222, 222, 222)",
      ],
      hoverOffset: 4,
    },
  ],
};

const DefaultElement = ({ children }) => (
  <div className="min-h-screen bg-indigo-100">
    <div className="flex flex-wrap items-center justify-center w-full h-screen align-middle flex-column">
      <p className="text-lg">{children}</p>
    </div>
  </div>
);

const Tweets = ({
  username,
  userImage,
  tweetsType,
  tweetCount,
  positiveCount,
  negativeCount,
  neutralCount,
  tweets,
}) => {
  return (
    <div className="min-h-screen bg-indigo-100">
      <div className="flex flex-wrap items-center justify-center w-full align-middle flex-column">
        <div className="flex flex-row justify-between w-11/12 pt-3 ">
          <span className="p-2">
            <Avatar imageSrc={userImage} userName={username} />
          </span>
          <div className="text-sm text-center sm:text-lg">
            <p className="px-1 mt-1 text-white capitalize bg-blue-600 rounded-lg">
              {tweetsType} : {tweetCount}
            </p>
            <p className="px-1 mt-1 text-green-400 capitalize rounded-lg ">
              Positives: {positiveCount}
            </p>
            <p className="px-1 mt-1 text-red-400 capitalize rounded-lg ">
              Negatives: {negativeCount}
            </p>
            <p className="px-1 mt-1 text-gray-600 capitalize rounded-lg ">
              Neutrals: {neutralCount}
            </p>
          </div>

          <span className="w-32 h-32">
            <Pie
              data={{
                datasets: [
                  {
                    label: "sentiment analysis result",
                    data: [positiveCount, negativeCount, neutralCount],
                    backgroundColor: [
                      "rgb(68, 242, 103)",
                      "rgb(240, 104, 77)",
                      "rgb(222, 222, 222)",
                    ],
                    hoverOffset: 4,
                  },
                ],
              }}
            />
          </span>
        </div>
        <div className="flex flex-wrap w-11/12 flex-column ">
          {tweets.map(({ text, id, score }) => {
            const bgColor = {
              NEGATIVE: "bg-red-200",
              POSITIVE: "bg-green-200",
              NEUTRAL: "bg-white",
            };

            return (
              <span className="w-full py-1 " key={id}>
                <Tweet text={text} className={bgColor[score]} />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function Page({}) {
  const router = useRouter();
  const { target, userName } = router.query;
  const model = useRef(null);
  const metaData = useRef(null);
  const [status, setStatus] = useState("INITIAL");
  const [
    {
      TweeterData,
      tweetCount,
      userData,
      positiveCount,
      negativeCount,
      neutralCount,
    },
    setAnalysis,
  ] = useState({
    TweeterData: null,
    tweetCount: 0,
    userData: null,
    chartData: data,
    positiveCount: 0,
    negativeCount: 0,
    neutralCount: 0,
  });

  const pageSetup = async (target, userName) => {
    try {
      if (!model.current) model.current = await loadModel();
      if (!metaData.current) metaData.current = await getMetaData();

      setStatus("FETCHING_TWEETS");

      const tweetsParsed = await fetch(`${API_URL}/${target}`, {
        method: "post",
        body: JSON.stringify({ user: userName }),
      }).then((response) => response.json());

      setStatus("FETCHED_TWEETS");

      if (!tweetsParsed.tweets || tweetsParsed.tweets.length === 0) {
        setStatus("NO_TWEETS");
        return;
      }
      const count = tweetsParsed.tweets.length;
      setAnalysis((state) => ({ ...state, tweetCount: count }));

      let [positive, negative, neutral] = [0, 0, 0];
      const tweetsAnalysed = tweetsParsed.tweets.map((item) => {
        const score = sentimentAnalysis(
          item.text,
          model.current,
          metaData.current
        );
        switch (score) {
          case "POSITIVE":
            positive++;
            break;
          case "NEGATIVE":
            negative++;
            break;
          default:
            neutral++;
            break;
        }
        return {
          ...item,
          score,
        };
      });

      setAnalysis((state) => ({
        ...state,
        TweeterData: tweetsAnalysed,
        tweetCount: count,
        userData: tweetsParsed.user,
        positiveCount: positive,
        negativeCount: negative,
        neutralCount: neutral,
      }));
      setStatus("READY");
    } catch (error) {
      console.error(
        "🚀 ~ file: index.js ~ line 174 ~ pageSetup ~ error",
        error
      );
      setStatus("ERROR");
    }
  };

  useEffect(() => {
    pageSetup(target, userName);
  }, []);

  switch (status) {
    case "INITIAL":
      return (
        <DefaultElement>
          Fetching AI models; it may take a minute please be patient ... .
        </DefaultElement>
      );
    case "FETCHING_TWEETS":
      return (
        <DefaultElement>
          Fetching {target} of {userName}
        </DefaultElement>
      );
    case "NO_TWEETS":
      return (
        <DefaultElement>
          Username provided has no tweets or is incorrect.
        </DefaultElement>
      );
    case "FETCHED_TWEETS":
      return (
        <DefaultElement>
          Processing {tweetCount} of {target} it may take a minute please be
          patient ... .
        </DefaultElement>
      );

    case "READY":
      return (
        <Tweets
          username={userData.name}
          userImage={userData.profile_image_url}
          tweetCount={tweetCount}
          tweetsType={target}
          positiveCount={positiveCount}
          negativeCount={negativeCount}
          neutralCount={neutralCount}
          tweets={TweeterData}
        />
      );

    default:
      return <DefaultElement>Something went Wrong</DefaultElement>;
  }
}

export default Page;

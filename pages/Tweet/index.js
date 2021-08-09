import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Avatar from "../../src/components/Avatar";
import Pie from "../../src/components/PieChart";
import Tweet from "../../src/components/Tweet";
import { sentimentAnalysis, loadModel, getMetaData } from "../../src/helpers";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bijan-twitter-api.herokuapp.com";

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
const scores = {
  POSITIVE: {
    styles: "bh",
  },
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
  chartData,
  tweets,
}) => {
  return (
    <div className="min-h-screen bg-indigo-100">
      <div className="flex flex-wrap items-center justify-center w-full align-middle flex-column">
        <div className="flex flex-row justify-between w-11/12 pt-3 ">
          <span className="p-2">
            <Avatar imageSrc={userImage} userName={username} />
          </span>
          <div>
            <p className="px-1 mt-1 text-lg text-center text-white capitalize bg-blue-600 rounded-lg text-">
              {tweetsType} : {tweetCount}
            </p>
            <p className="px-1 mt-1 text-lg text-green-400 capitalize rounded-lg ">
              Positive count : {positiveCount}
            </p>
            <p className="px-1 mt-1 text-lg text-red-400 capitalize rounded-lg ">
              Negative count : {negativeCount}
            </p>
            <p className="px-1 mt-1 text-lg text-gray-600 capitalize rounded-lg ">
              Neutral count : {neutralCount}
            </p>
          </div>

          <span className="w-32 h-32">
            <Pie data={chartData} />
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
  const [TweeterData, setTweeterData] = useState(null);
  const [tweetCount, setTweetCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [status, setStatus] = useState("INITIAL");
  const [chartData, setChartData] = useState(data);
  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);
  const [neutralCount, setNeutralCount] = useState(0);

  useEffect(() => {
    const pageSetup = async (target, userName) => {
      if (!model.current) model.current = await loadModel();
      if (!metaData.current) metaData.current = await getMetaData();
      setStatus("FETCHING_TWEETS");

      const response = await fetch(`${API_URL}/${target}`, {
        method: "post",
        body: JSON.stringify({ user: userName }),
      });
      setStatus("FETCHED_TWEETS");

      const tweetsParsed = await response.json();

      if (!tweetsParsed.tweets || tweetsParsed.tweets.length === 0) {
        return null;
      }

      setTweetCount(tweetsParsed.tweets.length);

      return {
        user: tweetsParsed.user,
        tweets: tweetsParsed.tweets,
        chart: {
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
        },
      };
    };

    if (status === "INITIAL" && userName && target)
      pageSetup(target, userName)
        .then((res) => {
          if (res) {
            const { chart, tweets, user } = res;

            const tweetsAnalysed = tweets.map((item) => {
              const score = sentimentAnalysis(
                item.text,
                model.current,
                metaData.current
              );
              setPositiveCount(0);
              setNegativeCount(0);
              setNeutralCount(0);

              switch (score) {
                case "POSITIVE":
                  setPositiveCount((count) => count + 1);
                  break;
                case "NEGATIVE":
                  setNegativeCount((count) => count + 1);
                  break;
                default:
                  setNeutralCount((count) => count + 1);
                  break;
              }
              return {
                ...item,
                score,
              };
            });
            setUserData(user);
            setTweeterData(tweetsAnalysed);
            setChartData(chart);
            setStatus("READY");
          } else setStatus("NO_TWEETS");
        })
        .catch((e) => {
          console.error("🚀 ~ file: index.js ~ line 44 ~ useEffect ~ e", e);
          setStatus("ERROR");
        });
  }, []);

  switch (status) {
    case "INITIAL":
      return (
        <DefaultElement>Fetching AI models please be patient</DefaultElement>
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
          Processing {positiveCount + negativeCount + negativeCount}{" "}
          {tweetCount} {target} please be patient ... .
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
          chartData={chartData}
          tweets={TweeterData}
        />
      );

    default:
      return <DefaultElement>Something went Wrong</DefaultElement>;
  }
}

export default Page;

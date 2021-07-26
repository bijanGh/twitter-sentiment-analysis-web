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

function Page({}) {
  const router = useRouter();
  const { target, userName } = router.query;
  const [TweeterData, setTweeterData] = useState(null);
  const [tweetCount, setTweetCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [status, setStatus] = useState("INITIAL");
  const [chartData, setChartData] = useState(data);
  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);
  const [neutralCount, setNeutralCount] = useState(0);
  const model = useRef(null);
  const metaData = useRef(null);

  const pageSetup = async (target, userName) => {
    setStatus("SETUP");
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
    if (!model.current) model.current = await loadModel();
    if (!metaData.current) metaData.current = await getMetaData();
    let [positiveCount, negativeCount, neutralCount] = [0, 0, 0];
    const tweetsAnalysed = tweetsParsed.tweets.map((item) => {
      const score = sentimentAnalysis(
        item.text,
        model.current,
        metaData.current
      );
      switch (score) {
        case "POSITIVE":
          positiveCount++;
          break;
        case "NEGATIVE":
          negativeCount++;
          break;
        default:
          neutralCount++;
          break;
      }
      return {
        ...item,
        score,
      };
    });
    return {
      user: tweetsParsed.user,
      tweets: tweetsAnalysed,
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
      positiveCount,
      negativeCount,
      neutralCount,
    };
  };

  useEffect(() => {
    if (status === "INITIAL" && userName && target)
      pageSetup(target, userName)
        .then((res) => {
          if (res) {
            const {
              positiveCount,
              negativeCount,
              neutralCount,
              chart,
              tweets,
              user,
            } = res;
            setUserData(user);
            setTweeterData(tweets);
            setPositiveCount(positiveCount);
            setNegativeCount(negativeCount);
            setNeutralCount(neutralCount);
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
    case "SETUP":
      return (
        <DefaultElement>
          Fetching {target} of {userName}
        </DefaultElement>
      );
    case "INITIAL":
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
          Processing {tweetCount} {target} please be patient ... .
        </DefaultElement>
      );
    case "READY":
      return (
        <div className="min-h-screen bg-indigo-100">
          <div className="flex flex-wrap items-center justify-center w-full align-middle flex-column">
            <div className="flex flex-row justify-between w-11/12 pt-3 ">
              <span className="p-2">
                <Avatar
                  imageSrc={userData.profile_image_url}
                  userName={userData.name}
                />
              </span>
              <div>
                <p className="px-1 mt-1 text-lg text-center text-white capitalize bg-blue-600 rounded-lg text-">
                  {target} : {tweetCount}
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
              {TweeterData.map(({ text, id, score }) => {
                const bgColor = {
                  NEGATIVE: "bg-red-200",
                  POSITIVE: "bg-green-200",
                  NEUTRAL: "",
                };

                return (
                  <span className="w-full py-1" key={id}>
                    <Tweet text={text} className={bgColor[score]} />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      );

    default:
      return <DefaultElement>Something went Wrong</DefaultElement>;
  }
}

export default Page;

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "../../src/components/Avatar";
import Pie from "../../src/components/PieChart";
import Tweet from "../../src/components/Tweet";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const data = {
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

function Page({}) {
  const router = useRouter();
  const { target, userName } = router.query;
  const [TweeterData, setTweeterData] = useState(null);
  useEffect(() => {
    if (userName && TweeterData === null)
      fetch(`${API_URL}/${target}`, {
        method: "post",
        body: JSON.stringify({ user: userName }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(
            "🚀 ~ file: index.js ~ line 11 ~ fetch ~ response",
            response
          );
          setTweeterData(response);
        })
        .catch((e) => {
          console.log("🚀 ~ file: index.js ~ line 19 ~ .then ~ e", e);
        });
  });
  return TweeterData ? (
    <div className="bg-indigo-100">
      <div className="flex flex-wrap items-center justify-center w-full align-middle flex-column">
        <div className="flex flex-row justify-between w-11/12 pt-3 ">
          <span className="p-2">
            <Avatar
              imageSrc={TweeterData.user.profile_image_url}
              userName={TweeterData.user.name}
            />
          </span>
          <div>
            {" "}
            <p className="px-1 mt-1 text-lg text-center text-white capitalize bg-blue-600 rounded-lg  text-">
              {target}
            </p>
          </div>

          <span className="w-32 h-32">
            <Pie data={data} />
          </span>
        </div>
        <div className="flex flex-wrap w-11/12 flex-column ">
          {TweeterData.tweets.map(({ text, id }) => (
            <span className="w-full py-1" key={id}>
              <Tweet
                avatarImage={
                  target === "mentions"
                    ? TweeterData.user.profile_image_url
                    : null
                }
                text={text}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <p>loading ... </p>
  );
}

export default Page;

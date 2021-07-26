import propTypes from "prop-types";
import Image from "next/image";
import TwitterPic from "../../public/twitter-240.png";
const Component = ({ avatarImage, text, className }) => {
  return (
    <div
      className={`flex flex-row items-center p-1 bg-white rounded-lg flex-nowrap  ${className}`}
    >
      <div className="flex items-center flex-shrink-0 flex-column">
        <Image
          width="35px"
          height="35px"
          src={TwitterPic}
          alt="twiiter icon picture"
        />
      </div>

      <p className="px-2 overflow-auto text-xs font-semibold max-h-28">
        {text.toString()}
      </p>
    </div>
  );
};

Component.propTypes = {
  avatarImage: propTypes.string,
  text: propTypes.string,
};

export default Component;

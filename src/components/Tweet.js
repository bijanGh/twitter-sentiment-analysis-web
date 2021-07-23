import propTypes from "prop-types";
import Avatar from "./Avatar";
const Component = ({ avatarImage, text }) => {
  return (
    <div className="flex flex-row items-center justify-center flex-nowrap">
      <span className="hidden  md:block">
        <Avatar imageSrc={avatarImage} />
      </span>
      <p className="px-4 py-2 overflow-auto font-mono text-xs font-bold max-h-28">
        {text.toString()}
      </p>
    </div>
  );
};

Component.PropTypes = {
  avatarImage: propTypes.string,
  text: propTypes.string,
};

export default Component;

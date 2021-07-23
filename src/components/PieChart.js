import { Pie } from "react-chartjs-2";
import propTypes from "prop-types";

const Component = ({ data }) => {
  return data ? <Pie data={data}></Pie> : <></>;
};

Component.PropTypes = {
  data: {
    lables: propTypes.arrayOf(propTypes.string),
    datasets: propTypes.arrayOf({
      label: propTypes.string,
      data: propTypes.arrayOf(propTypes.number),
      backgroundColor: propTypes.arrayOf(propTypes.string),
      hoverOffset: propTypes.number,
    }),
  },
};

export default Component;

import {useState, useEffect} from "react"
import "./line-chart.css"

const LineChart = ({svgHeight, svgWidth, color, registerUpdateFunc}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    registerUpdateFunc(dataArray => setData(dataArray));
  }, [registerUpdateFunc]);

  // GET MAX & MIN X
  const getMinX = () => {
    return 0;
  }

  const getMaxX = () => {
    return data.length - 1;
  }

  // GET MAX & MIN Y
  const getMinY = () => {
    return data.reduce((min, p) => p < min ? p : min, data[0]);
  }

  const getMaxY = () => {
    return data.reduce((max, p) => p > max ? p : max, data[0]);
  }

  const getSvgX = (x, maxX) => {
    return (x / maxX * svgWidth);
  }

  const getSvgY = (y) => {
    return svgHeight - (y / 1.0 * svgHeight);
  }


  const makePath = () => {
    const maxX = getMaxX();
    
    let pathD = "M " + getSvgX(0, maxX) + " " + getSvgY(data[0]) + " ";
    pathD += data.map((point, i) => {
      return "L " + getSvgX(i, maxX) + " " + getSvgY(point) + " ";
    });

    return (
      <path className="linechart_path" d={pathD} strokeWidth='1' style={{stroke: color}} />
    );
  }

  const makeAxis = () => {
    const minX = getMinX(), maxX = getMaxX();
    const minY = getMinY(), maxY = getMaxY();

    return (
      <g className="linechart_axis">
        <line
          x1={getSvgX(minX)} y1={getSvgY(minY)}
          x2={getSvgX(maxX)} y2={getSvgY(minY)} />
        <line
          x1={getSvgX(minX)} y1={getSvgY(minY)}
          x2={getSvgX(minX)} y2={getSvgY(maxY)} />
      </g>
    );
  }
  

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
    {makePath(svgHeight)}
    {/*makeAxis()*/}
    </svg>
  );
}


export { LineChart };

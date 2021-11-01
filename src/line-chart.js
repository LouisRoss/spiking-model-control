import React, {Component} from "react"
import "./line-chart.css"

//<svg className="linechart" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
class LineChart extends Component {
  render() {
    const {svgHeight, svgWidth} = this.props;

    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {this.makePath(svgHeight)}
        {/*this.makeAxis()*/}
      </svg>
    );
  }

  makePath(svgHeight) {
    const {data, color} = this.props;
    const maxX = this.getMaxX();
    
    let pathD = "M " + this.getSvgX(0, maxX) + " " + this.getSvgY(data[0]) + " ";
    pathD += data.map((point, i) => {
      return "L " + this.getSvgX(i, maxX) + " " + this.getSvgY(point) + " ";
    });

    return (
      <path className="linechart_path" d={pathD} strokeWidth='1' style={{stroke: color}} />
    );
  }

  makeAxis() {
    const minX = this.getMinX(), maxX = this.getMaxX();
    const minY = this.getMinY(), maxY = this.getMaxY();

    return (
      <g className="linechart_axis">
        <line
          x1={this.getSvgX(minX)} y1={this.getSvgY(minY)}
          x2={this.getSvgX(maxX)} y2={this.getSvgY(minY)} />
        <line
          x1={this.getSvgX(minX)} y1={this.getSvgY(minY)}
          x2={this.getSvgX(minX)} y2={this.getSvgY(maxY)} />
      </g>
    );
  }
  
  getSvgX(x, maxX) {
    const {svgWidth} = this.props;
    return (x / maxX * svgWidth);
  }
  getSvgY(y) {
    const {svgHeight} = this.props;
    return svgHeight - (y / 1.0 * svgHeight);
  }

  // GET MAX & MIN X
  getMinX() {
    return 0;
  }

  getMaxX() {
    const {data} = this.props;
    return data.length - 1;
  }

  // GET MAX & MIN Y
  getMinY() {
    const {data} = this.props;
    return data.reduce((min, p) => p < min ? p : min, data[0]);
  }

  getMaxY() {
    const {data} = this.props;
    return data.reduce((max, p) => p > max ? p : max, data[0]);
  }
}

LineChart.defaultProps = {
  data: [],  
  color: '#2196F3',  
  svgHeight: 300,  
  svgWidth: 700
}

export { LineChart };

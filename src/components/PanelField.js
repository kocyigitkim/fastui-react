import React, { Component } from 'react'
import { chooseOne, getElevation, registerStylesheet, translate } from '../utils';
import { CustomField } from './CustomField'
import color from 'color'
import { Fragment } from 'react';
import Loading from './Loading';
import Chart from "react-apexcharts";
import {v4 as uuid} from 'uuid';

registerStylesheet(`
.chart-body-area{
    position:relative;
    top: 15px;
    right: -6px;
}
`);

export class PanelField extends CustomField {
    form() {
        const props = this.props;
        const { elevation, elevationColor } = props;
        const panelColor = chooseOne(props.panelColor, '#fff');
        const textColor = chooseOne(props.textColor, '#555');
        const shadow = getElevation(chooseOne(elevation, 2), chooseOne(elevationColor, color(panelColor).isLight() ? '#000' : '#fff'));
        const radius = chooseOne(props.radius, 12);
        const PanelBody = chooseOne(props.body, Fragment);
        const loading = props.loading;
        
        return (
            <div style={{ boxShadow: shadow, backgroundColor: panelColor, borderRadius: radius, position: 'relative' }}>
                <Loading show={loading} />
                <div style={{ padding: 20, paddingBottom: 5 }}>
                    <h6 style={{ color: textColor }}>{translate(props.title)}</h6>
                </div>
                <PanelBody radius={radius} {...props}></PanelBody>
            </div>
        )
    }
}

export class CountBody extends Component {
    state = {
        value: 0,
        targetValue: 0
    }
    timer = 0;
    componentDidMount() {
        this.setValue.call(this, this.props.value);
    }
    componentDidUpdate() {
        this.setValue.call(this, this.props.value);
    }
    setValue(v) {
        if (this.targetValue === v) return;
        if (this.timer > 0) clearInterval(this.timer);
        this.timer = this.countNumber.call(this, v);
    }
    countNumber(v) {
        const duration = chooseOne(this.props.duration, 1000);
        const interval = 1.0 / 15.0 * duration;
        const step = 1.0 / (duration * 1.0) * v;
        this.timer = setInterval(() => {
            var newValue = this.state.value + step;
            if (newValue >= v) {
                newValue = v;
                clearInterval(this.timer);
            }
            this.setState({ value: newValue });
        }, interval);
    }
    render() {
        const currentValue = chooseOne(this.props.value, 0);
        return <div style={{ padding: 20, paddingTop: 5, paddingBottom: 20 }}>
            <h1 style={{ fontSize: '3rem' }}>{(this.state.value || 0).toFixed((currentValue - currentValue.toFixed(0)) > 0 ? 2 : 0)}</h1>
        </div>
    }
}

export class ChartBody extends Component{
    state = {
        chartWidth: 0,
        chartHeight: 0
    }
    lastWindowWidth = 0;
    constructor(props){
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }
    id = "k"+uuid().replace(/\-/g, "");
    componentDidMount(){
        window.addEventListener("resize", this.updateChart);
    }
    componentWillUnmount(){
        window.removeEventListener("resize", this.updateChart);
    }
    updateChart(){
        if(!this.chartDiv) return;
        
        var rect = this.chartDiv.parentNode.getBoundingClientRect();
       
        if(rect.width < this.state.chartWidth && window.document.body.clientWidth === this.lastWindowWidth){
            return;
        }
        if(Math.abs((this.lastWindowWidth - window.document.body.clientWidth)) < 10){
            return;
        }
        this.lastWindowWidth = window.document.body.clientWidth;
        if(this.state.chartWidth===rect.width+27) return;

        this.setState({
            chartWidth: rect.width + 27,
            chartHeight: rect.height
        });
    }
    render(){
        return <div ref={r=>{this.chartDiv = r;this.updateChart();}} className={`chart-body-area card-rounded-bottom ${this.id}`} style={{maxHeight: 200, borderRadius: this.props.radius, position:'relative', left:-1}}>
            <Chart type="bar" series={[{data: this.props.value}]} options={{
                chart:{
                    toolbar:{show:false},
                    zoom:{enabled: false},
                    selection:{enabled:false},
                    redrawOnWindowResize: true,
                    redrawOnParentResize:true,
                    offsetX: -22,
                    offsetY: 0,
                    parentHeightOffset: 0
                },
                legend:{show: false, height: 0},
                grid:{show: false},
                dataLabels:{enabled: false},
                xaxis:{
                    labels: {show: false},
                    axisTicks:{show:false, height: 0},
                    axisBorder:{show: false, strokeWidth: 0},
                    tooltip:{enabled: false},
                    floating: false,
                },
                yaxis:{
                    labels: {show: false},
                },
                stroke:{curve:'smooth'},
                fill:{opacity:1},
                tooltip:{enabled:true,enabledOnSeries:false}
            }} height={200} width={this.state.chartWidth+8}></Chart>
            <style dangerouslySetInnerHTML={{__html:`
            .${this.id} .apexcharts-graphical defs:first-child rect {
                rx: ${this.props.radius*2}px !important;
                ry: ${this.props.radius*2}px !important;
            }
            `}}></style>
        </div>;
    }
}

export class BarChartBody extends Component{
    state = {
        chartWidth: 0,
        chartHeight: 0
    }
    lastWindowWidth = 0;
    constructor(props){
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }
    id = "k"+uuid().replace(/\-/g, "");
    componentDidMount(){
        window.addEventListener("resize", this.updateChart);
    }
    componentWillUnmount(){
        window.removeEventListener("resize", this.updateChart);
    }
    updateChart(){
        if(!this.chartDiv) return;
        
        var rect = this.chartDiv.parentNode.getBoundingClientRect();
       
        if(rect.width < this.state.chartWidth && window.document.body.clientWidth === this.lastWindowWidth){
            return;
        }
        if(Math.abs((this.lastWindowWidth - window.document.body.clientWidth)) < 10){
            return;
        }
        this.lastWindowWidth = window.document.body.clientWidth;
        if(this.state.chartWidth===rect.width+27) return;

        this.setState({
            chartWidth: rect.width + 27,
            chartHeight: rect.height
        });
    }
    render(){
        return <div ref={r=>{this.chartDiv = r;this.updateChart();}} className={`chart-body-area card-rounded-bottom ${this.id}`} style={{maxHeight: 200, borderRadius: this.props.radius}}>
            <Chart type="line" series={[{data: this.props.value}]} options={{
                chart:{
                    toolbar:{show:false},
                    zoom:{enabled: false},
                    selection:{enabled:false},
                    redrawOnWindowResize: true,
                    redrawOnParentResize:true,
                    offsetX: -22,
                    offsetY: 0,
                    parentHeightOffset: 0
                },
                legend:{show: false, height: 0},
                grid:{show: false},
                xaxis:{
                    labels: {show: false},
                    axisTicks:{show:false, height: 0},
                    axisBorder:{show: false, strokeWidth: 0},
                    tooltip:{enabled: false},
                    floating: false,
                },
                yaxis:{
                    labels: {show: false},
                },
                stroke:{curve:'smooth'},
                fill:{opacity:1},
                tooltip:{enabled:true,enabledOnSeries:false}
            }} height={200} width={this.state.chartWidth}></Chart>
            <style dangerouslySetInnerHTML={{__html:`
            .${this.id} .apexcharts-graphical defs:first-child rect {
                rx: ${this.props.radius*2}px !important;
                ry: ${this.props.radius*2}px !important;
            }
            `}}></style>
        </div>;
    }
}
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const EvaluationChart = ({ evaluationData, moveNum }) => {
  console.log(moveNum)

    const chartRef = useRef(null);
    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            const newChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: [moveNum],
                    datasets: [
                        {
                            label: "Evaluation",
                            data: [evaluationData / 100],
                            borderColor: "blue",
                            backgroundColor: "rgba(0, 0, 255, 0.1)",
                        },
                    ],
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Move Number",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Evaluation",
                            },
                        },
                    },
                },
            });

            return () => {
                newChart.destroy();
            };
        }
      }, [evaluationData, moveNum]);

    return <canvas ref={chartRef} id="evaluationChart" />;
};

export default EvaluationChart;

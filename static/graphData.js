const now = new Date();

// global variables that are updated by local simulation
var plotData1 = {
  timestamp: now.getTime(),
  value: 0.08,
  "critical deactivation": 0.06892472319040305,
  topic: "local/methanol reactor/catalyst deactivation",
  week: 120,
  initial_timestamp: now.getTime(),
  initial_value: 0.08,
};
var plotData2 = {
  timestamp: now.getTime(),
  initial_timestamp: now.getTime(),
  value: 500,
  error: 500,
  topic: "local/boiling water utility/temperature",
  upper_bound: 573,
  lower_bound: 473,
};

const processState = {
  targetTemperature: 500,
  controlIntensity: 1,
  reactorTemperature: 500,
  deactivation: 0.08,
  criticalDeactivation: plotData1["critical deactivation"],
};

// define functions which will be used to update the digits on the clock
const toWords = (strNumber) => {
  if (typeof strNumber !== "string") return "zero";
  const dictionaryOfDigitsInWords = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  return dictionaryOfDigitsInWords[parseInt(strNumber)];
};
// creates the digits with the right class and spans
const createDigit = (numberInWord) => {
  const digit = document.createElement("div");
  digit.classList = [numberInWord];
  for (let i of Array.from({ length: 7 }, (_, i) => i)) {
    i++;
    const d = document.createElement("span");
    d.classList.add(`d${i}`);
    digit.appendChild(d);
  }
  return digit;
};

const updateWeekDisplay = (weekValue) => {
  const clock = document.querySelector(".digits");
  if (!clock) return;

  const week = String(Math.max(0, Math.floor(weekValue))).padStart(3, "0");

  Array.from(clock.children).forEach((child) => {
    clock.removeChild(child);
  });

  clock.appendChild(createDigit(toWords(week[0])));
  clock.appendChild(createDigit(toWords(week[1])));
  clock.appendChild(createDigit(toWords(week[2])));
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// local control updates from UI
const setTemperature = document.querySelector(".knob1");
setTemperature.addEventListener("change", (e) => {
  processState.targetTemperature = e.detail.temperature + 473;
});

const setControlIntensity = document.querySelector(".knob2");
setControlIntensity.addEventListener("change", (e) => {
  processState.controlIntensity = e.detail.temperature;
});

const stepProcess = () => {
  const timestamp = Date.now();
  const { targetTemperature, controlIntensity } = processState;

  const trackingGain = 0.07 + controlIntensity * 0.02;
  const noiseScale = 1.2 - controlIntensity * 0.15;
  const disturbance = (Math.random() - 0.5) * 2 * noiseScale;
  const error = targetTemperature - processState.reactorTemperature;

  processState.reactorTemperature += trackingGain * error + disturbance;
  processState.reactorTemperature = clamp(processState.reactorTemperature, 460, 590);

  const tempStress = Math.max(0, processState.reactorTemperature - 530) / 100;
  const controlProtection = 1 - clamp(controlIntensity, 0, 5) * 0.12;
  const deactivationRate =
    0.000002 + 0.000003 * tempStress + 0.000002 * controlProtection;

  processState.deactivation -= deactivationRate;
  processState.deactivation = Math.max(
    processState.criticalDeactivation - 0.003,
    processState.deactivation,
  );

  const remaining = Math.max(
    0,
    processState.deactivation - processState.criticalDeactivation,
  );
  const weeksLeft = Math.floor(remaining / Math.max(deactivationRate, 1e-7));
  const scaledWeeksLeft = Math.floor(weeksLeft / 25);

  plotData1 = {
    ...plotData1,
    timestamp,
    value: processState.deactivation,
    week: scaledWeeksLeft,
  };

  plotData2 = {
    ...plotData2,
    timestamp,
    value: processState.reactorTemperature,
    error: targetTemperature,
  };

  updateWeekDisplay(plotData1.week);
};

setInterval(stepProcess, 1000);
updateWeekDisplay(plotData1.week);

// plot on plot1
if (plotData1 != undefined) {
  const getData1 = (input) => {
    const plotSchema = {
      x: new Date(plotData1.timestamp),
      y: plotData1.value === null ? 0.076 : plotData1.value,
      x0: new Date(plotData1.initial_timestamp),
      y0: plotData1.initial_value === null ? 0.08 : plotData1.initial_value,
      a_critic: plotData1["critical deactivation"] - 0.01,
    };
    return plotSchema[input];
  };

  // plot1 data
  let plot1Trace = {
    y: [getData1("y")],
    x: [getData1("x")],
    mode: "markers",
    type: "scatter",
    name: "catalyst deactivation",
    marker: {
      opacity: 0.7,
      size: 14,
      line: {
        color: "white",
        size: 10,
      },
    },
  };

  let layout = {
    paper_bgcolor: "#0f1620",
    plot_bgcolor: "#0f1620",
    legend: {
      font: {
        family: "Arial",
        color: "rgb(169,166,189)",
      },
    },
    title: {
      text: "ICI (Cu/Zn/Al) Catalyst Activation",
      font: {
        family: "Arial",
        color: "rgb(169,166,189)",
      },
    },
    font: {
      family: "Arial",
      color: "rgb(169,166,189)",
    },
    xaxis: {
      title: {
        text: "Time (s)",
        font: {
          family: "Arial",
          color: "rgb(169,166,189)",
        },
      },
    },
    yaxis: {
      gridcolor: "rgb(51,56,63)",
      title: {
        text: "MeOH / MeOH0",
        font: {
          family: "Arial",
          color: "rgb(169,166,189)",
        },
      },
    },
    shapes: [
      {
        type: "line",
        name: "critical deactivation",
        x0: getData1("x0"),
        y0: getData1("a_critic"),
        x1: getData1("x"),
        y1: getData1("a_critic"),
        line: {
          color: "rgb(226,264,143)",
          dash: "dot",
        },
      },
    ],
  };

  let config = {
    displayModebar: false,
  };
  Plotly.newPlot("plot1", [plot1Trace], layout, config);

  var cnt = 0;
  setInterval(() => {
    Plotly.extendTraces(
      "plot1",
      {
        y: [[getData1("y")]],
        x: [[getData1("x")]],
      },
      [0],
    );
    cnt++;

    if (cnt > 3) {
      Plotly.relayout("plot1", {
        legend: {
          font: {
            family: "Arial",
            color: "rgb(169,166,189)",
          },
        },
        yaxis: {
          range: [getData1("a_critic") - 0.005, getData1("y0") + 0.005],
          gridcolor: "rgb(51,56,63)",
          title: {
            text: "MeOH / MeOH0",
            font: {
              family: "Arial",
              color: "rgb(169,166,189)",
            },
          },
        },
        xaxis: {
          range: [getData1("x0"), getData1("x")],
          title: {
            text: "Time (s)",
            font: {
              family: "Arial",
              color: "rgb(169,166,189)",
            },
          },
        },
        shapes: [
          {
            type: "line",
            x0: getData1("x0"),
            y0: getData1("a_critic"),
            x1: getData1("x"),
            y1: getData1("a_critic"),
            name: "critical deactivation",
            line: {
              color: "rgb(226,264,143)",
              dash: "dot",
            },
          },
        ],
      });
    }
  }, 1000);
}
if (plotData2 != undefined) {
  const getData2 = (input) => {
    const plotSchema = {
      x0: new Date(plotData2.initial_timestamp),
      x: new Date(plotData2.timestamp),
      y: plotData2.value,
      error: plotData2.error,
      upper_bound: plotData2.upper_bound,
      lower_bound: plotData2.lower_bound,
    };

    return plotSchema[input];
  };

  // plot1 data
  let temperatureTrace = {
    y: [getData2("y")],
    x: [getData2("x")],
    mode: "line",
    type: "line",
    name: "Temperature (K)",
  };

  let errorTrace = {
    y: [getData2("error")],
    x: [getData2("x")],
    mode: "line",
    type: "line",
    name: "Target Temperature (K)",
    line: {
      color: "rgb(222,167,112)",
      dash: "dot",
    },
  };

  let layout = {
    paper_bgcolor: "#0f1620",
    plot_bgcolor: "#0f1620",
    legend: {
      font: {
        family: "Arial",
        color: "rgb(169,166,189)",
      },
    },
    title: {
      text: "Boiling Water Reactor (BWR) Temperature",
      font: {
        family: "Arial",
        color: "rgb(169,166,189)",
      },
    },
    font: {
      family: "Arial",
      color: "rgb(169,166,189)",
    },
    xaxis: {
      title: {
        text: "Time (s)",
        font: {
          family: "Arial",
          color: "rgb(169,166,189)",
        },
      },
    },
    yaxis: {
      gridcolor: "rgb(51,56,63)",
      title: {
        text: "Temperature (K)",
        font: {
          family: "Arial",
          color: "rgb(169,166,189)",
        },
      },
    },
    shapes: [
      {
        type: "line",
        name: "Temperature Upper Bound",
        x0: getData2("x0"),
        y0: getData2("upper_bound"),
        x1: getData2("x"),
        y1: getData2("upper_bound"),
        line: {
          color: "blue",
          dash: "dot",
        },
      },
      {
        type: "line",
        name: "Temperature Lower Bound",
        x0: getData2("x0"),
        y0: getData2("lower_bound"),
        x1: getData2("x"),
        y1: getData2("lower_bound"),
        line: {
          color: "blue",
          dash: "dot",
        },
      },
    ],
  };

  let config = {
    displayModebar: false,
  };
  Plotly.newPlot("plot2", [temperatureTrace, errorTrace], layout, config);

  var cnt2 = 0;
  setInterval(() => {
    Plotly.extendTraces(
      "plot2",
      {
        y: [[getData2("y")], [getData2("error")]],
        x: [[getData2("x")], [getData2("x")]],
      },
      [0, 1],
    );
    cnt2++;

    if (cnt2 > 2) {
      Plotly.relayout("plot2", {
        legend: {
          font: {
            family: "Arial",
            color: "rgb(169,166,189)",
          },
        },
        yaxis: {
          range: [getData2("lower_bound") - 0.5, getData2("upper_bound") + 0.5],
          gridcolor: "rgb(51,56,63)",
          title: {
            text: "Temperature (K)",
            font: {
              family: "Arial",
              color: "rgb(169,166,189)",
            },
          },
        },
        xaxis: {
          range: [getData2("x0"), getData2("x")],
          title: {
            text: "Time (s)",
            font: {
              family: "Arial",
              color: "rgb(169,166,189)",
            },
          },
        },
        shapes: [
          {
            type: "line",
            name: "Temperature Upper Bound",
            x0: getData2("x0"),
            y0: getData2("upper_bound"),
            x1: getData2("x"),
            y1: getData2("upper_bound"),
            line: {
              color: "blue",
              dash: "dot",
            },
          },
          {
            type: "line",
            name: "Temperature Lower Bound",
            x0: getData2("x0"),
            y0: getData2("lower_bound"),
            x1: getData2("x"),
            y1: getData2("lower_bound"),
            line: {
              color: "blue",
              dash: "dot",
            },
          },
        ],
      });
    }
  }, 1000);
}

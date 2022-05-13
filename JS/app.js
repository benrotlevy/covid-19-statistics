

const fullData = [];
let myChart;

const state = {
    chartDisplay : {
        continent: "",
        field: "",
    },
    dataDisplay : {
        names: [],
        nums: [],
    }
}

async function getData() {
    try {
        const countrys = axios.get("https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1");
        const allCountrysCovid = axios.get("https://corona-api.com/countries");
        const data = await Promise.all([countrys, allCountrysCovid]);
        const names = filterCountrysApi(data[0].data);
        const names2 = filterCovidApi(data[1].data.data);
        merge(names, names2, fullData);
        console.log(fullData.map(c => c.region));
        initializeTable(filterNames(fullData), filterNums(fullData, "confirmed"));
        updateState("world", "confirmed",filterNames(fullData), filterNums(fullData, "confirmed"));
        updateCountrys(state.dataDisplay.names);
        addEventToSelect();
        addEventsToBtns();
    } catch (error) {
        console.log(error);
    }
}

function addEventToSelect() {
    const selectBox = document.querySelector("#select-box");
    selectBox.addEventListener("change", selectEvent);
}

function selectEvent(event) {
    const country = findCountryData(event.target.value);
    
}

function findCountryData(name) {
    return fullData.find(country => country.name === name);
}

function updateCountrys(data, flag) {
    const selectBox = document.querySelector("#select-box");
    if(flag) {
        selectBox.innerHTML = "";
        const option = document.createElement("option");
        option.setAttribute("disabled", "");
        option.setAttribute("hidden", "");
        option.setAttribute("selected", "");
        option.innerText = "Select Country";  
        selectBox.append(option);
    }
    for(let name of data) {
        const option = document.createElement("option");
        option.value = name;
        option.innerText = name;  
        selectBox.append(option);  
    }
}

function updateState(name, field, names, nums) {
    state.chartDisplay.continent = name;
    state.chartDisplay.field = field;
    state.dataDisplay.names = names;
    state.dataDisplay.nums = nums;
}

function updateChart(chart, names, nums, label) {
    chart.data.labels = names;
    chart.data.datasets[0].data = nums;
    chart.data.datasets[0].label = label;
    chart.update();
}

function initializeTable(names, nums) {
    const labels = names;
    
    const data = {
        labels: labels,
        datasets: [{
            label: 'world - confirmed',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: nums,
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: { 
            maintainAspectRatio: false,
            // scales: {
            //     y: {
            //         stacked: true,
            //         grid: {
            //             display: true,
            //         },
            //     },
            //     x: {
            //         grid: {
            //             display: false,
            //         }
            //     },
            //     xAxes: [{ticks: {fontSize: 3}}]
            // }
        }
    };
    
    myChart = new Chart(
        document.getElementById('my-chart'),
        config
    );
}

getData()

function merge(names, names2, mergeTo) {
    for(let countryData of names) {
        let flag = false;
        for(let covidData of names2) {
            if(covidData.code === countryData.code) {
                covidData.name = countryData.name;
                covidData.region = countryData.region;
                flag = true;
                mergeTo.push(covidData);
            }
        }
    }
}

function filterCountrysApi(countrys) {
    return countrys.map(country => {
        return {code : country.cca2, name: country.name.common, region: country.region};
    })
}

function filterCovidApi(data) {
    return data.map(country => {
        const {confirmed, critical, deaths, recovered} = country.latest_data;
        return {
            code: country.code,
            today: country.today,
            latestData: {
                confirmed: confirmed, 
                critical: critical, 
                deaths: deaths,
                recovered: recovered,
            }
        };
    })
}

function filterNames(data) {
    return data.map(country=> country.name);
}

function filterNamesByRegion(data, region) {
    return data.filter(country => country.region === region);
}

function filterNums(data, key) {
    return data.map(country=> country.latestData[key]);
}

function addEventsToBtns() {
    const buttons = document.querySelectorAll("button");
    buttons.forEach(button => {button.addEventListener("click", buttonEvent)})
}

function buttonEvent(event) {
    colorBorder(event.target);
    switch (event.target.getAttribute("id")) {
        case "americas-btn":
            continentsEvent("Americas");
            break;
        case "africa-btn":
            continentsEvent("Africa");
            break;
        case "asia-btn":
            continentsEvent("Asia");
            break;
        case "europe-btn":
            continentsEvent("Europe");
            break;
        case "oceania-btn":
            continentsEvent("Oceania");
            break;
        case "world-btn":
            continentsEvent();
            break;
        case "confirmed":
            fieldsEvent("confirmed");
            break;
        case "deaths":
            fieldsEvent("deaths");
            break;
        case "critical" :
            fieldsEvent("critical");
            break;
        case "recovered":
            fieldsEvent("recovered");
            break;
        default:
            break;
    }
}

function colorBorder(element) {
    const continents = document.querySelectorAll(".continent");
    const fields = document.querySelectorAll(".select");
    if(element.classList.contains("continent")) {
        colorContinent(element, continents);
    } else {
        colorField(element, fields);
    }
}

function colorContinent(element, continents) {
    continents.forEach(continent => continent.classList.remove("selected"));
    element.classList.add("selected");
}

function colorField(element, fields) {
    fields.forEach(field => field.classList.remove("selected"));
    element.classList.add("selected");
}

function continentsEvent(continent) {
    if(continent) {
        const filtered = filterNamesByRegion(fullData, continent);
        updateChart(myChart ,filterNames(filtered), filterNums(filtered, state.chartDisplay.field), `${continent} - ${state.chartDisplay.field}`);
        updateState(continent, state.chartDisplay.field,filterNames(filtered), filterNums(filtered, state.chartDisplay.field));
        updateCountrys(filterNames(filtered), true);
    } else {
        updateChart(myChart ,filterNames(fullData), filterNums(fullData, state.chartDisplay.field), `world - ${state.chartDisplay.field}`);
        updateState("world", state.chartDisplay.field,filterNames(fullData), filterNums(fullData, state.chartDisplay.field))
        updateCountrys(filterNames(fullData), true);
    }
}

function fieldsEvent(field) {
    if(state.chartDisplay.continent !== "world") {
        const filtered = filterNamesByRegion(fullData, state.chartDisplay.continent);
        updateChart(myChart ,state.dataDisplay.names, filterNums(filtered, field), `${state.chartDisplay.continent} - ${field}`);
        updateState(state.chartDisplay.continent, field, state.dataDisplay.names, filterNums(filtered, field));
    } else {
        updateChart(myChart ,state.dataDisplay.names, filterNums(fullData, field), `${state.chartDisplay.continent} - ${field}`);
        updateState(state.chartDisplay.continent, field, state.dataDisplay.names, filterNums(fullData, field));
    }
}
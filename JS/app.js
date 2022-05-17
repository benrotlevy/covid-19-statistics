

let fullData = [];
let myChart;
let myPie;
let pieInit = false;

const state = {
    chartDisplay : {
        continent: "",
        field: "",
    },
    dataDisplay : {
        names: [],
        nums: [],
    },
    isPieDisplay: false,
    isRefresh: false,
    pieDisplay: {},
    isAllCountrys: true,
}

async function getData() {
    try {
        updateSync();
        const countrys = axios.get("https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1");
        const allCountrysCovid = axios.get("https://corona-api.com/countries");
        const data = await Promise.all([countrys, allCountrysCovid]);
        removeSpinner();
        const names = filterCountrysApi(data[0].data);
        const names2 = filterCovidApi(data[1].data.data);
        merge(names, names2, fullData);
        // console.log(fullData.map(c => c.region));
        initializeTable(filterNames(fullData), filterNums(fullData, "confirmed"));
        updateState("World", "confirmed",filterNames(fullData), filterNums(fullData, "confirmed"));
        updateCountrys(state.dataDisplay.names);
        addEventToContinents();
        addEventToSelect();
        addEventsToBtns();
        addEventToSync();
    } catch (error) {
        console.log(error);
    }
}

async function refreshData(event) {
    try {
        if(!state.isRefresh) {
            addSpinner();
            event.target.removeEventListener("click", refreshData);
            state.isRefresh = true;
            updateSync();
            const countrys = axios.get("https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1");
            const allCountrysCovid = axios.get("https://corona-api.com/countries");
            const data = await Promise.all([countrys, allCountrysCovid]);
            const names = filterCountrysApi(data[0].data);
            const names2 = filterCovidApi(data[1].data.data);
            fullData = [];
            merge(names, names2, fullData);
            removeSpinner();
            if(state.isPieDisplay) {
                selectEvent("", state.pieDisplay);
            } else {
                continentsEvent(state.chartDisplay.continent);
            }
            state.isRefresh = false;
            event.target.addEventListener("click", refreshData);
        }
    } catch (error) {
        console.log(error);
    }
}

function addEventToSync() {
    const sync = document.querySelector("#sync");
    sync.addEventListener("click", refreshData);
}

function updateSync() {
    document.querySelector("p").innerText = `Last Sync: ${Date().split(" ").slice(1,5).join(" ")}`;
}

function addEventToSelect() {
    const selectBox = document.querySelector("#select-box");
    selectBox.addEventListener("change", selectEvent);
}

function selectEvent(event, obj) {
    state.isAllCountrys = event.target.value === "all countrys"? true: false;
    if(!state.isAllCountrys) {
        let country = obj;
        if(!obj) country = findCountryData(event.target.value);
        const nums = [
            country.latestData.recovered,
            country.latestData.critical,
            country.latestData.deaths,
        ];
        const confirmed = country.latestData.confirmed.toLocaleString('en-US');
        const newDeaths = country.today.confirmed.toLocaleString('en-US');
        const newCasee = country.today.deaths.toLocaleString('en-US');
        const subtitle = `Total cases ${confirmed}, New cases ${newCasee}, New deaths ${newDeaths}`;
        if(!state.isPieDisplay) replaceCharts();
        if(!pieInit) initializePie();
        pieInit = true;
        updatePie(myPie, country.name, nums, subtitle);
        state.isPieDisplay = true;
        state.pieDisplay = country;
        hideAndShowButtons();
    } else {
        replaceCharts();
        state.isPieDisplay = false;
        hideAndShowButtons();
    }
}

function hideAndShowButtons() {
    const flag = state.isPieDisplay? "none": "flex";
    document.querySelector(".select-buttons").style.display = `${flag}`;
}

function replaceCharts() {
    const chartContainer = document.getElementById("chart-container");
    const pieContainer = document.getElementById("pie-container");
    chartContainer.classList.toggle("none");
    pieContainer.classList.toggle("none");
}

function findCountryData(name) {
    return fullData.find(country => country.name === name);
}

function updateCountrys(data, flag) {
    const selectBox = document.querySelector("#select-box");
    if(flag) {
        selectBox.innerHTML = "";
        const option = document.createElement("option");
        // option.setAttribute("disabled", "");
        // option.setAttribute("hidden", "");
        option.setAttribute("selected", "");
        option.setAttribute("value", "all countrys");
        option.innerText = "All Countrys";  
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
    document.querySelector("#chart-container").classList.remove("none");
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

function updatePie(pie, countryName, nums, subtitle) {
    pie.data.datasets[0].data = nums;
    pie.options.plugins.title.text = countryName;
    pie.options.plugins.subtitle.text = subtitle;
    pie.update();
}

function initializePie() {
    const labels = ["Recovered", "Critical", "Deaths"];

    const nums = [2, 3, 5];
    
    const data = {
        labels: labels,
        datasets: [{
            // label: 'country',
            backgroundColor: [
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(255, 99, 132)',
              ],
            data: nums,
            hoverOffset: 4
        }]
    };
    
    const config = {
        type: 'pie',
        data: data,
        options: { 
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'israel'
                },
                subtitle: {
                    display: true,
                    text: 'total cases 121380, new cases 2345, new deaths 3452'
                }
            }
        }
    };

    myPie = new Chart(
        document.getElementById('my-pie'),
        config
    );
}

getData()

function merge(names, names2, mergeTo) {
    for(let countryData of names) {
        for(let covidData of names2) {
            if(covidData.code === countryData.code) {
                covidData.name = countryData.name;
                covidData.region = countryData.region;
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
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {button.addEventListener("click", buttonEvent)})
}

function addEventToContinents() {
    const continents = document.querySelector("#select-continents");
    continents.addEventListener("change", selectContinentEvent);
}

function selectContinentEvent(event) {
    if(state.isPieDisplay) replaceCharts();
    state.isPieDisplay = false;
    hideAndShowButtons();
    switch (event.target.value) {
        case "americas":
            continentsEvent("Americas");
            break;
        case "africa":
            continentsEvent("Africa");
            break;
        case "asia":
            continentsEvent("Asia");
            break;
        case "europe":
            continentsEvent("Europe");
            break;
        case "oceania":
            continentsEvent("Oceania");
            break;
        case "world":
            continentsEvent("World");
            break; 
    }
}

function buttonEvent(event) {
    colorBorder(event.target);
    switch (event.target.getAttribute("id")) {
        // case "americas-btn":
        //     continentsEvent("Americas");
        //     break;
        // case "africa-btn":
        //     continentsEvent("Africa");
        //     break;
        // case "asia-btn":
        //     continentsEvent("Asia");
        //     break;
        // case "europe-btn":
        //     continentsEvent("Europe");
        //     break;
        // case "oceania-btn":
        //     continentsEvent("Oceania");
        //     break;
        // case "world-btn":
        //     continentsEvent("World");
        //     break;
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
    let filtered = filterNamesByRegion(fullData, continent);;
    if(continent === "World") {
        filtered = fullData;
    }
    console.log(filtered);
    updateChart(myChart ,filterNames(filtered), filterNums(filtered, state.chartDisplay.field), `${continent} - ${state.chartDisplay.field}`);
    updateState(continent, state.chartDisplay.field, filterNames(filtered), filterNums(filtered, state.chartDisplay.field));
    updateCountrys(filterNames(filtered), true);
}

function fieldsEvent(field) {
    let filtered = filterNamesByRegion(fullData, state.chartDisplay.continent);;
    if(state.chartDisplay.continent === "World") {
        filtered = fullData;
    }
    updateChart(myChart ,state.dataDisplay.names, filterNums(filtered, field), `${state.chartDisplay.continent} - ${field}`);
    updateState(state.chartDisplay.continent, field, state.dataDisplay.names, filterNums(filtered, field));
}

function removeSpinner() {
    document.querySelector(".spinner-container").classList.add("none");
    if(state.isPieDisplay) {
        document.querySelector("#pie-container").classList.remove("none");
    } else {
        document.querySelector("#chart-container").classList.remove("none");
    }
}

function addSpinner() {
    document.querySelector(".spinner-container").classList.remove("none");;
    document.querySelector("#chart-container").classList.add("none");
    document.querySelector("#pie-container").classList.add("none");
}
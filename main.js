// Copyright Madhav Dhall 2021
const mainDetailsApi = "https://api.apify.com/v2/key-value-stores/toDWvRj1JpTXiM8FF/records/LATEST?disableRedirect=true"
const extraDetailsApi = "https://api.covid19india.org/v4/min/data.min.json"

// get extra details like population, vaccinated etc 
const extraDetails = async () => {
    const rawData = await fetch(extraDetailsApi)
    const data = await rawData.json()

    return data
}

const districtData = async () => {
    try {
        const rawData = await fetch("https://api.covid19india.org/v2/state_district_wise.json")
        const data = await rawData.json()
        return data
    } catch (error) {
        console.log(error);
    }
}

// short codes of states required to get extra details 
const stateCodes = {
    AN: "Andaman and Nicobar Islands",
    AP: "Andhra Pradesh",
    AR: "Arunachal Pradesh",
    AS: "Assam",
    BR: "Bihar",
    CH: "Chandigarh",
    CT: "Chhattisgarh",
    DN: "Dadra and Nagar Haveli and Daman and Diu",
    DL: "Delhi",
    GA: "Goa",
    GJ: "Gujarat",
    HR: "Haryana",
    HP: "Himachal Pradesh",
    JK: "Jammu and Kashmir",
    JH: "Jharkhand",
    KA: "Karnataka",
    KL: "Kerala",
    LA: "Ladakh",
    LD: "Lakshadweep",
    MP: "Madhya Pradesh",
    MH: "Maharashtra",
    MN: "Manipur",
    ML: "Meghalaya",
    MZ: "Mizoram",
    NL: "Nagaland",
    OR: "Odisha",
    PY: "Puducherry",
    PB: "Punjab",
    RJ: "Rajasthan",
    SK: "Sikkim",
    TN: "Tamil Nadu",
    TG: "Telengana",
    TR: "Tripura",
    UP: "Uttar Pradesh",
    UT: "Uttarakhand",
    WB: "West Bengal"
}

// format the number with commas 
const formatNo = (data) => {
    if (typeof data === "number") {
        return data.toLocaleString('en-IN')
    } else {
        return data
    }
}

// short a number with k, l, cr 
const convertToSymbol = (num) => {
    if (typeof num === "number") {
        const digits = (num.toString()).length

        const symbol = {
            4: "K",
            6: "L",
            8: "Cr"
        }
        if (digits > 9) {
            const showNo = (num / 10 ** (digits - (digits - 7))).toFixed(1)

            const decimals = showNo - Math.trunc(showNo)
            return (decimals > 0 ? showNo : Math.trunc(showNo)) + symbol[digits - (digits - 8)]
        }
        else if (digits > 3) {
            if (symbol[digits] === undefined) {
                const showNo = (num / 10 ** (digits - 2)).toFixed(1)

                const decimals = showNo - Math.trunc(showNo)
                return (decimals > 0 ? showNo : Math.trunc(showNo)) + symbol[digits - 1]
            } else {
                const showNo = (num / 10 ** (digits - 1)).toFixed(1)

                const decimals = showNo - Math.trunc(showNo)
                return (decimals > 0 ? showNo : Math.trunc(showNo)) + symbol[digits]
            }
        }
        else {
            return num
        }
    } else {
        return num
    }
}

// check if something is not a number 
const checkNo = (data) => {
    if (data === "NaN" || data === "NaN%") {
        return "ND"
    } else {
        return data
    }
}

// get main details 
const mainDetails = async () => {
    try {
        const rawData = await fetch(mainDetailsApi)
        const data = await rawData.json()

        // show last updated time 
        const lastUpdatedAt = new Date(data.lastUpdatedAtApify)
        document.getElementById("asOn").innerHTML = lastUpdatedAt

        // show india statistics in cards 
        const keys = ["activeCases", "activeCasesNew", "deaths", "deathsNew", "totalCases", "recovered", "recoveredNew", "previousDayTests", "tested", "vaccinated", "population", "activePercentageS", "fatalityPercentS", "positivePercentS", "recoveryRate"]

        // rates ie percentages 
        const rates = {
            activePercentageS: (data.activeCases / data.totalCases * 100).toFixed(2) + '%',

            fatalityPercentS: (data.deaths / data.totalCases * 100).toFixed(2) + "%",

            positivePercentS: (data.totalCases / (await extraDetails()).TT.total.tested * 100).toFixed(2) + "%",
            recoveryRate: (data.recovered / data.totalCases * 100).toFixed(2) + "%"
        }

        // full data with main, extra details and rates 
        const fullData = {
            ...data,
            ...(await extraDetails()).TT.meta,
            ...(await extraDetails()).TT.total,
            ...rates
        }

        keys.forEach((key) => {
            document.getElementById(key).insertAdjacentText("afterbegin", fullData[key].toLocaleString('en-IN'))
        })

        // show states data in table 
        data.regionData.forEach(async (stateData) => {
            try {
                const statecodes = Object.keys(stateCodes)
                const states = Object.values(stateCodes)

                const code = statecodes[states.indexOf(stateData.region)]

                const extraData = (await extraDetails())[code]
                const { tested, vaccinated } = extraData.total
                const population = extraData.meta.population

                const distExtraDetails = extraData.districts

                const { region, totalInfected, newInfected, deceased, newDeceased, recovered, newRecovered } = stateData

                const confirmed = totalInfected + deceased + recovered

                const activePercentage = totalInfected / confirmed * 100
                const activePercentageS = activePercentage.toFixed(1) + '%'

                const fatalityPercent = deceased / confirmed * 100
                const fatalityPercentS = fatalityPercent.toFixed(1) + "%"

                const positivePercent = confirmed / tested * 100
                const positivePercentS = positivePercent.toFixed(1) + "%"

                const recoveryRate = recovered / confirmed * 100
                const recoveryRateS = recoveryRate.toFixed(1) + "%"

                const showThis = [
                    {
                        data: region
                    },
                    {
                        data: formatNo(confirmed)
                    },
                    {
                        data: formatNo(totalInfected),
                        increase: formatNo(newInfected),
                        color: "primary"
                    },
                    {
                        data: formatNo(recovered),
                        increase: formatNo(newRecovered),
                        color: "success"
                    },
                    {
                        data: formatNo(deceased),
                        increase: formatNo(newDeceased),
                        color: "danger"
                    },
                    {
                        data: convertToSymbol(tested),
                        title: tested
                    },
                    {
                        data: convertToSymbol(vaccinated),
                        title: vaccinated
                    },
                    {
                        data: activePercentageS,
                        title: activePercentage
                    },
                    {
                        data: recoveryRateS,
                        title: recoveryRate
                    },
                    {
                        data: fatalityPercentS,
                        title: fatalityPercent
                    },
                    {
                        data: positivePercentS,
                        title: positivePercent
                    },
                    {
                        data: convertToSymbol(population),
                        title: population,
                    }
                ]

                const elem = `<tr id="${code}"></tr>`
                document.getElementById("statesData").insertAdjacentHTML("beforeend", elem)

                // button to expand the state for districts data 
                const expandBtn = `<td><button class="expand fas fa-chevron-down" onclick="expandState('${code}', this)"></button></td>`
                document.getElementById(code).insertAdjacentHTML("afterbegin", expandBtn)

                // print tds 
                showThis.forEach((show) => {
                    show.title !== undefined ? title = ` title="${show.title}"` : title = ""
                    show.color !== undefined ? increase = `<i class="text-${show.color} fas fa-arrow-up">${show.increase}</i>` : increase = ""

                    const html = `<td${title}>${show.data} ${increase}</td>`

                    document.getElementById(code).insertAdjacentHTML("beforeend", html)
                })

                // find districts data 
                const distData = (await districtData()).find((state) => state.statecode === code).districtData

                // print districts data 
                distData.forEach((dist, i) => {
                    dist.notes !== "" ? note = "OD" : note = ""

                    const { district, confirmed, active, recovered, deceased } = dist

                    const distExtra = distExtraDetails[district]
                    if (distExtra !== undefined) {
                        distExtra.total.tested !== undefined ? tests = distExtra.total.tested : tests = "ND";

                        distExtra.meta !== undefined && distExtra.meta.population !== undefined ? people = distExtra.meta.population : people = "ND";
                    } else {
                        tests = "ND"
                        people = "ND"
                    }

                    // rates for districts 
                    const activePercentage = active / confirmed * 100
                    const activePercentageS = activePercentage.toFixed(1) + '%'

                    const fatalityPercent = deceased / confirmed * 100
                    const fatalityPercentS = fatalityPercent.toFixed(1) + "%"

                    const positivePercent = confirmed / tests * 100
                    const positivePercentS = positivePercent.toFixed(1) + "%"

                    const recoveryRate = recovered / confirmed * 100
                    const recoveryRateS = recoveryRate.toFixed(1) + "%"

                    const showThis = [
                        {
                            data: note
                        },
                        {
                            data: district
                        },
                        {
                            data: formatNo(confirmed)
                        },
                        {
                            data: formatNo(active)
                        },
                        {
                            data: formatNo(recovered)
                        },
                        {
                            data: formatNo(deceased)
                        },
                        {
                            data: convertToSymbol(tests),
                            title: tests
                        },
                        {
                            data: "ND"
                        },
                        {
                            data: checkNo(activePercentageS),
                            title: checkNo(activePercentage)
                        },
                        {
                            data: checkNo(recoveryRateS),
                            title: checkNo(recoveryRate)
                        },
                        {
                            data: checkNo(fatalityPercentS),
                            title: checkNo(fatalityPercent)
                        },
                        {
                            data: checkNo(positivePercentS),
                            title: checkNo(positivePercent)
                        },
                        {
                            data: convertToSymbol(people),
                            title: people,
                        }
                    ]

                    // start printing districts data 
                    const elem = `<tr class="${code}NestedTable d-none" id="${district}${i}${code}tr"></tr>`
                    document.getElementById(code).insertAdjacentHTML("afterend", elem)

                    showThis.forEach((show) => {
                        show.title !== undefined ? title = ` title="${show.title}"` : title = ""

                        const html = `<td${title}>${show.data} ${increase}</td>`

                        document.getElementById(district + i + code + "tr").insertAdjacentHTML("beforeend", html)
                    })
                })
            } catch (e) {
                console.log(e);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

// expand the state to get districts' data 
const expandState = (state, t) => {
    t.classList.toggle("fa-chevron-down")
    t.classList.toggle("fa-chevron-up")

    const dists = Array.from(document.getElementsByClassName(`${state}NestedTable`))

    dists.forEach((td) => {
        td.classList.toggle("d-none")
    })
}

mainDetails()
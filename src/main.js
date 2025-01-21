function createSPARQLQuery(input, goalLang, startLang) {
    
    return `SELECT distinct ?item ?itemLabelGoallang ?itemAltLabel ?itemDescription ?article WHERE{ 
    ?item rdfs:label|skos:altLabel "${input}"@${startLang}.
    OPTIONAL {?item rdfs:label ?itemLabelGoallang.
        FILTER (lang(?itemLabelGoallang) = "${goalLang}")}
    OPTIONAL {?item schema:description ?itemDescription.
        FILTER (lang(?itemDescription) = "${goalLang}")}
    OPTIONAL {?item skos:altLabel ?itemAltLabel.
        FILTER (lang(?itemAltLabel) = "${goalLang}")}
    OPTIONAL {
        ?article schema:about ?item ;
            schema:inLanguage "${goalLang}" .
        FILTER (SUBSTR(str(?article), 1, 25) = "https://${goalLang}.wikipedia.org/")}
    ?item wdt:P2579 wd:Q199655.
    } LIMIT 20`;
}

/*
var old_query = `SELECT distinct ?item ?itemLabelGoallang ?itemAltLabel ?itemDescription ?article WHERE{ 
    ?item rdfs:label|skos:altLabel "${input}"@de.
    OPTIONAL {?item rdfs:label ?itemLabelGoallang.
        FILTER (lang(?itemLabelGoallang) = "${lang}")}
    OPTIONAL {?item skos:altLabel ?itemAltLabel.
        FILTER (lang(?itemAltLabel) = "${lang}")}
    OPTIONAL {
        ?article schema:about ?item ;
            schema:inLanguage "${lang}" .
        FILTER (SUBSTR(str(?article), 1, 25) = "https://${lang}.wikipedia.org/")}
    ?item wdt:P2579 wd:Q199655.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". } 
    } LIMIT 20`;
*/

function showOutputs(output, results){
    const results_show = document.getElementById("output");
    const results_wrds_arr = [];
    for (const result of results) {
        results_wrds_arr.push(result.itemLabelGoallang.value);
        if (result.itemAltLabel) {
            results_wrds_arr.push(result.itemAltLabel.value);
        }
    }
    // erase duplicates in results_wrds_arr
    const joinedResults = Array.from(new Set(results_wrds_arr)).join(", ");

    // add description and wikipedia link
    let result_desc;
    let result_wikilink;
    if (results[0].itemDescription) {
        result_desc = results[0].itemDescription.value;
    } else {
        result_desc = output.secondRowContent;
    }
    if (results[0].article) {
        result_wikilink = results[0].article.value;
    } else {
        result_wikilink = output.thirdRowContent;
    }

    // create table contents on html
    const table = document.createElement("table");
    results_show.appendChild(table);
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    // 1st row - translations
    const tr1 = document.createElement("tr");
    const th1 = document.createElement("th");
    th1.setAttribute("id", "output1stRow");
    th1.scope = "row";
    th1.textContent = output.firstRow;
    tr1.appendChild(th1);

    const td1 = document.createElement("td");
    td1.textContent = joinedResults;
    tr1.appendChild(td1);

    tbody.appendChild(tr1);

    // 2nd row - description
    const tr2 = document.createElement("tr");
    const th2 = document.createElement("th");
    th2.setAttribute("id", "output2ndRow");
    th2.scope = "row";
    
    th2.textContent = output.secondRow;
    tr2.appendChild(th2);

    const td2 = document.createElement("td");
    td2.textContent = result_desc;
    tr2.appendChild(td2);
    tbody.appendChild(tr2);

    // 3rd row - wikipedia link
    const tr3 = document.createElement("tr");
    const th3 = document.createElement("th");
    th3.setAttribute("id", "output3rdRow");
    th3.scope = "row";
    th3.textContent = output.thirdRow;
    tr3.appendChild(th3);

    const td3 = document.createElement("td");
    td3.setAttribute("id", "wikiLink");
    td3.setAttribute("data-resultFlag", "false");
    if (result_wikilink.includes("https://")) {
        
        td3.setAttribute("data-resultFlag", "true");
        const a = document.createElement("a");
        a.href = result_wikilink;
        a.target = "_blank";
        a.textContent = result_wikilink;
        td3.appendChild(a);
    } else { 
        td3.textContent = result_wikilink;
    }
    tr3.appendChild(td3);
    tbody.appendChild(tr3);

    // set flag in the output div to true
    results_show.setAttribute("data-flag", "true");
}


document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();
    const results_show = document.getElementById("output");
    results_show.innerHTML = "";

    const input = document.getElementById("myInput").value;
    const goalLang = document.getElementById("goalLanguage").value;
    const startLang = document.getElementById("startLanguage").value;
    const languageSelector = document.getElementById("languageSelector");
    const lang = languageSelector.value;

    const query = createSPARQLQuery(input, goalLang, startLang);
    console.log(query);
    var resultList = [];
    let langProcess = fetch(`lang/${lang}.json`);
    let wdProcess = fetch("https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + encodeURIComponent(query), {
        headers: {
            Accept: "application/sparql-results+json"
        }
    });

    Promise.all([langProcess, wdProcess])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(dataArray => {
        dataArray.forEach(data => {
            resultList.push(data);
        });
        
        let output = resultList[0].output;
        //console.log(output);
        let results = resultList[1].results.bindings;
        if (results.length === 0) {
            alert(output.errorMessage);
            return;
        }
        showOutputs(output, results);
    })
    .catch(error => {
        console.error(error);
    });
});


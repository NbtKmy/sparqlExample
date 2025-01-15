function createSPARQLQuery(input, lang) {
    return `SELECT distinct ?item ?itemLabelGoallang ?itemAltLabel ?itemDescription ?article WHERE{ 
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
}


document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();
    const results_show = document.getElementById("output");
    results_show.innerHTML = "";

    const input = document.getElementById("myInput").value;
    const lang = document.getElementById("language").value;
    
    const query = createSPARQLQuery(input, lang);
    console.log(query);
    fetch("https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + encodeURIComponent(query), {
        headers: {
            Accept: "application/sparql-results+json"
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            const results = data.results.bindings;
            if (results.length === 0) {
                alert("No results found");
                return;
            }
            
            let results_wrds_arr = [];
            for (const result of results) {
                results_wrds_arr.push(result.itemLabelGoallang.value);
                if (result.itemAltLabel) {
                    results_wrds_arr.push(result.itemAltLabel.value);
                }
            }
            // erase duplicates in results_wrds_arr
            results_wrds_arr = Array.from(new Set(results_wrds_arr));

            // add description and wikipedia link
            if (results[0].itemDescription) {
                result_desc = results[0].itemDescription.value;
            } else {
                result_desc = "Keine Beschreibung vorhanden";
            }
            if (results[0].article) {
                result_wikilink = results[0].article.value;
            } else {
                result_wikilink = "Kein Wikipedia-Artikel vorhanden";
            }

            // create table contents on html
            const table = document.createElement("table");
            results_show.appendChild(table);
            const tbody = document.createElement("tbody");
            table.appendChild(tbody);

            const tr1 = document.createElement("tr");
            const th1 = document.createElement("th");
            th1.scope = "row";
            th1.textContent = "Übersetzung:";
            tr1.appendChild(th1);

            const td1 = document.createElement("td");
            const joinedResults = results_wrds_arr.join(", ");
            td1.textContent = joinedResults;
            tr1.appendChild(td1);

            tbody.appendChild(tr1);

            const tr2 = document.createElement("tr");
            const th2 = document.createElement("th");
            th2.scope = "row";
            th2.textContent = "Beschreibung:";
            tr2.appendChild(th2);

            const td2 = document.createElement("td");
            td2.textContent = result_desc;
            tr2.appendChild(td2);
            tbody.appendChild(tr2);

            const tr3 = document.createElement("tr");
            const th3 = document.createElement("th");
            th3.scope = "row";
            th3.textContent = "Wikipedia-Artikel:";
            tr3.appendChild(th3);
            
            const td3 = document.createElement("td");
            if (result_wikilink === "Kein Wikipedia-Artikel vorhanden") {
                td3.textContent = result_wikilink;
                
            } else { 
            const a = document.createElement("a");
            a.href = result_wikilink;
            a.target = "_blank";
            a.textContent = result_wikilink;
            td3.appendChild(a);
            }
            tr3.appendChild(td3);
            tbody.appendChild(tr3);
            
            
        }).catch(error => {
            console.error(error);
        });
});


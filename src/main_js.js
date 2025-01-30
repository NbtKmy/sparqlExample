function createSPARQLQueryJS(input) {
    
    return `SELECT DISTINCT ?image ?itemLabel ?url WHERE {
	?pers rdfs:label "${input}" ;
        rdf:type type:Person .
    OPTIONAL {?pers schema:image ?image .}
    OPTIONAL { ?item schema:creator chname:${input} ;
        rdfs:label ?itemLabel ;
        jps:sourceInfo [schema:url ?url].}
}
LIMIT 20`;
}

function showOutputsJS(results) {
    const results_container = document.getElementById("output_js");
    let img_link = results[0].image.value;
    
    const img = document.createElement("img");
    if (img_link) {
        img.src = img_link;
    } else {
        img.src = "./img/ei-crying_face.svg";
    }
    
    results_container.appendChild(img);
}

document.getElementById("form_js").addEventListener("submit", function(e) {
    e.preventDefault();
    const results_show = document.getElementById("output_js");
    results_show.innerHTML = "";

    const input = document.getElementById("input_js").value;

    const query = createSPARQLQueryJS(input);
    console.log(query);
    
    const spinner = document.getElementById("spinner");
    spinner.style.display = "block";

    fetch("https://jpsearch.go.jp/rdf/sparql?default-graph-uri=&query=" + encodeURIComponent(query), {
        headers: {
        Accept: "application/sparql-results+json"
        }})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let results = data.results.bindings;
            if (results.length === 0) {
                alert("見つかりませんでした。別の名前でお試しください。");
                return;
            } else {
                showOutputsJS(results);
            }
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
            spinner.style.display = "none";
            
        });
});


function createSPARQLQuery(input) {
    return `SELECT distinct ?item ?itemLabel ?itemDescription WHERE{ 
    ?item ?label "${input}"@de. 
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". } 
    } LIMIT 10`;
}


document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();
    const input = document.getElementById("myInput").value;
    
    const query = createSPARQLQuery(input);
    console.log(query);
    fetch("https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + encodeURIComponent(query), {
        headers: {
            Accept: "application/sparql-results+json"
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            const results = data.results.bindings;
            const list = document.getElementById("output");
            list.innerHTML = "";
            for (const result of results) {
                const option = document.createElement("div");
                option.innerHTML = result.itemLabel.value;
                option.addEventListener("click", function() {
                    document.getElementById("myInput").value = result.itemLabel.value;
                    list.innerHTML = "";
                });
                list.appendChild(option);
            }
        }).catch(error => {
            console.error(error);
        });
});


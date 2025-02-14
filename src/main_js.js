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



function showOutputsJS(input, results) {
    
    // 作者の名前を取得
    const h2 = document.createElement("h2");
    h2.textContent = input;
    h2.setAttribute("class", "creator_name");

    const img = document.createElement("img");
    // 作者の画像を取得
    if (results[0].image) {
        const img_link = results[0].image.value;
        img.src = img_link;
    } else {
        img.src = "./img/ei-crying_face.svg";
    }
    
    // 作品情報を取得
    const h3 = document.createElement("h3");
    h3.textContent = "作品リスト";
    h3.setAttribute("class", "works_list_title");

    let workslist = "";
    results.map(result => {
        workslist += `<li><a href='${result.url.value}' target='_blank' rel='noopener noreferrer'>${result.itemLabel.value}</a></li>`;
    });
    const ul = document.createElement("ul");
    ul.innerHTML = workslist;
    ul.setAttribute("class", "works_list");

    // 以下結果を表示
    const results_container = document.getElementById("output_js");
    results_container.appendChild(h2);
    results_container.appendChild(img);
    results_container.appendChild(h3);
    results_container.appendChild(ul);

}

document.getElementById("form_js").addEventListener("submit", function(e) {
    e.preventDefault();
    const results_show = document.getElementById("output_js");
    results_show.innerHTML = "";

    const input = document.getElementById("input_js").value;

    const query = createSPARQLQueryJS(input);
    
    const spinner = document.getElementById("spinner");
    spinner.style.display = "block";

    fetch("https://jpsearch.go.jp/rdf/sparql?default-graph-uri=&query=" + encodeURIComponent(query), {
        headers: {
        Accept: "application/sparql-results+json"
        }})
        .then(response => response.json())
        .then(data => {
            let results = data.results.bindings;
            // console.log(results);
            if (results.length === 0) {
                alert("見つかりませんでした。別の名前でお試しください。");
                return;
            } else {
                showOutputsJS(input, results);
            }
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
            spinner.style.display = "none";
            
        });
});


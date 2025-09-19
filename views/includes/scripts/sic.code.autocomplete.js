<script>
  function addAutocompleteEventListener() {
    document.addEventListener('DOMContentLoaded', () => {
        const searchSicCodes = window.searchSicCodes || [];

        accessibleAutocomplete({
            element: document.querySelector('#sic-code-autocomplete'), 
            id: 'sic-code-input', 
            name: 'code-display', 
            source: (query, populateResults) => {
                const results = searchSicCodes.filter(sc => 
                    sc.sic_code.includes(query) ||
                    sc.sic_description.toLowerCase().includes(query.toLowerCase())
                ); 
                populateResults(
                    results.map(sc => `${sc.sic_code} - ${sc.sic_description}`)
                );
            }, 
            onConfirm: selected => {
                const hiddenInput = document.getElementById('hidden-sic-code'); 
                const addButton = document.getElementById('add-sic-code-button'); 

                if(hiddenInput && selected) {
                    hiddenInput.value = selected.split(' - ')[0]; 

                    if(addButton) {
                        addButton.disabled = false;
                    }
                }
            }
        }); 

        const listenForInput = setInterval(() => {
            const inputAutocomplete = document.querySelector("#sic-code-autocomplete input");
            const hiddenInput = document.getElementById('hidden-sic-code'); 
            const addButton = document.getElementById('add-sic-code-button'); 

            if(inputAutocomplete) {
                clearInterval(listenForInput); 

                inputAutocomplete.addEventListener("input", () => {
                    if(!inputAutocomplete.value.trim()) {
                        hiddenInput.value = ""; 
                        addButton.disabled = true; 
                    }
                });
            }
        }, 100); 
    })
  };


  addAutocompleteEventListener(); 
</script>

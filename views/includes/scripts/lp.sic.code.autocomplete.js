<script>
  function addAutocompleteEventListener() {
    document.addEventListener('DOMContentLoaded', () => {
        const dummySearchSicCodes = window.searchSicCodes || [];

        accessibleAutocomplete({
            element: document.querySelector('#sic-code-autocomplete'), 
            id: 'sic-code-input', 
            name: 'code-display', 
            source: (query, populateResults) => {
                const results = dummySearchSicCodes.filter(sc => 
                    sc.code.includes(query) ||
                    sc.description.toLowerCase().includes(query.toLowerCase())
                ); 
                populateResults(
                    results.map(sc => `${sc.code} - ${sc.description}`)
                );
            }, 
            onConfirm: selected => {
                const hiddenInput = document.getElementById('hidden-sic-code'); 
                const addButton = document.getElementById('add-sic-code-button'); 

                if(hiddenInput && selected) {
                    hiddenInput.value = selected.split('-')[0]; 

                    if(addButton) {
                        addButton.disabled = false;
                    }
                }
            }
        })
    })
  };


  addAutocompleteEventListener(); 
</script>

<script>
  function addSicCodeEventListener() {
    document.addEventListener("DOMContentLoaded", () => {
      const input = document.getElementById("sic-code-input");
      const button = document.getElementById("add-sic-code-button");
      const summaryList = document.querySelector(".govuk-summary-list");

      if (input && button && summaryList) {
        input.addEventListener("input", () => {
          button.disabled = input.value.trim().length === 0;
        });

        button.addEventListener("click", () => {
          const code = input.value.trim();
          if (!code) return;

          input.form.submit();
          const description = "Dummy SIC code description";

          const newRow = document.createElement("div");
          newRow.classList.add("govuk-summary-list__row");
          newRow.innerHTML = `
            <dt class="govuk-summary-list__key">${code}</dt>
            <dd class="govuk-summary-list__value">${description}</dd>
            <dd class="govuk-summary-list__actions">
              <form action="{{ urls.LP_SIC_CODE_SUMMARY_PATH }}/${encodeURIComponent(code)}/remove" method="POST">
              <input type="hidden" name="_csrf" value="${document.querySelector('input[name="_csrf"]').value}" />
                  <button type="submit" class="govuk-link">{{ i18n.SICCSTableRemoveButton }}</button>
              </form>
            </dd>
          `;

          summaryList.appendChild(newRow);
          input.value = "";
          button.disabled = true;
        });
      }
    })
  };


  addSicCodeEventListener(); 
</script>

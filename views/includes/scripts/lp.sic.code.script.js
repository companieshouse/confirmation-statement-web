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
              <a class="govuk-link" href="{{ urls.LP_SIC_CODE_SUMMARY_PATH }}/remove?remove=${encodeURIComponent(code)}">{{ i18n.SICCSTableRemoveButton }}</a>
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

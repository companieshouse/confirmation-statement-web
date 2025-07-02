declare module 'accessible-autocomplete' {
  interface AutocompleteOptions<T = any> {
    element: HTMLElement;
    id?: string;
    source: (query: string, populateResults: (results: T[]) => void) => void;
    showAllValues?: boolean;
    minLength?: number;
    templates?: {
      inputValue?: (result: any) => string;
      suggestion?: (result: any) => string;
    };
    onConfirm?: (selected: T) => void;
    displayMenu?: 'overlay' | 'inline';
    confirmOnBlur?: boolean;
    autoselect?: string;
  }

  function accessibleAutocomplete(options: AutocompleteOptions): void;

  export = accessibleAutocomplete;
}
